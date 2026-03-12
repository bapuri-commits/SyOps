from __future__ import annotations

import asyncio
import sys
from dataclasses import dataclass
from enum import Enum

from .docker_svc import get_container_logs, restart_container


class ServiceType(str, Enum):
    SYSTEMD = "systemd"
    DOCKER = "docker"


@dataclass
class ServiceEntry:
    type: ServiceType
    unit: str  # systemd unit name or docker container name


ALLOWED_SERVICES: dict[str, ServiceEntry] = {
    "quickdrop": ServiceEntry(ServiceType.DOCKER, "quickdrop"),
    "nginx": ServiceEntry(ServiceType.SYSTEMD, "nginx.service"),
}


async def get_logs(service_id: str, lines: int = 50) -> dict:
    entry = ALLOWED_SERVICES.get(service_id)
    if not entry:
        return {"service": service_id, "available": False, "logs": f"Unknown: {service_id}"}

    if entry.type == ServiceType.DOCKER:
        return await get_container_logs(entry.unit, lines)

    return await _systemd_logs(service_id, entry.unit, lines)


async def restart_service(service_id: str) -> dict:
    entry = ALLOWED_SERVICES.get(service_id)
    if not entry:
        return {"service": service_id, "success": False, "detail": f"Unknown: {service_id}"}

    if entry.type == ServiceType.DOCKER:
        return await restart_container(entry.unit)

    return await _systemd_restart(service_id, entry.unit)


async def _systemd_logs(service_id: str, unit: str, lines: int) -> dict:
    if sys.platform == "win32":
        return {"service": service_id, "unit": unit, "available": False, "logs": "Windows — journalctl 사용 불가"}

    proc = await asyncio.create_subprocess_exec(
        "journalctl", "-u", unit, "-n", str(lines), "--no-pager",
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, _ = await proc.communicate()
    return {
        "service": service_id,
        "unit": unit,
        "available": True,
        "logs": stdout.decode(),
    }


async def _systemd_restart(service_id: str, unit: str) -> dict:
    if sys.platform == "win32":
        return {"service": service_id, "success": False, "detail": "Windows — systemctl 사용 불가"}

    proc = await asyncio.create_subprocess_exec(
        "systemctl", "restart", unit,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    _, stderr = await proc.communicate()
    success = proc.returncode == 0
    return {
        "service": service_id,
        "unit": unit,
        "success": success,
        "detail": "Restarted" if success else stderr.decode(),
    }
