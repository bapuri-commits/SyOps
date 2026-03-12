from __future__ import annotations

import asyncio
import sys
from datetime import datetime, timezone
from pathlib import Path

import httpx

from ..core.config import settings

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


async def check_quickdrop() -> dict:
    try:
        r = await _get_client().get(settings.quickdrop_local_url)
        return {
            "id": "quickdrop",
            "status": "up" if r.status_code < 500 else "down",
            "latency_ms": int(r.elapsed.total_seconds() * 1000),
        }
    except Exception:
        return {"id": "quickdrop", "status": "down"}


async def check_news_agent() -> dict:
    root = Path(settings.news_agent_root)
    index = root / "index.html"
    if not index.exists():
        return {"id": "news-agent", "status": "down"}
    mtime = datetime.fromtimestamp(index.stat().st_mtime, tz=timezone.utc)
    return {
        "id": "news-agent",
        "status": "up",
        "last_updated": mtime.isoformat(),
    }


async def check_bottycoon_bot() -> dict:
    """Docker 컨테이너 실행 여부로 봇 상태를 판단한다."""
    if sys.platform == "win32":
        return {"id": "bottycoon-bot", "status": "unknown", "detail": "Windows — docker 사용 불가"}
    try:
        proc = await asyncio.create_subprocess_exec(
            "docker", "inspect", "-f", "{{.State.Status}}", "bottycoon-bot",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, _ = await proc.communicate()
        state = stdout.decode().strip()
        return {
            "id": "bottycoon-bot",
            "status": "up" if state == "running" else "down",
            "container_state": state,
        }
    except Exception:
        return {"id": "bottycoon-bot", "status": "unknown"}


async def check_nginx() -> dict:
    if sys.platform == "win32":
        return {"id": "nginx", "status": "unknown", "detail": "Windows — systemctl 사용 불가"}
    try:
        proc = await asyncio.create_subprocess_exec(
            "systemctl", "is-active", "nginx",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, _ = await proc.communicate()
        active = stdout.decode().strip() == "active"
        return {"id": "nginx", "status": "up" if active else "down"}
    except Exception:
        return {"id": "nginx", "status": "unknown"}


async def check_all() -> list[dict]:
    results = await asyncio.gather(
        check_quickdrop(),
        check_bottycoon_bot(),
        check_news_agent(),
        check_nginx(),
        return_exceptions=True,
    )
    out: list[dict] = []
    for r in results:
        if isinstance(r, Exception):
            out.append({"id": "error", "status": "unknown", "detail": str(r)})
        else:
            out.append(r)
    return out
