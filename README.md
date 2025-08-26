# 필리핀 전자상거래 플랫폼 (Philippines E-Commerce Platform)

## 프로젝트 개요

Laravel 스타일의 Node.js/Express 기반 필리핀 현지화 전자상거래 플랫폼으로, 필리핀 현지 결제 시스템(GCash, BDO)과 ECOUNT ERP를 완벽히 연동하는 엔드투엔드 자동화 시스템입니다.

## 핵심 특징

### 🇵🇭 필리핀 현지화
- **통화**: PHP (Philippine Peso) - ₱1,234.56 형식
- **타임존**: Asia/Manila 통합 적용
- **언어**: 영어 기본, 타갈로그어 확장 준비
- **컴플라이언스**: DPA(개인정보보호법), BIR 전자영수증 준수

### 💳 결제 시스템
- **1차 출시**: PSP 경유 (PayMongo, Xendit, Dragonpay)
- **2차 확장**: GCash, BDO 직접 연동
- **웹훅 자동화**: 결제확인 → 재고차감 → 영수증발행

### 🔄 ERP 연동
- **ECOUNT API**: 실시간 재고 동기화
- **자동 처리**: 주문 → 결제 → 재고업데이트 → 영수증
- **양방향 동기화**: 재고, 주문, 고객정보

## 기술 스택

### Backend
- **Node.js** v20.19.3 (Laravel-style architecture)
- **Express.js** (MVC pattern)
- **Prisma ORM** (Eloquent-like)
- **JWT Authentication**
- **Helmet.js** (Security)

### Database
- **PostgreSQL** (Production)
- **SQLite** (Development)

### Frontend
- **Vue.js 3** (Composition API)
- **Tailwind CSS**
- **Vite** (Build tool)

### Payment Gateways
- **PayMongo** (Cards, GCash, GrabPay)
- **Xendit** (Bank transfers, eWallets)
- **Dragonpay** (Over-the-counter payments)

### DevOps
- **PM2** (Process management)
- **Nginx** (Reverse proxy)
- **Docker** (Containerization)
- **GitHub Actions** (CI/CD)

## 프로젝트 구조

```
philippines-ecommerce/
├── src/
│   ├── controllers/         # Route controllers
│   ├── models/             # Database models (Prisma)
│   ├── middleware/         # Auth, validation middleware
│   ├── services/           # Business logic services
│   ├── utils/              # Helper utilities
│   └── routes/             # API routes
├── database/
│   ├── migrations/         # Database migrations
│   ├── seeders/           # Sample data
│   └── schema.prisma      # Database schema
├── public/                # Static assets
├── resources/
│   ├── views/             # Vue.js components
│   ├── js/                # Frontend JavaScript
│   └── css/               # Stylesheets
├── config/                # Configuration files
├── tests/                 # Unit and integration tests
├── docs/                  # Documentation
└── docker/                # Docker configurations
```

## 자동화 플로우

### 주문 처리 플로우
1. **고객 주문** → 장바구니 → 주문 생성
2. **결제 처리** → PSP 결제 페이지 리디렉션
3. **웹훅 수신** → 결제 상태 확인
4. **재고 차감** → ECOUNT API 호출
5. **영수증 발행** → BIR 규격 전자영수증
6. **알림 발송** → 이메일/SMS 고객 통지

### 재고 동기화
- **실시간 동기화**: ECOUNT ↔ 쇼핑몰
- **배치 업데이트**: 일일 재고 정산
- **알림 시스템**: 품절 임박 알림

## 개발 환경 설정

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
```bash
cp .env.example .env
# .env 파일에서 데이터베이스 및 API 키 설정
```

### 3. 데이터베이스 설정
```bash
npx prisma migrate dev
npx prisma db seed
```

### 4. 개발 서버 시작
```bash
npm run dev
```

## 배포

### Production 배포
```bash
# Docker 빌드
docker-compose -f docker/docker-compose.prod.yml up -d

# PM2 배포
npm run build
pm2 start ecosystem.config.js --env production
```

## API 문서

API 문서는 개발 서버 실행 후 `/api/docs`에서 확인할 수 있습니다.

## 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다.

## 지원

문의사항이 있으시면 이슈를 등록하거나 이메일로 연락해 주세요.

---

**Version**: 1.0.0  
**Last Updated**: 2025-08-26  
**Language**: English/Korean  
**Locale**: Philippines (Asia/Manila)