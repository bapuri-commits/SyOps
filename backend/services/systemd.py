from __future__ import annotations

import asyncio
import sys

ALLOWED_SERVICES = {
    "quickdrop": "quickdrop.service",
    "nginx": "nginx.service",
}


async def get_logs(service_id: str, lines: int = 50) -> dict:
    unit = ALLOWED_SERVICES.get(service_id)
    if not unit:
        return {"service": service_id, "available": False, "logs": f"Unknown: {service_id}"}

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


async def restart_service(service_id: str) -> dict:
    unit = ALLOWED_SERVICES.get(service_id)
    if not unit:
        return {"service": service_id, "success": False, "detail": f"Unknown: {service_id}"}

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
