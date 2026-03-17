from __future__ import annotations

import logging
import shutil
import subprocess
from pathlib import Path

from PIL import Image

from ..core.config import settings

logger = logging.getLogger(__name__)

SUPPORTED_IMAGE = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".heic"}
SUPPORTED_VIDEO = {".mp4", ".mov", ".webm", ".mkv"}
SUPPORTED_ALL = SUPPORTED_IMAGE | SUPPORTED_VIDEO

_HAS_FFMPEG: bool | None = None


def _check_ffmpeg() -> bool:
    global _HAS_FFMPEG
    if _HAS_FFMPEG is None:
        _HAS_FFMPEG = shutil.which("ffmpeg") is not None
    return _HAS_FFMPEG


def _thumbs_dir() -> Path:
    return Path(settings.gallery_media_dir) / ".thumbs"


def _thumb_path_for(rel_path: str) -> Path:
    return _thumbs_dir() / (rel_path + ".webp")


def _create_image_thumb(src: Path, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    size = settings.gallery_thumb_size
    with Image.open(src) as img:
        img.thumbnail((size, size))
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        img.save(dest, "WEBP", quality=80)


def _create_video_thumb(src: Path, dest: Path) -> None:
    if not _check_ffmpeg():
        return
    dest.parent.mkdir(parents=True, exist_ok=True)
    try:
        subprocess.run(
            [
                "ffmpeg", "-y", "-i", str(src),
                "-vframes", "1", "-an",
                "-vf", f"scale={settings.gallery_thumb_size}:-1",
                str(dest),
            ],
            capture_output=True,
            timeout=15,
        )
    except Exception:
        logger.warning("ffmpeg thumbnail failed for %s", src)


def get_or_create_thumb(rel_path: str) -> Path | None:
    media_dir = Path(settings.gallery_media_dir)
    src = (media_dir / rel_path).resolve()
    if not str(src).startswith(str(media_dir.resolve())):
        return None
    if not src.is_file():
        return None

    dest = _thumb_path_for(rel_path)
    if dest.exists() and dest.stat().st_mtime >= src.stat().st_mtime:
        return dest

    suffix = src.suffix.lower()
    if suffix in SUPPORTED_IMAGE:
        try:
            _create_image_thumb(src, dest)
        except Exception:
            logger.warning("image thumbnail failed for %s", src)
            return None
    elif suffix in SUPPORTED_VIDEO:
        _create_video_thumb(src, dest)
    else:
        return None

    return dest if dest.exists() else None


def file_type(suffix: str) -> str | None:
    s = suffix.lower()
    if s in SUPPORTED_IMAGE:
        return "image"
    if s in SUPPORTED_VIDEO:
        return "video"
    return None
