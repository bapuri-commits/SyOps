# SyOps 계정 시스템

> 2026-03-12 구현 완료. HTTP Basic Auth → JWT 기반 계정 시스템으로 전환.

## 단계 분류

| Level | 이름 | 설명 | 상태 |
|-------|------|------|------|
| Lv.0 | 공유 잠금 | 비밀번호 하나, 사용자 구분 없음 | 완료 (이전) |
| **Lv.2** | **토큰 인증** | **JWT Access/Refresh, DB, 역할 분리** | **구현 완료** |
| Lv.3 | SSO/OAuth | 소셜 로그인, 자체 인증 서버 | 향후 검토 |

> Lv.1(기본 세션)과 Lv.2의 구현 난이도 차이가 미미하므로 Lv.1은 건너뜀.

## 확정 설정

| 항목 | 값 |
|------|-----|
| Access Token 수명 | 30분 |
| Refresh Token 수명 | 30일 |
| Access Token 저장 | 메모리 (React state) |
| Refresh Token 저장 | httpOnly Cookie (`syops_refresh`, path=/api/auth) |
| 회원가입 | 관리자가 사용자 생성 (`POST /api/auth/users`) |
| 초기 admin | CLI 스크립트 (`python -m backend.scripts.create_admin`) |
| DB 마이그레이션 | Alembic |
| OAuth | 나중에 (Lv.3 단계) |

## 기술 스택

| 항목 | 선택 |
|------|------|
| 인증 | JWT (PyJWT, HS256) |
| DB | SQLite (aiosqlite + SQLAlchemy async) |
| 해싱 | bcrypt (passlib) |
| 권한 | Role 기반 (admin / user) |
| 마이그레이션 | Alembic |

## API 엔드포인트

| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| POST | `/api/auth/login` | - | 로그인, Access Token + Refresh Cookie 발급 |
| POST | `/api/auth/refresh` | Cookie | 새 Access Token 발급 (Rotation 적용) |
| POST | `/api/auth/logout` | Cookie | Refresh Token 무효화 |
| GET | `/api/auth/me` | Bearer | 현재 사용자 정보 |
| POST | `/api/auth/users` | Bearer (admin) | 새 사용자 생성 |

## DB 모델

`backend/models/user.py`에 정의:

- **User**: id, username(unique), hashed_password, role, is_active, created_at, last_login
- **RefreshToken**: id, user_id(FK), token_hash(SHA-256), expires_at, revoked, created_at

## 구현 체크리스트

### Phase 1: 백엔드

- [x] SQLAlchemy + aiosqlite + PyJWT + passlib + alembic 의존성 추가
- [x] User, RefreshToken 모델 + Alembic 초기 마이그레이션
- [x] 초기 admin 계정 생성 스크립트
- [x] `core/auth.py` JWT 기반으로 재작성
- [x] `/api/auth/*` 라우터 추가
- [x] 기존 라우터 인증 의존성 전환 (`require_auth` → `get_current_user`)

### Phase 2: 프론트엔드

- [x] AuthContext → Bearer 방식 재작성 (메모리 토큰 + Cookie refresh)
- [x] Login 페이지 수정 (username + password)
- [x] 토큰 갱신 로직 (401 → refresh → 재시도)
- [x] Dashboard 로그아웃 시 서버 호출 추가

### Phase 3: 확장 (필요 시)

- [ ] 역할 기반 UI 분기
- [ ] 사용자 관리 페이지 (admin)
- [ ] Rate Limiting on `/api/auth/login`

## 보안

- [x] bcrypt 해싱
- [x] JWT 서명 키 환경변수 관리 (`SYOPS_SECRET_KEY`)
- [x] Access Token 짧은 수명 (30분)
- [x] Refresh Token Rotation
- [x] Cookie: Secure, HttpOnly, SameSite=Strict
- [ ] `/api/auth/login` Rate Limiting (Phase 3)

## 사용법

### admin 계정 생성

```bash
# SyOps/ 디렉토리에서 실행
python -m backend.scripts.create_admin
```

### 사용자 추가 (admin 로그인 후)

```bash
curl -X POST https://syworkspace.cloud/api/auth/users \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"username": "newuser", "password": "password", "role": "user"}'
```
