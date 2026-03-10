from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import secrets

from .config import settings

_security = HTTPBasic()


def require_auth(creds: HTTPBasicCredentials = Depends(_security)) -> str:
    correct = secrets.compare_digest(creds.password, settings.syops_password)
    if not correct:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Basic"},
        )
    return creds.username
