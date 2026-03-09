---
tags: [devops, linux, docker, nginx, cicd, contabo, vps, learning, roadmap]
created: 2026-03-05
updated: 2026-03-09
origin: "The Record/3_Areas/CS_Core/devops-learning-roadmap.md에서 이관"
status: living-document
---

# DevOps 학습 로드맵 — Contabo VPS + 기존 프로젝트 활용

> 새 프로젝트를 만들지 않고, **기존에 만든 프로젝트들을 직접 배포하면서** 기초 DevOps를 체득하는 실전 학습 계획.

---

## 한 줄 직관

서버에 코드를 올리고, 안 죽게 만들고, 외부에서 접근하게 열고, 자동화하는 것. 그게 DevOps의 80%다.

---

## 인프라 환경

### Contabo VPS (실측)

| 항목 | 사양 |
|------|------|
| CPU | 6 vCPU |
| RAM | 12 GB |
| 스토리지 | 96 GB SSD |
| 트래픽 | 무제한 |
| OS | Ubuntu 24.04.4 LTS |
| IP | `46.250.251.82` |
| 타임존 | UTC |

12GB RAM이면 Docker + PostgreSQL + FastAPI + React를 동시에 돌릴 수 있으나, 대형 서비스(Minecraft 8GB, Ollama 5GB)는 동시 실행에 주의. Swap 4GB 설정 완료.

---

## 프로젝트 → 배포 분류

| 프로젝트 | 타입 | 런타임 | 배포 방식 | DevOps 학습 포인트 |
|----------|------|--------|----------|-------------------|
| **QuickDrop** | 웹 서비스 (FE+BE) | Python | systemd + nginx | 리버스 프록시, HTTPS, cron |
| **News_Agent** | 스케줄 job + 정적 사이트 | Python | cron + nginx | cron, Playwright, 정적 서빙 |
| **SyOps** | 웹 서비스 (FE+BE) | Python/TS | systemd + nginx | 모니터링, CI/CD, 포털 |
| **The_Agent** | 웹 서비스 (FE+BE+DB) | Python/TS | Docker Compose + nginx | Docker, 리버스 프록시 |
| **school_sync** | CLI 크롤러 (주기 실행) | Python | cron | cron, Playwright |
| **lesson-assist** | CLI (GPU+서버 분리) | Python | rsync + cron | 로컬-VPS 하이브리드 |
| **llm-mcp-agent** | MCP 서버 (미구현) | Python | Docker + systemd | DevOps-first 개발, Ollama |
| **PixelmonServer** | 게임 서버 (장기 실행) | Java 21 | systemd | 프로세스 관리, 백업 (후순위) |

---

## 학습 Stage 설계

### Stage 1 — VPS 초기화 & 클린 세팅 ✅

> 완료: 2026-03-06

- [x] SSH 키 접속 설정 (ed25519, 노트북+데스크탑)
- [x] dev 사용자 계정 생성 + sudo 권한
- [x] root 직접 로그인 비활성화
- [x] 비밀번호 인증 비활성화
- [x] ufw 방화벽 (22, 80, 443)
- [x] fail2ban 설치
- [x] Swap 4GB 설정 (swappiness=10)
- [x] 타임존: UTC
- [x] `/opt/apps/`, `/opt/envs/`, `/opt/data/`, `/opt/logs/` 구조 확립

**배운 것:** SSH 키 인증, 방화벽, 사용자/권한, Swap

---

### Stage 2 — 첫 서비스 수동 배포 ✅

> 완료: 2026-03-07 (QuickDrop, News_Agent)

- [x] News_Agent: git clone → venv → Playwright → 수동 실행
- [x] QuickDrop: git clone → venv → systemd 서비스 → 상시 실행
- [x] 환경변수: `/opt/envs/` 분리, 심링크 연결
- [x] 데이터: `/opt/data/` 분리 (git 외부)

**배운 것:** 서버 Python 환경, .env 관리, systemd 기초, "서버에서 안 되는" 문제 해결

**프로젝트 배포 가이드:**
- `QuickDrop/docs/DEPLOYMENT.md`
- `News_Agent/docs/DEPLOYMENT.md`

---

### Stage 3 — Docker 컨테이너화 ⬜

> 대상: The_Agent (Docker Compose 이미 존재)

- [ ] Docker + Docker Compose 설치
- [ ] 기존 `docker-compose.yml` 분석 (db, backend, frontend)
- [ ] `.env` 구성 → `docker compose up -d --build`
- [ ] Frontend Dockerfile 프로덕션 빌드로 수정
- [ ] 볼륨: PostgreSQL 데이터 영속성 확인
- [ ] 컨테이너 리소스 제한 설정

**배울 것:** Docker 핵심 (이미지, 컨테이너, 볼륨, 네트워크), Dockerfile 최적화, Compose

---

### Stage 4 — 웹 서버 & 리버스 프록시 (nginx) ✅

> 완료: 2026-03-08

- [x] nginx 1.24.0 설치
- [x] `drop.syworkspace.cloud` → QuickDrop (:8200)
- [x] `news.syworkspace.cloud` → News_Agent 정적 서빙
- [x] `syworkspace.cloud` → drop 리다이렉트 (→ 향후 SyOps 포털로 변경)
- [x] catch-all → 444 차단
- [x] 포트 8200 외부 차단

**배운 것:** 리버스 프록시, nginx 설정, 정적 서빙 vs 동적 프록시

**설정 파일:** `deploy/nginx/services.conf`

---

### Stage 5 — 도메인 & HTTPS ✅

> 완료: 2026-03-08

- [x] `syworkspace.cloud` 도메인 구매 (가비아)
- [x] DNS A 레코드: `@`, `drop`, `news` → VPS IP
- [x] certbot 2.9.0 → Let's Encrypt SAN 인증서 (만료 2026-06-06)
- [x] 자동 갱신 설정
- [x] HTTP → HTTPS 리다이렉트

**배운 것:** DNS (A 레코드), TLS/SSL, Let's Encrypt 자동 갱신

---

### Stage 6 — CI/CD 파이프라인 ⬜

> 대상: SyOps, The_Agent, News_Agent

- [ ] GitHub Actions: `push to main` → SSH → `git pull` → restart
- [ ] VPS SSH 키를 GitHub Secrets에 등록
- [ ] News_Agent Actions를 VPS 배포로 확장
- [ ] 배포 실패 시 롤백 전략
- [ ] 배포 알림 (Discord webhook 등)

**배울 것:** CI/CD 개념, GitHub Actions 문법, SSH 기반 배포 자동화

---

### Stage 7 — 스케줄링 & 자동화 🔸

> 부분 완료: QuickDrop cleanup cron 등록

- [x] QuickDrop cleanup.py — 매일 UTC 03:00
- [ ] News_Agent 파이프라인 cron 등록
- [ ] school_sync 크롤링 cron 등록
- [ ] cron 로그 관리 (logrotate)
- [ ] 실패 알림 스크립트

**배울 것:** cron 표현식, cron 환경 PATH 주의, 로그 로테이션

---

### Stage 8 — 로컬-VPS 하이브리드 구조 ⬜

> 대상: lesson-assist

- [ ] lesson-assist 요약 전용 모드 구현
- [ ] rsync: 로컬 → VPS 파일 동기화
- [ ] VPS 새 transcript 감지 → 자동 요약
- [ ] 결과 역동기화 (VPS → 로컬)

**배울 것:** rsync, 파일 감시, 하이브리드 아키텍처, GPU/CPU 분리

---

### Stage 9 — 모니터링 & 로깅 ⬜

> SyOps 대시보드와 연계

- [ ] 시스템 모니터링 (htop, netdata/glances)
- [ ] Docker 로그 중앙화
- [ ] nginx 접속 로그 분석
- [ ] 서비스 헬스체크 스크립트 → SyOps API
- [ ] 디스크 사용량 알림

**배울 것:** 리소스 모니터링, 로그 관리, 장애 감지, 프로덕션 디버깅

---

### Stage 10 — DevOps-First 프로젝트 (llm-mcp-agent) ⬜

- [ ] Ollama 설치 + 모델 (7B~13B)
- [ ] MCP 서버 구현과 동시에 Dockerfile 작성
- [ ] GitHub Actions CI/CD 동시 구축

---

### Stage 11 — PixelmonServer (후순위) ⬜

- [ ] NeoForge + Pixelmon 서버 → systemd
- [ ] 백업 스크립트 + cron
- [ ] 주의: RAM 8GB, Ollama와 동시 실행 불가

---

## 실행 순서

```
Stage 1 ✅ → Stage 2 ✅ → Stage 4 ✅ → Stage 5 ✅
                                              ↓
                                        Stage 3 (Docker)
                                              ↓
                                    Stage 6 (CI/CD) ← SyOps 배포와 함께
                                              ↓
                                    Stage 7 (cron 완성)
                                              ↓
                                    Stage 8 (하이브리드)
                                              ↓
                                    Stage 9 (모니터링) ← SyOps 대시보드
                                              ↓
                                    Stage 10, 11 (확장)
```

---

## 예상 리소스 배분 (12GB RAM)

| 서비스 | 예상 RAM | 비고 |
|--------|---------|------|
| OS + 기본 프로세스 | ~1 GB | |
| Swap | 4 GB | 디스크 기반 |
| nginx | ~0.1 GB | |
| QuickDrop | ~0.3 GB | FastAPI + uvicorn |
| SyOps | ~0.3 GB | FastAPI + uvicorn |
| News_Agent (cron) | ~0.3 GB | 실행 시만 |
| **상시 합계** | **~2 GB** | 10 GB 여유 |
| The_Agent (Docker) | ~1.5 GB | Stage 3 이후 |
| Ollama | ~5 GB | Stage 10 |
| PixelmonServer | ~8 GB | Stage 11, Ollama와 동시 불가 |

---

## 환경변수 / 시크릿 관리

### 개발 단계 (현재)
- `/opt/envs/<project>.env` + 심링크
- `chmod 600`으로 권한 제한

### 운영 단계 (Stage 6+)
- Docker Secrets 또는 환경변수 주입
- GitHub Secrets으로 CI/CD에서 관리

---

## 관련 문서

- `docs/PLAN.md` — SyOps 프로젝트 계획
- `docs/MIGRATION_PLAN.md` — VPS 마이그레이션 계획
- `.workspace/shared/vps-server.md` — VPS 서버 참조 정보
- 각 프로젝트 `docs/DEPLOYMENT.md` — 프로젝트별 배포 절차
