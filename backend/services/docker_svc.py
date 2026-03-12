from __future__ import annotations

import asyncio
import sys


async def get_container_logs(container_name: str, lines: int = 50) -> dict:
    if sys.platform == "win32":
        return {"service": container_name, "available": False, "logs": "Windows — docker 사용 불가"}

    proc = await asyncio.create_subprocess_exec(
        "docker", "logs", "--tail", str(lines), container_name,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await proc.communicate()
    output = stdout.decode() + stderr.decode()
    return {
        "service": container_name,
        "available": proc.returncode == 0,
        "logs": output,
    }


async def restart_container(container_name: str) -> dict:
    if sys.platform == "win32":
        return {"service": container_name, "success": False, "detail": "Windows — docker 사용 불가"}

    proc = await asyncio.create_subprocess_exec(
        "docker", "restart", container_name,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    _, err = await proc.communicate()
    success = proc.returncode == 0
    return {
        "service": container_name,
        "success": success,
        "detail": "Restarted" if success else err.decode(),
    }
