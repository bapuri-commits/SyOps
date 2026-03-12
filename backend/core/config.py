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

    # Services
    quickdrop_local_url: str = "http://127.0.0.1:8200"
    news_agent_root: str = "/var/www/news-agent"
    bottycoon_api_url: str = "http://127.0.0.1:8400"

    model_config = {
        "env_file": Path(__file__).resolve().parents[2] / ".env",
        "extra": "ignore",
    }


settings = Settings()
