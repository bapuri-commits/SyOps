# SyOps — 프로젝트 계획

> 최종 갱신: 2026-03-11

## 프로젝트 목적

1. **통합 랜딩 페이지**: `syworkspace.cloud` 루트에 서비스 포털 제공
2. **서버/서비스 관리 대시보드**: VPS 상태 모니터링 + 서비스 제어
3. **배포 설정 중앙화**: 흩어진 nginx, systemd, 배포 스크립트 통합 관리
4. **DevOps 실전 학습**: Docker, CI/CD, 모니터링 등 체계적 학습

---

## 현재 인프라 현황

### VPS 정보

- **업체**: Contabo (6 vCPU, 12GB RAM, 96GB SSD)
- **IP**: `46.250.251.82`
- **도메인**: `syworkspace.cloud` (가비아)
- **SSL**: Let's Encrypt SAN 인증서 (만료 2026-06-06)
- **상세**: `.workspace/shared/vps-server.md` 참조

### 운영 중인 서비스

| 서비스 | 서브도메인 | 포트 | 방식 | systemd |
|--------|-----------|------|------|---------|
| QuickDrop | `drop.` | 8200 | FastAPI + uvicorn | `quickdrop.service` |
| News_Agent | `news.` | - | nginx 정적 서빙 | - (cron) |
| nginx | - | 80, 443 | 리버스 프록시 + SSL | `nginx.service` |

### DevOps 로드맵 진행 상태

| Stage | 내용 | 상태 |
|-------|------|------|
| 1 | VPS 초기화 & 클린 세팅 | ✅ 완료 |
| 2 | 서비스 수동 배포 | ✅ 완료 (News_Agent, QuickDrop) |
| 3 | Docker 컨테이너화 | ⬜ 미시작 |
| 4 | nginx 리버스 프록시 | ✅ 완료 |
| 5 | 도메인 & HTTPS | ✅ 완료 |
| 6 | CI/CD 파이프라인 | ⬜ 미시작 |
| 7 | cron 자동화 | 🔸 부분 (QuickDrop cleanup) |
| 8 | 로컬-VPS 하이브리드 | ⬜ 미시작 |
| 9 | 모니터링 & 로깅 | ⬜ 미시작 |

상세: `docs/DEVOPS_ROADMAP.md`

---

## 기능 설계

### Phase 1 — 통합 랜딩 페이지 (MVP) ✅ 완료

`syworkspace.cloud`에 서비스 포털 배포 완료.

**기능:**
- 서비스 카드 목록 (QuickDrop, News_Agent 등)
- 각 서비스 실시간 상태 표시 (UP/DOWN)
- 서비스 간략 설명 + 바로가기 링크
- 반응형 디자인 (모바일/데스크탑)

**기술:**
- React + Vite (정적 빌드 → nginx 서빙)
- 서비스 상태는 백엔드 API에서 fetch

**배포:**
- `syworkspace.cloud` nginx 설정을 정적 파일 서빙으로 변경
- SyOps 백엔드 API는 별도 포트로 프록시

### Phase 2 — 서비스 상태 API ✅ 완료

**엔드포인트:**
- `GET /api/health` — 전체 서비스 헬스체크
- `GET /api/health/{service}` — 개별 서비스 상태
- `GET /api/metrics` — 서버 리소스 (CPU, RAM, 디스크)

**체크 방식:**
- QuickDrop: HTTP GET to `http://127.0.0.1:8200`
- News_Agent: `index.html` 파일 존재 여부 + 최종 수정 시간
- nginx: `systemctl is-active nginx`
- 시스템: `psutil`로 CPU/RAM/디스크 수집

**인증:**
- 공개 API: `/api/health` (서비스 상태만)
- 보호 API: `/api/metrics`, `/api/services/*` (비밀번호 인증)

### Phase 3 — 관리 대시보드 ✅ 완료

**기능 (인증 필요):**
- 서버 리소스 실시간 모니터링 차트
- 서비스별 systemd 상태 + 최근 로그
- 서비스 재시작 버튼
- SSL 인증서 만료일 표시
- 디스크 사용량 경고

**연계:**
- DevOps 로드맵 Stage 9 (모니터링 & 로깅)와 연결

### Phase 4 — CI/CD + 자동화 ✅ 완료

- GitHub Actions: push → CI (빌드+린트) → CD (SSH 배포+헬스체크)
- systemd 서비스 등록, nginx 보안 헤더 적용
- DevOps 로드맵 Stage 6과 연결

---

## 배포 설정 중앙화 계획

기존에 각 프로젝트에 흩어져 있던 인프라 설정을 SyOps에서 중앙 관리한다.

### 이관 완료 항목

| 원본 위치 | → SyOps 위치 | 내용 |
|-----------|--------------|------|
| The Record `3_Areas/CS_Core/devops-learning-roadmap.md` | `docs/DEVOPS_ROADMAP.md` | DevOps 학습 로드맵 |
| The Record `3_Areas/Tools/vps-migration-plan.md` | `docs/MIGRATION_PLAN.md` | VPS 마이그레이션 계획 |
| QuickDrop `docs/DEPLOYMENT.md` (nginx 설정 부분) | `deploy/nginx/services.conf` | nginx 중앙 설정 |
| .workspace handoff (Stage 정보) | `docs/DEVOPS_ROADMAP.md` | 진행 현황 통합 |

### 각 프로젝트에 유지하는 항목

- `docs/DEPLOYMENT.md` — 프로젝트 고유 배포 절차 (clone, venv, env 등)
- `docs/handoff/` — 프로젝트별 세션 핸드오프
- Docker 설정 — 프로젝트별 Dockerfile/docker-compose

### 원칙

- **인프라 공통 설정** (nginx, systemd, 도메인, SSL) → SyOps
- **프로젝트 고유 설정** (앱 빌드, 환경변수, 의존성) → 각 프로젝트
- **원본에는 이관 참조 노트** 추가 (원본 삭제하지 않고, SyOps를 canonical source로 안내)

---

## 구현 우선순위

```
Phase 1: 통합 랜딩 페이지 (MVP) ✅
Phase 2: 서비스 상태 API         ✅
Phase 3: 관리 대시보드            ✅
Phase 4: CI/CD + 자동화          ✅ (GitHub Secrets 수동 설정 필요)
```
VPS 배포 완료: 2026-03-11

---

## 향후 서브도메인 확장 예정

| 서브도메인 | 프로젝트 | 시점 |
|-----------|----------|------|
| `agent.syworkspace.cloud` | The_Agent | Stage 3 (Docker) 이후 |
| `mc.syworkspace.cloud` | PixelmonServer | Stage 11 (후순위) |
| `llm.syworkspace.cloud` | llm-mcp-agent | Stage 10 (구현 시) |
