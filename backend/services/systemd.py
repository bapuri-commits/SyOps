from __future__ import annotations

import asyncio
import sys

from .docker_svc import get_container_logs, restart_container
from .registry import RunType, get_manageable


async def get_logs(service_id: str, lines: int = 50) -> dict:
    registry = get_manageable()
    entry = registry.get(service_id)
    if not entry:
        return {"service": service_id, "available": False, "logs": f"Unknown: {service_id}"}

    if entry.run_type == RunType.DOCKER:
        return await get_container_logs(entry.manage_unit, lines)

    return await _systemd_logs(service_id, entry.manage_unit, lines)


async def restart_service(service_id: str) -> dict:
    registry = get_manageable()
    entry = registry.get(service_id)
    if not entry:
        return {"service": service_id, "success": False, "detail": f"Unknown: {service_id}"}

    if entry.run_type == RunType.DOCKER:
        return await restart_container(entry.manage_unit)

    return await _systemd_restart(service_id, entry.manage_unit)


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
        "sudo", "systemctl", "restart", unit,
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
