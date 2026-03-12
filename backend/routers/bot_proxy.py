"""BotTycoon API 범용 프록시.

봇 내부 API(:8400)로 요청을 전달한다.
/api/bot/health는 인증 없이 접근 가능 (헬스체크).
그 외 경로는 인증 필요.
"""

from fastapi import APIRouter, Depends, Request, Response

import httpx

from ..core.auth import get_current_user
from ..core.config import settings

router = APIRouter(prefix="/api/bot", tags=["bot"])

_BOT_URL = settings.bottycoon_api_url


async def _proxy(path: str, request: Request) -> Response:
    """봇 API로 요청을 프록시한다."""
    url = f"{_BOT_URL}/{path}"
    params = dict(request.query_params)

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            if request.method == "GET":
                resp = await client.get(url, params=params)
            elif request.method == "PATCH":
                body = await request.body()
                resp = await client.patch(url, content=body, headers={"Content-Type": "application/json"})
            else:
                resp = await client.request(request.method, url, params=params)

            return Response(
                content=resp.content,
                status_code=resp.status_code,
                media_type="application/json",
            )
        except httpx.ConnectError:
            return Response(
                content=b'{"error": "Bot API unreachable"}',
                status_code=502,
                media_type="application/json",
            )


@router.get("/health")
async def bot_health():
    """봇 헬스체크 (인증 불필요)."""
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            resp = await client.get(f"{_BOT_URL}/health")
            return Response(content=resp.content, status_code=resp.status_code, media_type="application/json")
        except httpx.ConnectError:
            return Response(
                content=b'{"status": "offline"}',
                status_code=200,
                media_type="application/json",
            )


@router.get("/{path:path}")
async def bot_proxy_get(path: str, request: Request, _user=Depends(get_current_user)):
    """봇 API GET 프록시 (인증 필요)."""
    return await _proxy(path, request)


@router.patch("/{path:path}")
async def bot_proxy_patch(path: str, request: Request, _user=Depends(get_current_user)):
    """봇 API PATCH 프록시 (인증 필요)."""
    return await _proxy(path, request)
