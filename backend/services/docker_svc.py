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
    _, stderr = await proc.communicate()
    success = proc.returncode == 0
    return {
        "service": container_name,
        "success": success,
        "detail": "Restarted" if success else stderr.decode(),
    }


async def get_container_status(container_name: str) -> dict:
    if sys.platform == "win32":
        return {"service": container_name, "status": "unknown", "detail": "Windows — docker 사용 불가"}

    proc = await asyncio.create_subprocess_exec(
        "docker", "inspect", "--format",
        "{{.State.Status}}|{{.State.StartedAt}}|{{.Config.Image}}",
        container_name,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, _ = await proc.communicate()
    if proc.returncode != 0:
        return {"service": container_name, "status": "not_found"}

    parts = stdout.decode().strip().split("|")
    return {
        "service": container_name,
        "status": parts[0] if parts else "unknown",
        "started_at": parts[1] if len(parts) > 1 else None,
        "image": parts[2] if len(parts) > 2 else None,
    }
