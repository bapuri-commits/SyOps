from fastapi import APIRouter, Depends

from ..core.auth import require_auth
from ..services.ssl_check import check_ssl

router = APIRouter(prefix="/api/ssl", tags=["ssl"], dependencies=[Depends(require_auth)])


@router.get("")
def ssl_info():
    return check_ssl()
