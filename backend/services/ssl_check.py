import socket
import ssl
import time
from datetime import datetime, timezone

_cache: dict | None = None
_cache_ts: float = 0
_CACHE_TTL = 3600


def check_ssl(hostname: str = "syworkspace.cloud", port: int = 443) -> dict:
    global _cache, _cache_ts

    if _cache and (time.monotonic() - _cache_ts) < _CACHE_TTL:
        return _cache

    result = _fetch_ssl(hostname, port)
    _cache = result
    _cache_ts = time.monotonic()
    return result


def _fetch_ssl(hostname: str, port: int) -> dict:
    sock = socket.socket()
    try:
        ctx = ssl.create_default_context()
        with ctx.wrap_socket(sock, server_hostname=hostname) as s:
            s.settimeout(5.0)
            s.connect((hostname, port))
            cert = s.getpeercert()
    except Exception as e:
        sock.close()
        return {"hostname": hostname, "status": "error", "detail": str(e)}

    not_after_str = cert.get("notAfter", "")
    if not not_after_str:
        return {"hostname": hostname, "status": "error", "detail": "인증서에 만료일 없음"}

    not_after = datetime.strptime(not_after_str, "%b %d %H:%M:%S %Y %Z").replace(
        tzinfo=timezone.utc
    )
    days_left = (not_after - datetime.now(timezone.utc)).days

    if days_left > 30:
        level = "ok"
    elif days_left > 7:
        level = "warning"
    else:
        level = "critical"

    return {
        "hostname": hostname,
        "issuer": dict(x[0] for x in cert.get("issuer", [])),
        "not_after": not_after.isoformat(),
        "days_left": days_left,
        "status": level,
    }
