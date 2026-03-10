from fastapi import APIRouter, Depends

from ..core.auth import require_auth
from ..services.metrics import collect_metrics

router = APIRouter(prefix="/api/metrics", tags=["metrics"])


@router.get("", dependencies=[Depends(require_auth)])
def server_metrics():
    """서버 리소스 메트릭 (인증 필요)"""
    return collect_metrics()
