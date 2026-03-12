# 와일드카드 SSL 설정 가이드

> `*.syworkspace.cloud` 와일드카드 인증서 발급을 위한 Cloudflare NS 위임 + certbot 설정.

## 1. Cloudflare 계정 설정

1. [Cloudflare](https://dash.cloudflare.com/sign-up) 무료 계정 생성
2. "Add a site" → `syworkspace.cloud` 입력 → Free 플랜 선택
3. Cloudflare가 기존 DNS 레코드를 자동 스캔. 다음 레코드가 있는지 확인:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `@` | `46.250.251.82` | DNS only |
| A | `drop` | `46.250.251.82` | DNS only |
| A | `news` | `46.250.251.82` | DNS only |

> Proxy status를 반드시 **DNS only** (회색 구름)로 설정. Cloudflare 프록시를 쓰면 certbot DNS 검증에 문제가 생길 수 있음.

4. Cloudflare가 제공하는 네임서버 2개를 메모 (예: `ns1.cloudflare.com`, `ns2.cloudflare.com`)

## 2. 가비아 네임서버 변경

1. [가비아 관리](https://dns.gabia.com) → `syworkspace.cloud` → 네임서버 설정
2. DNSSEC이 활성화되어 있다면 **먼저 비활성화**
3. 네임서버를 Cloudflare 제공 NS로 변경
4. 변경 후 최대 48시간 대기 (보통 수 시간)

### 확인

```bash
# DNS 전파 확인
dig syworkspace.cloud NS +short
# Cloudflare NS가 나오면 성공
```

## 3. Cloudflare API 토큰 생성

1. Cloudflare 대시보드 → My Profile → API Tokens
2. "Create Token" → "Edit zone DNS" 템플릿 선택
3. Zone Resources: `syworkspace.cloud` 만 선택
4. 토큰 생성 후 복사

## 4. VPS에 certbot 설정

```bash
# cloudflare 플러그인 설치
sudo apt install python3-certbot-dns-cloudflare

# API 토큰 파일 생성
sudo mkdir -p /opt/envs
sudo tee /opt/envs/cloudflare.ini > /dev/null << 'EOF'
dns_cloudflare_api_token = <여기에_토큰_붙여넣기>
EOF
sudo chmod 600 /opt/envs/cloudflare.ini

# 와일드카드 인증서 발급
sudo certbot certonly --dns-cloudflare \
  --dns-cloudflare-credentials /opt/envs/cloudflare.ini \
  -d "syworkspace.cloud" -d "*.syworkspace.cloud"
```

## 5. nginx SSL 경로 전환

발급 성공 후 인증서 경로:
```
/etc/letsencrypt/live/syworkspace.cloud/fullchain.pem
/etc/letsencrypt/live/syworkspace.cloud/privkey.pem
```

모든 nginx server block의 SSL 경로를 위 경로로 변경:
```nginx
ssl_certificate     /etc/letsencrypt/live/syworkspace.cloud/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/syworkspace.cloud/privkey.pem;
```

## 6. 자동 갱신 확인

```bash
sudo certbot renew --dry-run
```

certbot의 systemd timer가 자동으로 갱신을 처리함. Cloudflare DNS 플러그인 덕분에 수동 TXT 레코드 교체 불필요.

## 7. 롤백

문제 발생 시:
- 기존 개별 인증서는 `/etc/letsencrypt/live/drop.syworkspace.cloud/`에 그대로 남아있음
- nginx SSL 경로를 원복하면 즉시 롤백 가능
- 가비아에서 네임서버를 원래 값으로 되돌리면 Cloudflare 위임 해제
