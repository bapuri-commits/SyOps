from __future__ import annotations

import mimetypes
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import FileResponse, StreamingResponse

from ..core.auth import require_admin
from ..core.config import settings
from ..services.gallery import SUPPORTED_ALL, file_type, get_or_create_thumb

router = APIRouter(prefix="/api/gallery", tags=["gallery"])


def _media_dir() -> Path:
    return Path(settings.gallery_media_dir)


def _safe_resolve(rel: str) -> Path:
    base = _media_dir().resolve()
    target = (base / rel).resolve()
    if target != base and not str(target).startswith(str(base) + "/"):
        raise HTTPException(403, "Access denied")
    return target


@router.get("")
async def list_directory(path: str = "", _user=Depends(require_admin)):
    dir_path = _safe_resolve(path)
    if not dir_path.is_dir():
        raise HTTPException(404, "Directory not found")

    folders: list[dict] = []
    files: list[dict] = []

    for entry in sorted(dir_path.iterdir(), key=lambda e: e.name):
        if entry.name.startswith("."):
            continue

        if entry.is_dir():
            count = sum(
                1 for f in entry.iterdir()
                if f.is_file() and not f.name.startswith(".") and f.suffix.lower() in SUPPORTED_ALL
            )
            folders.append({"name": entry.name, "item_count": count})
        elif entry.is_file() and entry.suffix.lower() in SUPPORTED_ALL:
            ftype = file_type(entry.suffix)
            stat = entry.stat()
            files.append({
                "name": entry.name,
                "type": ftype,
                "size": stat.st_size,
                "modified": datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).isoformat(),
            })

    return {"path": path, "folders": folders, "files": files}


@router.get("/files/{path:path}")
async def serve_file(path: str, request: Request, _user=Depends(require_admin)):
    file_path = _safe_resolve(path)
    if not file_path.is_file():
        raise HTTPException(404, "File not found")

    content_type = mimetypes.guess_type(file_path.name)[0] or "application/octet-stream"

    range_header = request.headers.get("range")
    if range_header and content_type.startswith("video/"):
        return _range_response(file_path, range_header, content_type)

    return FileResponse(
        file_path,
        media_type=content_type,
        headers={"Accept-Ranges": "bytes"} if content_type.startswith("video/") else {},
    )


@router.get("/thumbs/{path:path}")
async def serve_thumb(path: str, _user=Depends(require_admin)):
    thumb = get_or_create_thumb(path)
    if thumb is None:
        raise HTTPException(404, "Thumbnail not available")
    return FileResponse(thumb, media_type="image/webp")


def _range_response(
    file_path: Path, range_header: str, content_type: str
) -> StreamingResponse:
    file_size = file_path.stat().st_size

    try:
        unit, ranges = range_header.split("=", 1)
        if unit.strip() != "bytes":
            raise HTTPException(416, "Only byte ranges supported")
        start_str, end_str = ranges.split("-", 1)
        start = int(start_str) if start_str else 0
        end = int(end_str) if end_str else file_size - 1
    except (ValueError, AttributeError):
        raise HTTPException(416, "Invalid range")

    if start < 0 or start >= file_size or end >= file_size or start > end:
        raise HTTPException(416, "Range not satisfiable")

    length = end - start + 1

    def _iter():
        chunk_size = 1024 * 1024
        with open(file_path, "rb") as f:
            f.seek(start)
            remaining = length
            while remaining > 0:
                read_size = min(chunk_size, remaining)
                data = f.read(read_size)
                if not data:
                    break
                remaining -= len(data)
                yield data

    return StreamingResponse(
        _iter(),
        status_code=206,
        media_type=content_type,
        headers={
            "Content-Range": f"bytes {start}-{end}/{file_size}",
            "Accept-Ranges": "bytes",
            "Content-Length": str(length),
        },
    )
