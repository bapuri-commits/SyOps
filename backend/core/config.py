import warnings

from pydantic import model_validator
from pydantic_settings import BaseSettings
from pathlib import Path

_backend_dir = Path(__file__).resolve().parents[1]
_default_db = f"sqlite+aiosqlite:///{_backend_dir / 'data' / 'syops.db'}"


class Settings(BaseSettings):
    syops_secret_key: str = "dev-secret"

    # JWT
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 30
    cookie_domain: str = ".syworkspace.cloud"

    # Database
    database_url: str = _default_db

    # Gallery
    gallery_media_dir: str = "/opt/data/the-viewer"
    gallery_thumb_size: int = 400

    # Services
    quickdrop_local_url: str = "http://127.0.0.1:8200"
    news_agent_root: str = "/var/www/news-agent"
    bottycoon_api_url: str = "http://127.0.0.1:8400"

    model_config = {
        "env_file": Path(__file__).resolve().parents[2] / ".env",
        "extra": "ignore",
    }

    @model_validator(mode="after")
    def _validate_secret_key(self):
        weak = self.syops_secret_key == "dev-secret" or len(self.syops_secret_key) < 32
        if not weak:
            return self
        if "sqlite" in self.database_url:
            warnings.warn(
                "SYOPS_SECRET_KEY is weak — acceptable for local dev only",
                UserWarning,
                stacklevel=2,
            )
        else:
            raise ValueError(
                "SYOPS_SECRET_KEY must be set to a strong random value "
                "(at least 32 characters) in production"
            )
        return self


settings = Settings()
