from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    syops_password: str = "changeme"
    syops_secret_key: str = "dev-secret"

    quickdrop_local_url: str = "http://127.0.0.1:8200"
    news_agent_root: str = "/var/www/news-agent"

    model_config = {"env_file": Path(__file__).resolve().parents[2] / ".env"}


settings = Settings()
