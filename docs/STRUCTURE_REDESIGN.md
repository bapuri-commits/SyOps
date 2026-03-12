# SyOps 서비스 구조 개선안

> 2026-03-12 작성. syworkspace.cloud 서비스 플랫폼의 도메인·인프라·포털 구조 재설계.

## 배경

- 서비스 대상 프로젝트가 10개로 확대
- 이용자 2-3명 규모의 개인 서비스 플랫폼
- 현재 `drop.syworkspace.cloud`, `news.syworkspace.cloud` 서브도메인 사용 중
- `syworkspace.cloud` 루트는 `drop.syworkspace.cloud`로 리다이렉트 중 (변경 필요)

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

### 현재 → 변경

| 도메인 | 현재 | 변경 후 |
|--------|------|---------|
| `syworkspace.cloud` | → `drop.syworkspace.cloud` 리다이렉트 | **SyOps 포털** (허브) |
| `drop.syworkspace.cloud` | QuickDrop | 유지 |
| `news.syworkspace.cloud` | News_Agent | 유지 |
| `voca.syworkspace.cloud` | - | **신규** — Voca_Drill |
| `lesson.syworkspace.cloud` | - | **신규** — lesson-assist |
| `school.syworkspace.cloud` | - | **신규** — school_sync |
| `aram.syworkspace.cloud` | - | **신규** — aram_mayhem_bot |
| `agent.syworkspace.cloud` | - | **신규** — The_Agent |
| `chat.syworkspace.cloud` | - | **신규** — PrivateLLM |

### 네이밍 규칙

- 서브도메인은 **짧고 직관적인 영단어** 사용
- 프로젝트명이 아닌 **서비스 목적**에 맞춘 이름
- BotTycoon-discord-bot은 Discord 봇이므로 별도 서브도메인 없음 (SyOps 대시보드에서 관리)

### 와일드카드 SSL 전환

현재: 서비스 추가 시마다 `certbot --nginx -d <subdomain>.syworkspace.cloud` 실행 필요

변경: `*.syworkspace.cloud` 와일드카드 인증서 1개로 통합

```bash
# DNS-01 챌린지 (가비아 DNS에서 TXT 레코드 설정 필요)
sudo certbot certonly --manual --preferred-challenges dns \
  -d "syworkspace.cloud" -d "*.syworkspace.cloud"
```

장점:
- 새 서비스 추가 시 SSL 작업 불필요 (DNS A 레코드만 추가)
- 인증서 갱신 1회로 모든 서브도메인 커버
- 자동 갱신 설정 시 DNS 플러그인 필요 (certbot-dns-cloudflare 등, 가비아는 API 미지원이므로 수동 또는 Cloudflare NS 위임 검토)

---

## 인프라 구조

### 전체 아키텍처

```
nginx (호스트, 리버스 프록시 + 와일드카드 SSL)
│
│── syworkspace.cloud           → SyOps        (systemd, :8300)
│
│── drop.syworkspace.cloud      → [Docker] quickdrop          (:8200)
│── news.syworkspace.cloud      → [정적]  /opt/data/news-agent/web
│── voca.syworkspace.cloud      → [Docker] voca-drill         (:8201)
│── lesson.syworkspace.cloud    → [Docker] lesson-assist      (:8202)
│── school.syworkspace.cloud    → [Docker] school-sync        (:8203)
│── aram.syworkspace.cloud      → [Docker] aram-bot           (:8204)
│── agent.syworkspace.cloud     → [Docker] the-agent          (:8205)
│── chat.syworkspace.cloud      → [특수]   RunPod 프록시 or 외부 GPU
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
| 8200 | QuickDrop | 기존 유지 |
| 8201 | Voca_Drill | 신규 |
| 8202 | lesson-assist | 신규 |
| 8203 | school_sync | 신규 |
| 8204 | aram_mayhem_bot | 신규 |
| 8205 | The_Agent | 신규 |
| 8300 | SyOps | 기존 유지 |

### 디렉토리 구조 (VPS)

```
/opt/
├── apps/                      # git clone 대상 (코드)
│   ├── news-agent/
│   ├── quickdrop/
│   ├── syops/
│   ├── voca-drill/            # 신규
│   ├── lesson-assist/         # 신규
│   ├── school-sync/           # 신규
│   ├── aram-bot/              # 신규
│   ├── the-agent/             # 신규
│   └── bottycoon-bot/         # 신규
├── envs/                      # 환경변수 (chmod 700)
│   ├── news-agent.env
│   ├── quickdrop.env
│   ├── syops.env
│   ├── voca-drill.env         # 신규
│   ├── lesson-assist.env      # 신규
│   ├── school-sync.env        # 신규
│   ├── aram-bot.env           # 신규
│   ├── the-agent.env          # 신규
│   └── bottycoon-bot.env      # 신규
├── data/                      # 런타임 데이터 (git 외부)
│   ├── news-agent/
│   ├── quickdrop/
│   ├── voca-drill/            # 신규
│   ├── lesson-assist/         # 신규
│   ├── school-sync/           # 신규
│   ├── aram-bot/              # 신규
│   ├── the-agent/             # 신규
│   └── bottycoon-bot/         # 신규
├── logs/
├── scripts/
└── backups/
```

### Docker 표준 템플릿

각 서비스의 Docker 구성 통일:

```
/opt/apps/<project>/
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── .env                   # → /opt/envs/<project>.env 심링크 또는 직접 생성
├── (소스코드)
└── ...

/opt/data/<project>/           # 런타임 데이터 (Docker 바인드 마운트)
/opt/envs/<project>.env        # 환경변수 (chmod 600)
```

기존 `SyOps/deploy/templates/` 템플릿 그대로 활용.

---

## SyOps 포털 역할

### syworkspace.cloud 루트를 허브로 전환

현재: `syworkspace.cloud` → `drop.syworkspace.cloud` 리다이렉트

변경: SyOps 포털이 루트 도메인에서 직접 서비스

```
SyOps 포털 (syworkspace.cloud)
├── 서비스 카탈로그         → 카테고리별 서비스 카드 + 바로가기 링크
├── 상태 모니터링           → Docker 컨테이너 + systemd 서비스 health check
├── BotTycoon 대시보드      → 봇 상태 / 로그 / 경제 시스템 조회
└── 관리 기능               → 재시작, 로그 조회, 배포 트리거
```

### 서비스 카탈로그 카테고리

포털에서 서비스를 보여줄 때의 분류:

| 카테고리 | 서비스 | 서브도메인 | 설명 |
|----------|--------|------------|------|
| **생산성** | lesson-assist | `lesson` | 수업 녹음 → 요약 |
| **생산성** | school_sync | `school` | LMS 통합 Q&A |
| **생산성** | Voca_Drill | `voca` | 영단어 학습 |
| **유틸리티** | QuickDrop | `drop` | 파일 공유 |
| **유틸리티** | News_Agent | `news` | 뉴스 브리핑 |
| **AI/챗** | The_Agent | `agent` | AI 개인 비서 |
| **AI/챗** | PrivateLLM | `chat` | AI 챗봇 |
| **AI/챗** | aram_mayhem_bot | `aram` | LoL 메타 분석 |
| **Discord** | BotTycoon-discord-bot | - | 서버 운영 봇 (대시보드 전용) |

---

## nginx 설정 구조

### 현재 → 변경

현재: `/etc/nginx/sites-available/services` 단일 파일에 모든 server block

변경: 서비스별 파일 분리 (서비스 10개 이상이면 관리성 향상)

```
/etc/nginx/
├── sites-available/
│   ├── syops.conf              # syworkspace.cloud → :8300
│   ├── quickdrop.conf          # drop.syworkspace.cloud → :8200
│   ├── news-agent.conf         # news.syworkspace.cloud → 정적 파일
│   ├── voca-drill.conf         # voca.syworkspace.cloud → :8201
│   ├── lesson-assist.conf      # lesson.syworkspace.cloud → :8202
│   ├── school-sync.conf        # school.syworkspace.cloud → :8203
│   ├── aram-bot.conf           # aram.syworkspace.cloud → :8204
│   ├── the-agent.conf          # agent.syworkspace.cloud → :8205
│   └── privatellm.conf         # chat.syworkspace.cloud → RunPod 프록시
├── sites-enabled/              # 활성화된 서비스만 심링크
├── snippets/
│   └── security-headers.conf   # 공통 보안 헤더 (기존 유지)
└── nginx.conf
```

### nginx server block 표준 템플릿

```nginx
server {
    listen 443 ssl http2;
    server_name <subdomain>.syworkspace.cloud;

    ssl_certificate     /etc/letsencrypt/live/syworkspace.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/syworkspace.cloud/privkey.pem;

    include snippets/security-headers.conf;

    location / {
        proxy_pass http://127.0.0.1:<port>;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 서비스 추가 체크리스트 (개정)

새 서비스 배포 시:

1. `/opt/apps/<project>`에 git clone
2. `/opt/data/<project>/` 데이터 디렉토리 생성
3. `/opt/envs/<project>.env` 환경변수 파일 생성 (chmod 600)
4. `docker/.env` → `/opt/envs/<project>.env` 심링크 (또는 직접 생성)
5. `cd /opt/apps/<project>/docker && docker compose up -d --build`
6. `/etc/nginx/sites-available/<project>.conf` 작성 (표준 템플릿 기반)
7. `ln -s /etc/nginx/sites-available/<project>.conf /etc/nginx/sites-enabled/`
8. 가비아 DNS에 A 레코드 추가: `<subdomain>` → `46.250.251.82`
9. `sudo nginx -t && sudo systemctl reload nginx`
10. 와일드카드 SSL이므로 certbot 불필요 (이미 커버됨)
11. SyOps 서비스 카탈로그에 서비스 등록

---

## 리소스 영향 분석

### 현재 서버 상태

- CPU: 6 vCPU
- RAM: 12 GB
- 디스크: 96 GB SSD (9.9G 사용 / 86G 여유)
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

단, lesson-assist의 whisper 추론은 CPU 집약적이므로 동시 요청 시 다른 서비스에 영향 가능. 2-3명 규모에서는 문제 없음.

---

## 구현 우선순위

### 즉시 (인프라 개선)

1. `syworkspace.cloud` 루트를 SyOps 포털로 변경 (리다이렉트 제거)
2. 와일드카드 SSL 인증서 발급
3. nginx 설정 파일 분리

### 서비스 배포 순서 (development-roadmap.md 블록 순서 따름)

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

## 변경 요약

| 항목 | 현재 | 변경 후 |
|------|------|---------|
| 루트 도메인 | `drop`으로 리다이렉트 | SyOps 포털 (허브) |
| SSL | 서브도메인별 개별 인증서 | 와일드카드 `*.syworkspace.cloud` |
| nginx 설정 | 단일 파일 | 서비스별 파일 분리 |
| 서비스 배포 | 수동 (서비스마다 다름) | Docker 표준 템플릿 통일 |
| 서비스 접근 | 서브도메인 직접 접속 | 포털 허브 + 서브도메인 직접 접속 |
| 서비스 모니터링 | SyOps에서 일부만 | 전체 Docker + systemd 통합 모니터링 |
