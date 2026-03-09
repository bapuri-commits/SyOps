#!/bin/bash
# 서비스 헬스체크 스크립트
# 사용법: ./health-check.sh
# cron 등록 예: */5 * * * * /opt/apps/syops/deploy/scripts/health-check.sh

set -uo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

check_url() {
  local name="$1"
  local url="$2"
  local status
  status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null)
  if [ "$status" -ge 200 ] && [ "$status" -lt 400 ]; then
    echo -e "${GREEN}[OK]${NC} $name ($url) — HTTP $status"
  else
    echo -e "${RED}[FAIL]${NC} $name ($url) — HTTP $status"
  fi
}

check_service() {
  local name="$1"
  if systemctl is-active --quiet "$name"; then
    echo -e "${GREEN}[OK]${NC} $name.service — active"
  else
    echo -e "${RED}[FAIL]${NC} $name.service — inactive"
  fi
}

echo "=== 서비스 헬스체크 ($(date)) ==="
echo ""

echo "--- systemd 서비스 ---"
check_service nginx
check_service quickdrop

echo ""
echo "--- HTTP 엔드포인트 ---"
check_url "QuickDrop" "https://drop.syworkspace.cloud"
check_url "News_Agent" "https://news.syworkspace.cloud"
check_url "Root" "https://syworkspace.cloud"

echo ""
echo "--- 시스템 리소스 ---"
echo "CPU: $(grep 'cpu ' /proc/stat | awk '{usage=($2+$4)*100/($2+$4+$5)} END {printf "%.1f%%", usage}')"
echo "RAM: $(free -m | awk '/Mem:/ {printf "%.1f%% (%dMB / %dMB)", $3/$2*100, $3, $2}')"
echo "Disk: $(df -h / | awk 'NR==2 {printf "%s (%s / %s)", $5, $3, $2}')"
echo ""

echo "=== 완료 ==="
