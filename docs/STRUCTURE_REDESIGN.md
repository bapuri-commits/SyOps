# SyOps 서비스 구조 개선안

> 2026-03-12 작성, 2026-03-13 갱신. syworkspace.cloud 서비스 플랫폼의 도메인·인프라·포털 구조 재설계.

## 배경

- 서비스 대상 프로젝트가 10개로 확대
- 이용자 2-3명 규모의 개인 서비스 플랫폼
- 포트폴리오 >= 서비스 허브 > 운영 대시보드 (우선순위)
- 주 사용자: 본인(매일) + 친구 2-3명, 부차적으로 면접관/채용담당자

---

## 서비스 대상 프로젝트

### 프로젝트 분류

| 유형 | 프로젝트 | 설명 | 실행 방식 |
|------|----------|------|-----------|
| **상시 웹앱** | QuickDrop | 파일 공유 (FastAPI + Vanilla JS) | Docker |
| **상시 웹앱** | The_Agent | AI 개인 비서 (FastAPI + React) | Docker |
| **상시 웹앱** | PrivateLLM | AI 챗봇 (Ollama + 외부 GPU) | RunPod 프록시 |
| **상시 백그라운드** | BotTycoon-discord-bot | Discord 서버 운영 봇 | Docker (웹 UI 없음) |
| **정적 사이트** | News_Agent | 뉴스 브리핑 (cron → HTML 생성) | nginx 정적 서빙 |
| **CLI → 웹 래핑** | lesson-assist | 수업 녹음 → 전사 → 요약 | Docker (웹 UI 추가 예정) |
| **CLI → 웹 래핑** | school_sync | LMS 크롤링 → LLM Q&A | Docker (웹 UI 추가 예정) |
| **CLI → 웹 래핑** | Voca_Drill | 영단어 학습 (SM-2 간격 반복) | Docker (웹 UI 추가 예정) |
| **CLI → 웹 래핑** | aram_mayhem_bot | LoL 아수라장 메타 챗봇 | Docker (웹 UI 추가 예정) |

### 프로젝트별 상세

| 프로젝트 | Tech Stack | DB | 현재 단계 |
|----------|-----------|-----|-----------|
| QuickDrop | Python 3.12, FastAPI, uvicorn | 없음 (파일 기반) | 운영 중 |
| The_Agent | Python, FastAPI, React, WebSocket | PostgreSQL | 설계 완료 |
| PrivateLLM | Ollama, Abliterated 모델, RunPod GPU | ChromaDB (예정) | Phase 1 (로컬) |
| BotTycoon-discord-bot | Python 3.12, discord.py 2.x | SQLite (SQLAlchemy) | Phase 진행 중 |
| News_Agent | Python 3.12, Claude API, Playwright | 없음 | 운영 중 |
| lesson-assist | Python 3.10+, faster-whisper, OpenAI API | 없음 | v2 완성 |
| school_sync | Python, Playwright, Anthropic | 없음 | v1.0 |
| Voca_Drill | Python, Typer, SQLAlchemy | SQLite | 초기 (설계 완료) |
| aram_mayhem_bot | Python, LLM (TBD) | TBD | Phase 0 |

---

## 도메인 구조

### 현재 상태

| 도메인 | 용도 | 상태 |
|--------|------|------|
| `syworkspace.cloud` | SyOps 포털 (React + FastAPI) | 운영 중 |
| `drop.syworkspace.cloud` | QuickDrop | 운영 중 |
| `news.syworkspace.cloud` | News_Agent | 운영 중 |

### 신규 서비스 접근 방식

신규 서비스는 **프로젝트별로 배포 시점에** 서브도메인/경로 중 택 1. 아래 기준을 참고하되 프로젝트 특성에 따라 결정한다.

| 서비스 | 접근 방식 | 비고 |
|--------|-----------|------|
| StudyHub (school_sync + lesson-assist) | `study.syworkspace.cloud` (서브도메인) | 독립 Docker, 포트 8203 |
| Voca_Drill | 미정 | 배포 시 결정 |
| aram_mayhem_bot | 미정 | 배포 시 결정 |
| The_Agent | 미정 | 배포 시 결정 |
| PrivateLLM | 미정 | 배포 시 결정 |

### 서브도메인 vs 경로 — 판단 기준

각 프로젝트를 배포할 때 아래 기준으로 결정:

**서브도메인** (`<name>.syworkspace.cloud`)을 쓰는 경우:
- 자체 백엔드 서버가 있고 SyOps와 독립적으로 동작
- 프론트엔드가 SyOps React 앱과 별도 (자체 HTML/React 앱)
- 기존 사례: QuickDrop(`drop.`), News Agent(`news.`)

**SyOps 경로** (`syworkspace.cloud/<path>`)를 쓰는 경우:
- SyOps React 앱 안에 페이지로 통합 가능
- 백엔드 API만 별도 컨테이너로 프록시하고 프론트는 SyOps에 포함
- 기존 사례: 포트폴리오(`/projects`), 블로그(`/blog`), 개발 로그(`/log`), Algorithm Drill(`/algorithm`), 대시보드(`/dashboard`)

**혼합** — 프론트엔드는 SyOps에 통합, 백엔드만 별도 Docker 컨테이너로 프록시하는 방식도 가능.

참고: 기존 서브도메인(`drop.`, `news.`)은 이미 운영 중이므로 변경하지 않는다.

### 네이밍 규칙

- 서브도메인은 **짧고 직관적인 영단어** 사용
- 프로젝트명이 아닌 **서비스 목적**에 맞춘 이름
- BotTycoon-discord-bot은 Discord 봇이므로 별도 서브도메인 없음 (SyOps 대시보드에서 관리)

### SSL

- **와일드카드 인증서** `*.syworkspace.cloud` 발급 완료
- Cloudflare NS 위임 + certbot-dns-cloudflare 자동 갱신
- 새 서비스 추가 시 SSL 작업 불필요 (Cloudflare DNS에 A 레코드만 추가)
- 만료: 2026-06-10, certbot.timer로 자동 갱신
- 상세: `docs/WILDCARD_SSL_SETUP.md`

---

## 인프라 구조

### 전체 아키텍처

```
nginx (호스트, 리버스 프록시 + 와일드카드 SSL)
│
│── syworkspace.cloud           → SyOps        (systemd, :8300)
│   ├── /services                  서비스 허브
│   ├── /projects                  포트폴리오
│   ├── /blog                      일상/글쓰기
│   ├── /log                       개발 로그
│   ├── /algorithm                 Algorithm Drill
│   └── /dashboard                 운영 대시보드 (비공개)
│
│── drop.syworkspace.cloud      → [Docker] quickdrop          (:8200)
│── news.syworkspace.cloud      → [정적]  /opt/data/news-agent/web
│
│── (신규 서비스는 프로젝트별로 서브도메인/경로 중 택 1 — 배포 시 결정)
│
└── (서브도메인 없음)            → [Docker] bottycoon-bot      (Discord 데몬)
```

### 실행 방식 원칙

| 구분 | 실행 방식 | 이유 |
|------|-----------|------|
| nginx | 호스트 systemd | 리버스 프록시 자체를 컨테이너에 넣으면 관리 복잡 |
| SyOps | 호스트 systemd | 다른 Docker 컨테이너를 관리하는 서비스이므로 호스트 유지 |
| 나머지 전부 | Docker 컨테이너 | 격리, 일관된 배포, QuickDrop으로 검증 완료 |
| PrivateLLM | 외부 GPU 프록시 | Contabo VPS에 GPU 없음, RunPod 등 외부 서비스 프록시 |

### 포트 할당

| 포트 | 서비스 | 비고 |
|------|--------|------|
| 80 | nginx | HTTP → HTTPS 리다이렉트 |
| 443 | nginx | HTTPS 종단 |
| 8200 | QuickDrop | 운영 중 |
| 8201 | Voca_Drill | 예정 |
| 8202 | lesson-assist | 예정 |
| 8203 | school_sync | 예정 |
| 8204 | aram_mayhem_bot | 예정 |
| 8205 | The_Agent | 예정 |
| 8300 | SyOps | 운영 중 |

### nginx 설정

서비스별 개별 conf 파일로 분리 완료:

```
/etc/nginx/sites-available/
├── syops.conf          # syworkspace.cloud → :8300
├── quickdrop.conf      # drop.syworkspace.cloud → :8200
├── news-agent.conf     # news.syworkspace.cloud → 정적 파일
├── catch-all.conf      # 알 수 없는 호스트 차단
└── (서비스 배포 시 추가)
```

Git 관리: `deploy/nginx/sites/` 에 동일 파일 보관. 표준 템플릿: `deploy/templates/nginx-service.conf`

### VPS 디렉토리 구조

```
/opt/
├── apps/              # git clone 대상 (코드)
├── envs/              # 환경변수 (chmod 600)
│   ├── cloudflare.ini # Cloudflare API 토큰 (SSL 자동 갱신)
│   ├── syops.env
│   ├── quickdrop.env
│   └── news-agent.env
├── data/              # 런타임 데이터 (git 외부)
├── logs/
├── scripts/
└── backups/
```

### Docker 표준 템플릿

```
/opt/apps/<project>/
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── .env
├── (소스코드)
└── ...

/opt/data/<project>/           # Docker 바인드 마운트
/opt/envs/<project>.env        # 환경변수
```

기존 `SyOps/deploy/templates/` 템플릿 활용.

---

## SyOps 포털

### 역할

SyOps 포털 (`syworkspace.cloud`)은 3가지 역할을 겸한다:

1. **포트폴리오** — 프로젝트 쇼케이스, 기술 스택, 아키텍처 (면접관 타겟)
2. **서비스 허브** — 운영 중 서비스 바로가기 (본인 일상 사용)
3. **운영 대시보드** — CPU/메모리/서비스 관리 (비공개, 로그인 필요)

### 페이지 구조

```
/               → Landing (히어로 소개 + CTA 분기)
/services       → 서비스 허브 (카테고리별 서비스 카드, 헬스체크)
/projects       → 프로젝트 포트폴리오 (면접관 타겟)
/projects/:id   → 프로젝트 상세 (아키텍처, 기술 결정)
/blog           → 일상/글쓰기 (에세이, 생각, 일상 기록)
/log            → 개발 로그 (형태 TBD)
/algorithm      → Algorithm Drill (형태 TBD)
/login          → 로그인
/dashboard      → 운영 대시보드 (비공개)
/dashboard/bottycoon → BotTycoon 대시보드
```

### Landing (/) — 히어로 + 분기

```
┌──────────────────────────────────────────────────┐
│  [Navbar] SyOps | 서비스 | 프로젝트 | 블로그 | 개발로그 | 알고리즘 │
├──────────────────────────────────────────────────┤
│                                                  │
│                    SyOps                         │
│        풀스택 개인 서비스 플랫폼                   │
│                                                  │
│    N개 서비스 운영 · N개 프로젝트 · N문제           │
│                                                  │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│  │ 서비스  │ │프로젝트 │ │ 블로그  │ │개발로그 │ │알고리즘 │
│  │ N개    │ │포트폴리오│ │ 일상글 │ │ 최근글 │ │ N문제  │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘
│                                                  │
│                                       [관리]      │
└──────────────────────────────────────────────────┘
```

### 서비스 카탈로그 카테고리

| 카테고리 | 서비스 | 접근 방식 | 설명 |
|----------|--------|-----------|------|
| **유틸리티** | QuickDrop | `drop.` (서브도메인) | 파일 공유 |
| **유틸리티** | News_Agent | `news.` (서브도메인) | 뉴스 브리핑 |
| **생산성** | lesson-assist | 미정 | 수업 녹음 → 요약 |
| **생산성** | school_sync | 미정 | LMS 통합 Q&A |
| **생산성** | Voca_Drill | 미정 | 영단어 학습 |
| **AI/챗** | The_Agent | 미정 | AI 개인 비서 |
| **AI/챗** | PrivateLLM | 미정 | AI 챗봇 |
| **AI/챗** | aram_mayhem_bot | 미정 | LoL 메타 분석 |
| **Discord** | BotTycoon-discord-bot | 대시보드 전용 | 서버 운영 봇 |

### 포털 콘텐츠 (SyOps 경로)

| 경로 | 콘텐츠 | 상태 |
|------|--------|------|
| `/projects` | 프로젝트 포트폴리오 (카드 + 상세) | 구현 예정 |
| `/blog` | 일상/글쓰기 (에세이, 생각) | 형태 TBD |
| `/log` | 개발 로그 | 형태 TBD |
| `/algorithm` | Algorithm Drill 풀이 현황 | 형태 TBD |

---

## 서비스 추가 체크리스트

새 서비스 배포 시:

1. `/opt/apps/<project>`에 git clone
2. `/opt/data/<project>/` 데이터 디렉토리 생성
3. `/opt/envs/<project>.env` 환경변수 파일 생성 (chmod 600)
4. `docker/.env` → `/opt/envs/<project>.env` 심링크 (또는 직접 생성)
5. `cd /opt/apps/<project>/docker && docker compose up -d --build`
6. `/etc/nginx/sites-available/<project>.conf` 작성 (표준 템플릿 기반)
7. `ln -s /etc/nginx/sites-available/<project>.conf /etc/nginx/sites-enabled/`
8. Cloudflare DNS에 A 레코드 추가: `<subdomain>` → `46.250.251.82`
9. `sudo nginx -t && sudo systemctl reload nginx`
10. 와일드카드 SSL이므로 certbot 불필요
11. SyOps 서비스 카탈로그 + 백엔드 레지스트리에 서비스 등록

---

## 리소스 영향 분석

### 현재 서버 상태

- CPU: 6 vCPU
- RAM: 12 GB (사용 ~1.1GB / 여유 ~10GB)
- 디스크: 96 GB SSD (사용 12G / 여유 84G)
- 이용자: 2-3명

### 예상 리소스 사용

| 서비스 | 메모리 예상 | 비고 |
|--------|-------------|------|
| SyOps | ~100MB | FastAPI + React 빌드 서빙 |
| QuickDrop | ~100MB | FastAPI + 파일 I/O |
| News_Agent | ~0MB (상주 아님) | cron 실행 시만 일시적 사용 |
| BotTycoon-discord-bot | ~150MB | discord.py + SQLite |
| Voca_Drill | ~100MB | FastAPI + SQLite |
| lesson-assist | ~300MB | whisper 모델 로드 시 일시적 급증 |
| school_sync | ~200MB | Playwright 브라우저 인스턴스 |
| aram_mayhem_bot | ~100MB | FastAPI + LLM API 호출 |
| The_Agent | ~300MB | FastAPI + React + PostgreSQL 연동 |
| PrivateLLM | ~0MB | 외부 GPU 프록시만 |
| **합계** | **~1.5GB** | 전체 동시 실행 시 |

12GB RAM에서 1.5GB는 충분한 여유. Docker 오버헤드 포함해도 3GB 이내.

---

## 구현 상태

### 인프라 (완료)

- [x] `syworkspace.cloud` 루트를 SyOps 포털로 변경
- [x] Cloudflare NS 위임 + 와일드카드 SSL 발급 (`*.syworkspace.cloud`)
- [x] nginx 설정 서비스별 파일 분리 (`deploy/nginx/sites/`)
- [x] nginx 서비스 템플릿 와일드카드 SSL 경로 업데이트

### 백엔드 (완료)

- [x] 서비스 레지스트리 리팩터링 (`backend/services/registry.py`)
- [x] deploy.sh 전체 서비스 지원

### 프론트엔드 — 서비스 카탈로그 (완료)

- [x] 서비스 카탈로그 9개 확장 (`frontend/src/data/services.ts`)
- [x] 서비스 카드 카테고리별 그룹핑 + DeployBadge
- [x] 랜딩 페이지 카테고리별 리디자인

### 프론트엔드 — 포털 리디자인 (예정)

- [ ] Navbar 컴포넌트 (로고 | 서비스 | 프로젝트 | 블로그 | 개발로그 | 알고리즘)
- [ ] Landing 히어로 리디자인 (소개 + CTA 5개)
- [ ] /services 페이지 (기존 Landing 서비스 카드 이동)
- [ ] /projects + ProjectCard + projects.ts
- [ ] /projects/:id 상세
- [ ] /blog, /log, /algorithm placeholder
- [ ] App.tsx 라우트 확장

### 서비스 배포 순서 (development-roadmap.md 블록 순서)

| 순서 | 서비스 | 전제 조건 |
|------|--------|-----------|
| 1 | school_sync | 웹 UI 래핑 필요 |
| 2 | lesson-assist | 웹 UI 래핑 필요 |
| 3 | Voca_Drill | 핵심 로직 구현 + 웹 UI |
| 4 | BotTycoon-discord-bot | Phase 진행 후 Docker 배포 |
| 5 | aram_mayhem_bot | Phase 1 구현 필요 |
| 6 | The_Agent | 설계 완료 후 구현 |
| 7 | PrivateLLM | RunPod 환경 세팅 후 프록시 |

---

## 미결정 사항

- 블로그 형태 (에세이 / 일상 / 자유 글쓰기)
- 개발 로그 형태 (블로그형 / 타임라인형 / TIL형)
- Algorithm Drill 표시 형태 (통계 / 문제 목록 / 난이도 분포)
- 프로젝트 상세 페이지의 콘텐츠 깊이
