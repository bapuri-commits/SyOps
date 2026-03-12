from fastapi import APIRouter, HTTPException

from ..services.health import check_all, check_service
from ..services.registry import get_by_id

router = APIRouter(prefix="/api/health", tags=["health"])


@router.get("")
async def health_all():
    """전체 서비스 헬스체크 (공개)"""
    return await check_all()


@router.get("/{service_id}")
async def health_one(service_id: str):
    """개별 서비스 헬스체크 (공개)"""
    svc = get_by_id(service_id)
    if svc is None or not svc.enabled:
        raise HTTPException(404, f"Unknown service: {service_id}")
    return await check_service(service_id)
