#!/bin/bash
# 프로젝트 배포 자동화 스크립트
# 사용법: ./deploy.sh <project> [restart]
#   ./deploy.sh quickdrop         # git pull + docker rebuild
#   ./deploy.sh quickdrop restart # git pull + docker rebuild + restart
#   ./deploy.sh syops restart     # git pull + venv/build + systemd restart

set -euo pipefail

PROJECT="${1:?프로젝트명을 지정하세요 (quickdrop|news-agent|syops|nginx)}"
ACTION="${2:-pull}"

APPS_DIR="/opt/apps"

deploy_docker_service() {
  local project_dir="$1"
  local compose_dir="$project_dir/docker"

  cd "$project_dir"
  git pull

  if [ ! -f "$compose_dir/docker-compose.yml" ]; then
    echo "[ERROR] $compose_dir/docker-compose.yml 없음"
    exit 1
  fi

  cd "$compose_dir"
  docker compose up -d --build
  echo "[OK] $PROJECT Docker 배포 완료"
}

case "$PROJECT" in
  quickdrop)
    deploy_docker_service "$APPS_DIR/quickdrop"
    ;;
  news-agent)
    cd "$APPS_DIR/news-agent"
    git pull
    echo "[OK] news-agent 코드 업데이트 완료 (정적 서빙이므로 재시작 불필요)"
    ;;
  syops)
    cd "$APPS_DIR/syops"
    git pull

    cd backend
    if [ ! -d .venv ]; then
      python3 -m venv .venv
    fi
    .venv/bin/pip install -q -e .
    cd ..

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
