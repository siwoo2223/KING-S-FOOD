/**
 * 애플리케이션 핵심 설정
 * 필리핀 현지화 및 전자상거래 전용 설정
 */

module.exports = {
  app: {
    name: process.env.APP_NAME || 'Philippines E-Commerce Platform',
    env: process.env.APP_ENV || 'development',
    debug: process.env.APP_DEBUG === 'true',
    url: process.env.APP_URL || 'http://localhost:3000',
    port: parseInt(process.env.APP_PORT) || 3000,
    key: process.env.APP_KEY || 'philippines-ecommerce-secret-key',
    
    // 필리핀 현지화 설정
    timezone: process.env.APP_TIMEZONE || 'Asia/Manila',
    locale: process.env.APP_LOCALE || 'en',
    fallback_locale: process.env.APP_FALLBACK_LOCALE || 'en',
    currency: process.env.APP_CURRENCY || 'PHP',
    currency_symbol: process.env.APP_CURRENCY_SYMBOL || '₱',
  },

  database: {
    url: process.env.DATABASE_URL,
    connection: process.env.DB_CONNECTION || 'postgresql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_DATABASE || 'philippines_ecommerce',
    username: process.env.DB_USERNAME || 'username',
    password: process.env.DB_PASSWORD || 'password',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || null,
    db: parseInt(process.env.REDIS_DB) || 0,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'philippines-ecommerce-jwt-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  cors: {
    origin: process.env.CORS_ORIGIN ? 
      process.env.CORS_ORIGIN.split(',') : 
      ['http://localhost:3000', 'http://localhost:8080'],
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },

  mail: {
    mailer: process.env.MAIL_MAILER || 'smtp',
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.MAIL_PORT) || 587,
    username: process.env.MAIL_USERNAME,
    password: process.env.MAIL_PASSWORD,
    encryption: process.env.MAIL_ENCRYPTION || 'tls',
    from: {
      address: process.env.MAIL_FROM_ADDRESS || 'noreply@yourdomain.com',
      name: process.env.MAIL_FROM_NAME || process.env.APP_NAME || 'Philippines E-Commerce',
    },
  },

  // 필리핀 SMS 설정
  sms: {
    provider: process.env.SMS_PROVIDER || 'semaphore',
    api_key: process.env.SMS_API_KEY,
    sender_name: process.env.SMS_SENDER_NAME || 'YourShop',
  },

  // 파일 업로드 설정
  upload: {
    max_size: parseInt(process.env.UPLOAD_MAX_SIZE) || 10485760, // 10MB
    allowed_types: process.env.UPLOAD_ALLOWED_TYPES ? 
      process.env.UPLOAD_ALLOWED_TYPES.split(',') : 
      ['jpg', 'jpeg', 'png', 'gif', 'pdf'],
    path: process.env.UPLOAD_PATH || './public/uploads',
  },

  // 보안 설정
  security: {
    rate_limit: {
      window_ms: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
      max_requests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    },
    session: {
      secret: process.env.SESSION_SECRET || 'philippines-ecommerce-session-secret',
      cookie: {
        max_age: parseInt(process.env.SESSION_COOKIE_MAX_AGE) || 86400000, // 24 hours
        secure: process.env.SESSION_COOKIE_SECURE === 'true',
        http_only: process.env.SESSION_COOKIE_HTTP_ONLY !== 'false',
      },
    },
  },

  // 결제 게이트웨이 설정 (필리핀)
  payments: {
    // PayMongo (주요 결제수단)
    paymongo: {
      public_key: process.env.PAYMONGO_PUBLIC_KEY,
      secret_key: process.env.PAYMONGO_SECRET_KEY,
      webhook_secret: process.env.PAYMONGO_WEBHOOK_SECRET,
      environment: process.env.PAYMONGO_ENVIRONMENT || 'sandbox',
      base_url: process.env.PAYMONGO_ENVIRONMENT === 'live' ? 
        'https://api.paymongo.com/v1' : 
        'https://api.paymongo.com/v1',
    },

    // Xendit (대안 결제수단)
    xendit: {
      public_key: process.env.XENDIT_PUBLIC_KEY,
      secret_key: process.env.XENDIT_SECRET_KEY,
      webhook_token: process.env.XENDIT_WEBHOOK_TOKEN,
      environment: process.env.XENDIT_ENVIRONMENT || 'test',
      base_url: process.env.XENDIT_ENVIRONMENT === 'live' ? 
        'https://api.xendit.co' : 
        'https://api.xendit.co',
    },

    // Dragonpay (Over-the-counter 결제)
    dragonpay: {
      merchant_id: process.env.DRAGONPAY_MERCHANT_ID,
      secret_key: process.env.DRAGONPAY_SECRET_KEY,
      environment: process.env.DRAGONPAY_ENVIRONMENT || 'sandbox',
      base_url: process.env.DRAGONPAY_ENVIRONMENT === 'live' ? 
        'https://gw.dragonpay.ph' : 
        'https://test.dragonpay.ph',
    },

    // GCash (직접 연동 - 2차 개발)
    gcash: {
      partner_id: process.env.GCASH_PARTNER_ID,
      partner_secret: process.env.GCASH_PARTNER_SECRET,
      environment: process.env.GCASH_ENVIRONMENT || 'sandbox',
    },

    // BDO (직접 연동 - 2차 개발)
    bdo: {
      merchant_id: process.env.BDO_MERCHANT_ID,
      api_key: process.env.BDO_API_KEY,
      environment: process.env.BDO_ENVIRONMENT || 'sandbox',
    },
  },

  // ECOUNT ERP 연동 설정
  ecount: {
    api_base_url: process.env.ECOUNT_API_BASE_URL || 'https://api.ecount.co.kr',
    company_id: process.env.ECOUNT_COMPANY_ID,
    user_id: process.env.ECOUNT_USER_ID,
    api_key: process.env.ECOUNT_API_KEY,
    sync_interval: parseInt(process.env.ECOUNT_SYNC_INTERVAL) || 300000, // 5 minutes
    
    // 동기화 설정
    auto_sync: process.env.ECOUNT_AUTO_SYNC === 'true',
    inventory_sync: process.env.ECOUNT_INVENTORY_SYNC !== 'false',
    order_sync: process.env.ECOUNT_ORDER_SYNC !== 'false',
    customer_sync: process.env.ECOUNT_CUSTOMER_SYNC !== 'false',
  },

  // 필리핀 컴플라이언스 설정
  compliance: {
    // BIR (Bureau of Internal Revenue) 전자영수증
    bir: {
      tin: process.env.BIR_TIN,
      permit_number: process.env.BIR_PERMIT_NUMBER,
      accreditation_number: process.env.BIR_ACCREDITATION_NUMBER,
      environment: process.env.BIR_ENVIRONMENT || 'sandbox',
    },
    
    // DPA (Data Privacy Act) 설정
    dpa: {
      compliance_mode: process.env.DPA_COMPLIANCE_MODE || 'strict',
      data_retention_days: parseInt(process.env.DPA_DATA_RETENTION_DAYS) || 365,
      consent_required: process.env.DPA_CONSENT_REQUIRED !== 'false',
    },
  },

  // 로깅 설정
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    retention_days: parseInt(process.env.LOG_RETENTION_DAYS) || 30,
  },

  // 개발 도구 설정
  dev: {
    swagger_enabled: process.env.SWAGGER_ENABLED !== 'false',
    swagger_path: process.env.SWAGGER_PATH || '/api/docs',
    cors_enabled: process.env.DEV_CORS_ENABLED !== 'false',
    mock_payments: process.env.DEV_MOCK_PAYMENTS === 'true',
    mock_sms: process.env.DEV_MOCK_SMS === 'true',
    mock_email: process.env.DEV_MOCK_EMAIL === 'true',
  },
};