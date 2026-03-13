"""서비스 레지스트리.

헬스체크와 관리 대상 서비스를 중앙에서 정의한다.
새 서비스 추가 시 이 파일만 수정하면 health.py와 systemd.py가 자동으로 반영.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum


class RunType(str, Enum):
    DOCKER = "docker"
    SYSTEMD = "systemd"
    STATIC = "static"


class HealthCheckType(str, Enum):
    HTTP = "http"
    DOCKER_INSPECT = "docker_inspect"
    FILE_EXISTS = "file_exists"
    SYSTEMCTL = "systemctl"


@dataclass
class ServiceDef:
    id: str
    name: str
    run_type: RunType
    health_check: HealthCheckType
    health_target: str = ""
    manage_unit: str = ""
    port: int = 0
    subdomain: str = ""
    enabled: bool = True


SERVICES: list[ServiceDef] = [
    ServiceDef(
        id="quickdrop",
        name="QuickDrop",
        run_type=RunType.DOCKER,
        health_check=HealthCheckType.HTTP,
        health_target="http://127.0.0.1:8200",
        manage_unit="quickdrop",
        port=8200,
        subdomain="drop",
    ),
    ServiceDef(
        id="bottycoon-bot",
        name="BotTycoon",
        run_type=RunType.DOCKER,
        health_check=HealthCheckType.DOCKER_INSPECT,
        health_target="bottycoon-bot",
        manage_unit="bottycoon-bot",
    ),
    ServiceDef(
        id="news-agent",
        name="News Agent",
        run_type=RunType.STATIC,
        health_check=HealthCheckType.FILE_EXISTS,
        health_target="/opt/data/news-agent/web/index.html",
        subdomain="news",
    ),
    ServiceDef(
        id="nginx",
        name="nginx",
        run_type=RunType.SYSTEMD,
        health_check=HealthCheckType.SYSTEMCTL,
        health_target="nginx",
        manage_unit="nginx.service",
    ),
    # --- 아래는 배포 후 enabled=True로 전환 ---
    ServiceDef(
        id="voca-drill",
        name="Voca Drill",
        run_type=RunType.DOCKER,
        health_check=HealthCheckType.HTTP,
        health_target="http://127.0.0.1:8201",
        manage_unit="voca-drill",
        port=8201,
        subdomain="voca",
        enabled=False,
    ),
    ServiceDef(
        id="study",
        name="StudyHub",
        run_type=RunType.DOCKER,
        health_check=HealthCheckType.HTTP,
        health_target="http://127.0.0.1:8203/api/health",
        manage_unit="study",
        port=8203,
        subdomain="study",
        enabled=False,
    ),
    ServiceDef(
        id="aram-bot",
        name="아수라장",
        run_type=RunType.DOCKER,
        health_check=HealthCheckType.HTTP,
        health_target="http://127.0.0.1:8204",
        manage_unit="aram-bot",
        port=8204,
        subdomain="aram",
        enabled=False,
    ),
    ServiceDef(
        id="the-agent",
        name="The Agent",
        run_type=RunType.DOCKER,
        health_check=HealthCheckType.HTTP,
        health_target="http://127.0.0.1:8205",
        manage_unit="the-agent",
        port=8205,
        subdomain="agent",
        enabled=False,
    ),
]


def get_enabled() -> list[ServiceDef]:
    return [s for s in SERVICES if s.enabled]


def get_by_id(service_id: str) -> ServiceDef | None:
    return next((s for s in SERVICES if s.id == service_id), None)


def get_manageable() -> dict[str, ServiceDef]:
    """로그 조회/재시작 가능한 서비스 (Docker 또는 systemd)."""
    return {
        s.id: s
        for s in SERVICES
        if s.enabled and s.run_type in (RunType.DOCKER, RunType.SYSTEMD)
    }
