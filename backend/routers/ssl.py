from fastapi import APIRouter, Depends

from ..core.auth import get_current_user
from ..services.ssl_check import check_ssl

router = APIRouter(prefix="/api/ssl", tags=["ssl"], dependencies=[Depends(get_current_user)])


@router.get("")
def ssl_info():
    return check_ssl()
