#!/bin/bash
# 프로젝트 배포 자동화 스크립트
# 사용법: ./deploy.sh <project> [restart]
#   ./deploy.sh quickdrop         # git pull만
#   ./deploy.sh quickdrop restart # git pull + 서비스 재시작

set -euo pipefail

PROJECT="${1:?프로젝트명을 지정하세요 (quickdrop|news-agent|syops|nginx)}"
ACTION="${2:-pull}"

APPS_DIR="/opt/apps"

case "$PROJECT" in
  quickdrop)
    cd "$APPS_DIR/quickdrop"
    git pull
    if [ "$ACTION" = "restart" ]; then
      sudo systemctl restart quickdrop
      echo "[OK] quickdrop 재시작 완료"
    fi
    ;;
  news-agent)
    cd "$APPS_DIR/news-agent"
    git pull
    echo "[OK] news-agent 코드 업데이트 완료 (정적 서빙이므로 재시작 불필요)"
    ;;
  syops)
    cd "$APPS_DIR/syops"
    git pull

    # Backend venv update
    cd backend
    if [ ! -d .venv ]; then
      python3 -m venv .venv
    fi
    .venv/bin/pip install -q -e .
    cd ..

    # Frontend build
    cd frontend
    npm ci --silent
    npm run build
    cd ..

    if [ "$ACTION" = "restart" ]; then
      sudo systemctl restart syops
      echo "[OK] syops 백엔드 재시작 완료"
    fi
    echo "[OK] syops 프론트엔드 빌드 완료"
    ;;
  nginx)
    sudo nginx -t && sudo systemctl reload nginx
    echo "[OK] nginx 설정 리로드 완료"
    ;;
  *)
    echo "[ERROR] 알 수 없는 프로젝트: $PROJECT"
    echo "사용 가능: quickdrop, news-agent, syops, nginx"
    exit 1
    ;;
esac

echo "[DONE] $PROJECT 배포 완료 ($(date))"
