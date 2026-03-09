---
type: reference
created: "2026-03-07"
updated: "2026-03-09"
origin: "The Record/3_Areas/Tools/vps-migration-plan.md에서 이관"
tags: [infra, vps, devops]
status: planning
---

# VPS 마이그레이션 계획

> Contabo → **Hetzner + Railway** 분리 구성으로 전환

## 배경

Contabo를 범용 VPS로 쓰고 있지만, 학습/실험 공간과 실용 서비스의 요구사항이 다르므로 분리 운영이 효율적.

| 구분 | 학습/실험 | 실용 서비스 |
|------|-----------|-------------|
| 핵심 가치 | 자유도, 부담 없이 실험 | 안정성, 상시 가동 |
| 다운타임 | 상관없음 | 치명적 |
| 환경 변경 | 수시로 | 건드리면 안 됨 |
| 비용 구조 | 유연하면 좋음 | 상시 과금 OK |

## 구성 계획

### 1. 학습/실험 서버: Hetzner Cloud

- **스펙**: CX22 (2vCPU / 4GB RAM) 기준
- **비용**: 월 ~€4.5 (~6,500~8,000원), 시간당 과금
- **용도**: Docker 실험, LLM 테스트, 새 기술 PoC, CI/CD 구축, MCP 서버 실험
- **장점**: 스냅샷 저장/복원, 서버 자유 생성/삭제, Terraform/API 연동, 네트워크 품질 우수

### 2. 실용 서비스: Railway

- **비용**: 무료 티어 → Hobby $5/월 (약 7,000원)
- **용도**: 웹앱 배포, 크롤러 스케줄, API 서버
- **장점**: GitHub 연동 자동 배포, DB/Redis 원클릭 추가, 인프라 관리 부담 제로

## 비용 비교

```
현재: Contabo 1대        → 월 ~$7~12 (약 10,000~17,000원)

전환 후:
  Hetzner CX22 (학습)    → 월 ~€4.5  (약 6,500~8,000원)
  Railway Hobby (서비스)  → 월 ~$0~5  (약 0~7,000원)
  합계                    → 월 약 8,000~15,000원
```

## 후보 비교

| 서비스 | 가성비 | 서울 리전 | 관리 편의 | GPU | 적합 용도 |
|--------|--------|-----------|-----------|-----|-----------|
| **Hetzner** | ★★★★★ | ✗ | 보통 | ✗ | 범용 학습 서버 |
| **Vultr** | ★★★★ | ✓ | 보통 | ✓ | 한국 레이턴시 중요 시 |
| **DigitalOcean** | ★★★ | ✗(싱가포르) | ★★★★★ | ✗ | 관리 편의 중시 |
| **Railway/Render** | - | - | ★★★★★ | ✗ | 웹앱 배포 전용 |

> **최종 선택**: Hetzner(학습) + Railway(서비스)
> Vultr는 서울 리전 필요 시(MC 서버 등) 대안으로 보류.

## 마이그레이션 체크리스트

- [ ] Contabo 현재 구동 중인 서비스 목록 정리
- [ ] Hetzner Cloud 계정 생성
- [ ] Railway 계정 생성 + GitHub 연동
- [ ] 학습 서버 초기 세팅 (Docker, SSH 키 등)
- [ ] 서비스별 마이그레이션 실행
- [ ] Contabo 데이터 백업 확인
- [ ] Contabo 해지

## 참고

- Hetzner Cloud: https://www.hetzner.com/cloud
- Railway: https://railway.app
- Vultr (대안): https://www.vultr.com
