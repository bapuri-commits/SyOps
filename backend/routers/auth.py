from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from hashlib import sha256

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.auth import (
    create_access_token,
    create_refresh_token_value,
    get_current_user,
    hash_password,
    require_admin,
    verify_password,
)
from ..core.config import settings
from ..core.database import get_db
from ..models.user import RefreshToken, User

router = APIRouter(prefix="/api/auth", tags=["auth"])

REFRESH_COOKIE = "syops_refresh"
AVAILABLE_SERVICES = [
    {"id": "quickdrop", "name": "QuickDrop", "access": "private", "data_scope": "per_user"},
    {"id": "voca_drill", "name": "Voca Drill", "access": "private", "data_scope": "per_user"},
    {"id": "study", "name": "StudyHub", "access": "private", "data_scope": "shared"},
    {"id": "news-agent", "name": "News Agent", "access": "public", "data_scope": "shared"},
]


# ── Request / Response schemas ──


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenRefreshResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class CreateUserRequest(BaseModel):
    username: str
    password: str
    role: str = "user"
    allowed_services: list[str] = []


class UpdateUserRequest(BaseModel):
    is_active: bool | None = None
    role: str | None = None
    allowed_services: list[str] | None = None


class ResetPasswordRequest(BaseModel):
    new_password: str


class UserResponse(BaseModel):
    id: int
    username: str
    role: str
    is_active: bool
    allowed_services: list[str] = []

    model_config = {"from_attributes": True}


def _parse_services(raw: str) -> list[str]:
    try:
        return json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        return []


_valid_service_ids = {s["id"] for s in AVAILABLE_SERVICES if s.get("access") == "private"}


def _validate_services(services: list[str]) -> None:
    invalid = [s for s in services if s not in _valid_service_ids]
    if invalid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid service(s): {', '.join(invalid)}",
        )


def _to_user_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        username=user.username,
        role=user.role,
        is_active=user.is_active,
        allowed_services=_parse_services(user.allowed_services),
    )


# ── Helpers ──


def _hash_token(raw: str) -> str:
    return sha256(raw.encode()).hexdigest()


def _set_refresh_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=REFRESH_COOKIE,
        value=token,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=settings.refresh_token_expire_days * 86400,
        path="/api/auth",
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(key=REFRESH_COOKIE, path="/api/auth")


ACCESS_COOKIE = "syops_token"


def _set_access_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=ACCESS_COOKIE,
        value=token,
        httponly=True,
        secure=True,
        samesite="lax",
        domain=settings.cookie_domain,
        max_age=settings.access_token_expire_minutes * 60,
        path="/",
    )


def _clear_access_cookie(response: Response) -> None:
    response.delete_cookie(key=ACCESS_COOKIE, path="/", domain=settings.cookie_domain)


# ── Endpoints ──


@router.post("/login", response_model=LoginResponse)
async def login(body: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == body.username))
    user = result.scalar_one_or_none()

    if user is None or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account disabled")

    user.last_login = datetime.now(timezone.utc)

    raw_refresh = create_refresh_token_value()
    refresh_row = RefreshToken(
        user_id=user.id,
        token_hash=_hash_token(raw_refresh),
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days),
    )
    db.add(refresh_row)
    await db.commit()

    services = _parse_services(user.allowed_services)
    access = create_access_token(user.id, user.role, user.username, services)
    _set_refresh_cookie(response, raw_refresh)
    _set_access_cookie(response, access)

    return LoginResponse(access_token=access)


@router.post("/refresh", response_model=TokenRefreshResponse)
async def refresh(
    response: Response,
    syops_refresh: str | None = Cookie(None),
    db: AsyncSession = Depends(get_db),
):
    if not syops_refresh:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No refresh token")

    token_hash = _hash_token(syops_refresh)
    result = await db.execute(
        select(RefreshToken)
        .where(RefreshToken.token_hash == token_hash, RefreshToken.revoked == False)  # noqa: E712
    )
    rt = result.scalar_one_or_none()

    if rt is None or rt.expires_at < datetime.now(timezone.utc):
        _clear_refresh_cookie(response)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

    # Refresh Token Rotation
    rt.revoked = True

    user_result = await db.execute(select(User).where(User.id == rt.user_id))
    user = user_result.scalar_one_or_none()
    if user is None or not user.is_active:
        _clear_refresh_cookie(response)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

    new_raw = create_refresh_token_value()
    new_rt = RefreshToken(
        user_id=user.id,
        token_hash=_hash_token(new_raw),
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days),
    )
    db.add(new_rt)
    await db.commit()

    services = _parse_services(user.allowed_services)
    access = create_access_token(user.id, user.role, user.username, services)
    _set_refresh_cookie(response, new_raw)
    _set_access_cookie(response, access)

    return TokenRefreshResponse(access_token=access)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    response: Response,
    syops_refresh: str | None = Cookie(None),
    db: AsyncSession = Depends(get_db),
):
    if syops_refresh:
        token_hash = _hash_token(syops_refresh)
        result = await db.execute(select(RefreshToken).where(RefreshToken.token_hash == token_hash))
        rt = result.scalar_one_or_none()
        if rt:
            rt.revoked = True
            await db.commit()

    _clear_refresh_cookie(response)
    _clear_access_cookie(response)


@router.get("/me", response_model=UserResponse)
async def me(user: User = Depends(get_current_user)):
    return _to_user_response(user)


@router.get("/users/{username}", response_model=UserResponse)
async def get_user_by_username(
    username: str,
    _user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.username == username, User.is_active == True))  # noqa: E712
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return _to_user_response(user)


@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(body: CreateUserRequest, _admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    if len(body.password) < 4:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password must be at least 4 characters")

    if body.role not in ("admin", "user"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Role must be 'admin' or 'user'")

    _validate_services(body.allowed_services)

    existing = await db.execute(select(User).where(User.username == body.username))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already exists")

    user = User(
        username=body.username,
        hashed_password=hash_password(body.password),
        role=body.role,
        allowed_services=json.dumps(body.allowed_services),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    return _to_user_response(user)


@router.get("/services")
async def available_services():
    return {"services": AVAILABLE_SERVICES}


@router.get("/users", response_model=list[UserResponse])
async def list_users(_admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).order_by(User.id))
    return [_to_user_response(u) for u in result.scalars().all()]


@router.patch("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    body: UpdateUserRequest,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    if user_id == admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot modify your own account")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if body.is_active is not None:
        user.is_active = body.is_active
    if body.role is not None:
        if body.role not in ("admin", "user"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Role must be 'admin' or 'user'")
        user.role = body.role
    if body.allowed_services is not None:
        _validate_services(body.allowed_services)
        user.allowed_services = json.dumps(body.allowed_services)

    await db.commit()
    await db.refresh(user)
    return _to_user_response(user)


@router.patch("/users/{user_id}/password")
async def reset_user_password(
    user_id: int,
    body: ResetPasswordRequest,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    if len(body.new_password) < 4:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password must be at least 4 characters")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.hashed_password = hash_password(body.new_password)
    await db.commit()
    return {"ok": True}
