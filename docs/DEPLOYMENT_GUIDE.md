# King's Food Philippines - 배포 및 도메인 연결 가이드

## 🌐 도메인 구입 및 설정 가이드

### 1. 권장 도메인명
- `kingsfood.ph` (1순위 - 필리핀 도메인)
- `kingsfoodph.com` (2순위 - 국제 도메인)
- `kingsfoodphilippines.com` (3순위 - 대안)

### 2. 도메인 구입처 (Philippines)
- **Crazy Domains Philippines** - https://www.crazydomains.ph/
- **Web.com.ph** - https://web.com.ph/
- **Namecheap** - https://www.namecheap.com/
- **GoDaddy** - https://www.godaddy.com/

### 3. .ph 도메인 요구사항
- 필리핀 주소 필요
- 비즈니스 등록 서류 (DTI Certificate)
- 유효한 필리핀 연락처

## 🚀 클라우드 호스팅 옵션

### Option 1: DigitalOcean (권장)
**장점:**
- 필리핀 Singapore 데이터센터 제공
- 월 $12-25 (약 ₱600-1,250)
- 간단한 관리 인터페이스
- 자동 백업 지원

**설정 단계:**
1. DigitalOcean 계정 생성
2. Singapore 지역에 Droplet 생성
3. Ubuntu 20.04 선택
4. Basic Plan ($12/월) 선택
5. SSH 키 설정

### Option 2: AWS (Amazon Web Services)
**장점:**
- 글로벌 인프라
- ap-southeast-1 (Singapore) 리전
- 다양한 서비스 연동 가능
- 초기 12개월 무료 티어

**주요 서비스:**
- EC2 (서버 호스팅)
- RDS (MongoDB Atlas 대신 가능)
- S3 (이미지/파일 저장)
- CloudFront (CDN)

### Option 3: Google Cloud Platform
**장점:**
- 필리핀 Jakarta 리전
- 300$ 무료 크레딧
- Firebase 연동 쉬움
- 자동 스케일링

## 📂 서버 환경 설정

### 1. 필수 소프트웨어 설치
```bash
# Node.js 20.x 설치
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 설치 (프로세스 관리)
sudo npm install -g pm2

# Nginx 설치 (리버스 프록시)
sudo apt update
sudo apt install nginx

# MongoDB 설치 또는 MongoDB Atlas 사용
# 권장: MongoDB Atlas (클라우드 MongoDB)
```

### 2. 환경 변수 설정 (.env)
```env
NODE_ENV=production
PORT=3000
BASE_URL=https://kingsfood.ph

# 데이터베이스
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kingsfood

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRY=7d

# 결제 시스템
GCASH_MERCHANT_ID=your-gcash-merchant-id
GCASH_SECRET_KEY=your-gcash-secret-key
MAYA_PUBLIC_KEY=your-maya-public-key
MAYA_SECRET_KEY=your-maya-secret-key

# SMS 서비스
SMS_PROVIDER=semaphore
SEMAPHORE_API_KEY=your-semaphore-api-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token

# 보안
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### 3. Nginx 설정
```nginx
server {
    listen 80;
    server_name kingsfood.ph www.kingsfood.ph;
    
    # HTTPS 리디렉션
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name kingsfood.ph www.kingsfood.ph;
    
    # SSL 인증서 (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/kingsfood.ph/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/kingsfood.ph/privkey.pem;
    
    # 보안 헤더
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip 압축
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    
    # 정적 파일 캐싱
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔒 SSL 인증서 설치

### Let's Encrypt (무료)
```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d kingsfood.ph -d www.kingsfood.ph

# 자동 갱신 설정
sudo crontab -e
# 다음 줄 추가:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🗄️ 데이터베이스 설정

### MongoDB Atlas (권장)
1. **MongoDB Atlas 계정 생성**
   - https://www.mongodb.com/cloud/atlas
   
2. **클러스터 생성**
   - 지역: Singapore (ap-southeast-1)
   - 티어: M0 (무료) 또는 M2 ($9/월)
   
3. **보안 설정**
   - IP 화이트리스트 설정
   - 데이터베이스 사용자 생성
   
4. **연결 문자열 복사**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/kingsfood
   ```

## 📦 배포 프로세스

### 1. 코드 배포 자동화 (GitHub Actions)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '20'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.4
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /var/www/kingsfood
          git pull origin main
          npm ci --production
          pm2 reload ecosystem.config.js
```

### 2. 수동 배포
```bash
# 서버에서 실행
cd /var/www/kingsfood
git pull origin main
npm ci --production
pm2 reload ecosystem.config.js
```

## 🔧 환경별 설정

### 개발 환경 (현재)
- 포트: 3000
- 데이터베이스: 로컬 MongoDB
- SMS: 시뮬레이션 모드
- 결제: 테스트 모드

### 스테이징 환경
- 포트: 3001
- 서브도메인: staging.kingsfood.ph
- 실제 API 연동 테스트
- 제한된 사용자 접근

### 프로덕션 환경
- 포트: 3000 (Nginx 프록시)
- 도메인: kingsfood.ph
- 모든 실제 API 연동
- 전체 기능 활성화

## 📊 모니터링 및 로그

### PM2 모니터링
```bash
# 프로세스 상태 확인
pm2 status

# 실시간 로그 보기
pm2 logs

# 메모리/CPU 모니터링
pm2 monit

# 프로세스 재시작
pm2 restart all
```

### 로그 관리
```bash
# 로그 로테이션 설정
sudo nano /etc/logrotate.d/kingsfood

/var/log/kingsfood/*.log {
    daily
    missingok
    rotate 52
    compress
    notifempty
    create 0644 www-data www-data
}
```

## 🛡️ 보안 체크리스트

- [ ] SSL 인증서 설치 및 HTTPS 강제
- [ ] 환경 변수 보안 (.env 파일 보호)
- [ ] 데이터베이스 접근 제한 (IP 화이트리스트)
- [ ] Rate Limiting 설정
- [ ] 보안 헤더 설정
- [ ] 정기 백업 설정
- [ ] 방화벽 설정 (UFW)
- [ ] SSH 키 인증 설정
- [ ] 사용자 권한 최소화
- [ ] 로그 모니터링 설정

## 💰 예상 운영 비용 (월별)

### 최소 구성
- **도메인**: ₱500-1,000/년 (₱42-83/월)
- **서버**: DigitalOcean Basic ₱600/월
- **MongoDB Atlas**: 무료 (M0) 또는 ₱450/월 (M2)
- **SSL**: 무료 (Let's Encrypt)
- **총계**: **₱642-1,133/월**

### 권장 구성
- **도메인**: ₱1,000/년 (₱83/월)
- **서버**: DigitalOcean Standard ₱1,200/월
- **MongoDB**: ₱450/월 (M2)
- **CDN**: ₱200/월
- **백업**: ₱150/월
- **총계**: **₱2,083/월**

## 📞 기술 지원

### 호스팅 업체 지원
- **DigitalOcean**: 24/7 티켓 지원
- **MongoDB Atlas**: 커뮤니티 포럼 + 유료 지원
- **Cloudflare**: 무료 CDN 및 보안

### 추가 서비스
- **업타임 모니터링**: UptimeRobot (무료)
- **에러 추적**: Sentry (무료 티어)
- **성능 모니터링**: New Relic (무료 티어)

---

## 🚀 다음 단계

1. **도메인 구입** (kingsfood.ph 권장)
2. **DigitalOcean 서버 생성**
3. **MongoDB Atlas 클러스터 생성**
4. **DNS 설정** (도메인 → 서버 IP)
5. **SSL 인증서 설치**
6. **코드 배포 및 테스트**
7. **실제 API 키 설정**
8. **모니터링 시스템 구축**

**예상 설정 시간**: 4-6시간
**Go-Live 예상 시간**: 1-2일