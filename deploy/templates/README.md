# 서비스 배포 템플릿

새 서비스를 SyOps(syworkspace.cloud)에 배포할 때 사용하는 템플릿.

## 파일 목록

| 파일 | 용도 |
|------|------|
| `Dockerfile.fastapi` | FastAPI + uvicorn 서비스 기본 Dockerfile |
| `docker-compose.service.yml` | Docker Compose 템플릿 (포트, 볼륨, env 패턴) |
| `nginx-service.conf` | nginx server block 템플릿 |

## 새 서비스 추가 절차

### 1. 프로젝트 준비

```bash
# 프로젝트 내에 docker/ 디렉토리 생성
mkdir -p docker

# 템플릿 복사 후 수정
cp Dockerfile.fastapi ../프로젝트/docker/Dockerfile
cp docker-compose.service.yml ../프로젝트/docker/docker-compose.yml
```

각 파일의 플레이스홀더를 실제 값으로 수정:
- 서비스명, 포트, 볼륨 경로, 환경변수

### 2. VPS 배포

```bash
# 코드 클론
cd /opt/apps
git clone <repo-url> <project-name>

# 데이터 디렉토리 생성
mkdir -p /opt/data/<project-name>

# 환경변수 파일 생성
cat > /opt/apps/<project-name>/docker/.env << 'EOF'
DATA_DIR=/opt/data/<project-name>
# 서비스별 시크릿
EOF

# 컨테이너 시작
cd /opt/apps/<project-name>/docker
docker compose up -d --build
```

### 3. nginx 설정

```bash
# services 설정에 server block 추가
sudo nano /etc/nginx/sites-available/services

# 설정 검증 + 적용
sudo nginx -t && sudo systemctl reload nginx
```

### 4. SSL 발급

```bash
sudo certbot --nginx -d <subdomain>.syworkspace.cloud
```

### 5. HTTP → HTTPS 리다이렉트

`/etc/nginx/sites-available/services`의 HTTP 리다이렉트 블록에 새 서브도메인 추가:

```nginx
server {
    listen 80;
    server_name ... <subdomain>.syworkspace.cloud;
    return 301 https://$host$request_uri;
}
```

## 포트 할당 현황

| 포트 | 서비스 | 방식 |
|------|--------|------|
| 8200 | QuickDrop | Docker |
| 8300 | SyOps | systemd (호스트) |
| 8400~ | 새 서비스용 | Docker |
