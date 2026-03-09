# SyOps

> syworkspace.cloud 통합 포털 + 서버/서비스 관리 + DevOps 실전 학습 프로젝트

## 개요

개인 프로젝트들을 호스팅하는 Contabo VPS(`46.250.251.82`)의 **통합 관리 허브**.
`syworkspace.cloud` 루트 도메인의 랜딩 페이지를 제공하고, 서비스 상태 모니터링과 서버 관리 대시보드를 구축한다.

기존에 각 프로젝트(QuickDrop, News_Agent 등)와 The Record, workspace handoff에 흩어져 있던
배포 설정, DevOps 로드맵, 인프라 문서를 이 프로젝트로 통합·관리한다.

## 관리 대상 서비스

| 서비스 | 도메인 | 상태 |
|--------|--------|------|
| QuickDrop | `drop.syworkspace.cloud` | ✅ 운영 중 |
| News_Agent | `news.syworkspace.cloud` | ✅ 운영 중 |
| SyOps (이 프로젝트) | `syworkspace.cloud` | 🔨 개발 예정 |

## 프로젝트 구조

```
SyOps/
├── frontend/              # 통합 웹 포털 (React + Vite)
│   └── src/
├── backend/               # 관리 API (FastAPI)
│   ├── routers/           # API 라우터
│   ├── services/          # 비즈니스 로직
│   └── core/              # 설정, 인증
├── deploy/                # 배포/인프라 설정 (중앙 관리)
│   ├── nginx/             # nginx 설정
│   ├── systemd/           # systemd 서비스 파일
│   └── scripts/           # 자동화 스크립트
├── docs/
│   ├── PLAN.md            # 프로젝트 계획
│   ├── DEVOPS_ROADMAP.md  # DevOps 학습 로드맵
│   ├── MIGRATION_PLAN.md  # VPS 마이그레이션 계획
│   └── handoff/           # 세션 핸드오프
└── README.md
```

## 기술 스택

- **Frontend**: React + Vite
- **Backend**: FastAPI (Python 3.12)
- **Reverse Proxy**: nginx
- **SSL**: Let's Encrypt (certbot)
- **CI/CD**: GitHub Actions (예정)
- **Server**: Contabo VPS (Ubuntu 24.04, 6 vCPU, 12GB RAM)

## 관련 문서

- `docs/PLAN.md` — 상세 프로젝트 계획
- `docs/DEVOPS_ROADMAP.md` — DevOps 학습 로드맵 (Stage 1~11)
- `docs/MIGRATION_PLAN.md` — Contabo → Hetzner + Railway 마이그레이션 계획
- `.workspace/shared/vps-server.md` — VPS 서버 공통 참조 정보
