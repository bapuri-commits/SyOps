from fastapi import APIRouter, HTTPException

from ..services.health import check_all, check_quickdrop, check_bottycoon_bot, check_news_agent, check_nginx

router = APIRouter(prefix="/api/health", tags=["health"])

_checkers = {
    "quickdrop": check_quickdrop,
    "bottycoon-bot": check_bottycoon_bot,
    "news-agent": check_news_agent,
    "nginx": check_nginx,
}


@router.get("")
async def health_all():
    """전체 서비스 헬스체크 (공개)"""
    return await check_all()


@router.get("/{service_id}")
async def health_one(service_id: str):
    """개별 서비스 헬스체크 (공개)"""
    checker = _checkers.get(service_id)
    if checker is None:
        raise HTTPException(404, f"Unknown service: {service_id}")
    return await checker()
