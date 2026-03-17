from fastapi import APIRouter, Depends, HTTPException, Query

from ..core.auth import require_admin
from ..services.registry import get_manageable
from ..services.systemd import get_logs, restart_service

router = APIRouter(
    prefix="/api/services",
    tags=["services"],
    dependencies=[Depends(require_admin)],
)


def _get_manageable_ids() -> set[str]:
    return set(get_manageable().keys())


@router.get("/{service_id}/logs")
async def service_logs(service_id: str, lines: int = Query(default=50, ge=1, le=200)):
    if service_id not in _get_manageable_ids():
        raise HTTPException(404, f"Unknown service: {service_id}")
    return await get_logs(service_id, lines)


@router.post("/{service_id}/restart")
async def service_restart(service_id: str):
    if service_id not in _get_manageable_ids():
        raise HTTPException(404, f"Unknown service: {service_id}")
    return await restart_service(service_id)
