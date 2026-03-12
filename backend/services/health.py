from __future__ import annotations

import asyncio
import sys
from datetime import datetime, timezone
from pathlib import Path

import httpx

from .registry import HealthCheckType, get_enabled

_client: httpx.AsyncClient | None = None


def _get_client() -> httpx.AsyncClient:
    global _client
    if _client is None or _client.is_closed:
        _client = httpx.AsyncClient(timeout=5.0)
    return _client


async def close_client() -> None:
    global _client
    if _client and not _client.is_closed:
        await _client.aclose()
        _client = None


async def _check_http(service_id: str, url: str) -> dict:
    try:
        r = await _get_client().get(url)
        return {
            "id": service_id,
            "status": "up" if r.status_code < 500 else "down",
            "latency_ms": int(r.elapsed.total_seconds() * 1000),
        }
    except Exception:
        return {"id": service_id, "status": "down"}


async def _check_docker_inspect(service_id: str, container: str) -> dict:
    if sys.platform == "win32":
        return {"id": service_id, "status": "unknown", "detail": "Windows"}
    try:
        proc = await asyncio.create_subprocess_exec(
            "docker", "inspect", "-f", "{{.State.Status}}", container,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, _ = await proc.communicate()
        state = stdout.decode().strip()
        return {
            "id": service_id,
            "status": "up" if state == "running" else "down",
            "container_state": state,
        }
    except Exception:
        return {"id": service_id, "status": "unknown"}


async def _check_file_exists(service_id: str, path_str: str) -> dict:
    p = Path(path_str)
    if not p.exists():
        return {"id": service_id, "status": "down"}
    mtime = datetime.fromtimestamp(p.stat().st_mtime, tz=timezone.utc)
    return {
        "id": service_id,
        "status": "up",
        "last_updated": mtime.isoformat(),
    }


async def _check_systemctl(service_id: str, unit: str) -> dict:
    if sys.platform == "win32":
        return {"id": service_id, "status": "unknown", "detail": "Windows"}
    try:
        proc = await asyncio.create_subprocess_exec(
            "systemctl", "is-active", unit,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, _ = await proc.communicate()
        active = stdout.decode().strip() == "active"
        return {"id": service_id, "status": "up" if active else "down"}
    except Exception:
        return {"id": service_id, "status": "unknown"}


_CHECKERS = {
    HealthCheckType.HTTP: _check_http,
    HealthCheckType.DOCKER_INSPECT: _check_docker_inspect,
    HealthCheckType.FILE_EXISTS: _check_file_exists,
    HealthCheckType.SYSTEMCTL: _check_systemctl,
}


async def check_service(service_id: str) -> dict:
    from .registry import get_by_id
    svc = get_by_id(service_id)
    if not svc or not svc.enabled:
        return {"id": service_id, "status": "unknown"}
    checker = _CHECKERS.get(svc.health_check)
    if not checker:
        return {"id": service_id, "status": "unknown"}
    return await checker(svc.id, svc.health_target)


async def check_all() -> list[dict]:
    enabled = get_enabled()
    tasks = []
    for svc in enabled:
        checker = _CHECKERS.get(svc.health_check)
        if checker:
            tasks.append(checker(svc.id, svc.health_target))

    results = await asyncio.gather(*tasks, return_exceptions=True)
    out: list[dict] = []
    for r in results:
        if isinstance(r, Exception):
            out.append({"id": "error", "status": "unknown", "detail": str(r)})
        else:
            out.append(r)
    return out
