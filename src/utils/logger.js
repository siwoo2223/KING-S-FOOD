/**
 * 필리핀 타임존 기반 로깅 유틸리티
 * Winston 기반 구조화된 로깅
 */

const winston = require('winston');
const path = require('path');

// 필리핀 타임존 포매터
const philippineTimezone = winston.format((info) => {
  const now = new Date();
  const philippineTime = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(now);

  const formatted = `${philippineTime[4].value}-${philippineTime[0].value}-${philippineTime[2].value} ${philippineTime[6].value}:${philippineTime[8].value}:${philippineTime[10].value}`;
  info.timestamp = formatted;
  info.timezone = 'Asia/Manila';
  
  return info;
});

// 로그 포맷 정의
const logFormat = winston.format.combine(
  philippineTimezone(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `[${timestamp}] [${level.toUpperCase()}]`;
    
    if (meta.requestId) {
      log += ` [${meta.requestId}]`;
    }
    
    log += ` ${message}`;
    
    if (Object.keys(meta).length > 0 && !meta.requestId) {
      log += ` ${JSON.stringify(meta)}`;
    }
    
    if (stack) {
      log += `\\n${stack}`;
    }
    
    return log;
  })
);

// 콘솔 포맷 (개발용)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  philippineTimezone(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `🇵🇭 [${timestamp}] ${level}: ${message}`;
    
    if (meta.requestId) {
      log = `🇵🇭 [${timestamp}] [${meta.requestId}] ${level}: ${message}`;
    }
    
    if (stack) {
      log += `\\n${stack}`;
    }
    
    return log;
  })
);

// 로그 레벨 설정
const logLevel = process.env.LOG_LEVEL || 'info';

// Winston 로거 생성
const logger = winston.createLogger({
  level: logLevel,
  format: logFormat,
  defaultMeta: {
    service: 'philippines-ecommerce',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // 에러 로그 파일
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    }),
    
    // 결합 로그 파일
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    }),
  ],
  
  // 처리되지 않은 예외 처리
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'exceptions.log'),
      maxsize: 5242880,
      maxFiles: 5,
    })
  ],
  
  // 처리되지 않은 거부 처리
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'rejections.log'),
      maxsize: 5242880,
      maxFiles: 5,
    })
  ]
});

// 개발 환경에서 콘솔 출력 추가
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// 필리핀 전자상거래 전용 로깅 헬퍼
const ecommerceLogger = {
  // 주문 관련 로깅
  order: {
    created: (orderId, customerId, amount) => {
      logger.info('Order created', {
        event: 'order.created',
        orderId,
        customerId,
        amount: `₱${amount}`,
        currency: 'PHP'
      });
    },
    
    updated: (orderId, status, previousStatus) => {
      logger.info('Order status updated', {
        event: 'order.updated',
        orderId,
        status,
        previousStatus
      });
    },
    
    cancelled: (orderId, reason) => {
      logger.warn('Order cancelled', {
        event: 'order.cancelled',
        orderId,
        reason
      });
    }
  },

  // 결제 관련 로깅
  payment: {
    initiated: (paymentId, orderId, gateway, amount) => {
      logger.info('Payment initiated', {
        event: 'payment.initiated',
        paymentId,
        orderId,
        gateway,
        amount: `₱${amount}`,
        currency: 'PHP'
      });
    },
    
    completed: (paymentId, orderId, gateway) => {
      logger.info('Payment completed', {
        event: 'payment.completed',
        paymentId,
        orderId,
        gateway
      });
    },
    
    failed: (paymentId, orderId, gateway, error) => {
      logger.error('Payment failed', {
        event: 'payment.failed',
        paymentId,
        orderId,
        gateway,
        error: error.message
      });
    }
  },

  // ECOUNT ERP 연동 로깅
  ecount: {
    syncStarted: (type) => {
      logger.info('ECOUNT sync started', {
        event: 'ecount.sync.started',
        type
      });
    },
    
    syncCompleted: (type, recordsProcessed) => {
      logger.info('ECOUNT sync completed', {
        event: 'ecount.sync.completed',
        type,
        recordsProcessed
      });
    },
    
    syncFailed: (type, error) => {
      logger.error('ECOUNT sync failed', {
        event: 'ecount.sync.failed',
        type,
        error: error.message
      });
    },
    
    apiCall: (endpoint, method, status) => {
      logger.info('ECOUNT API call', {
        event: 'ecount.api.call',
        endpoint,
        method,
        status
      });
    }
  },

  // 보안 관련 로깅
  security: {
    loginAttempt: (email, success, ip) => {
      const level = success ? 'info' : 'warn';
      logger[level]('Login attempt', {
        event: 'security.login',
        email,
        success,
        ip
      });
    },
    
    suspiciousActivity: (description, ip, userId) => {
      logger.warn('Suspicious activity detected', {
        event: 'security.suspicious',
        description,
        ip,
        userId
      });
    },
    
    rateLimitExceeded: (ip, endpoint) => {
      logger.warn('Rate limit exceeded', {
        event: 'security.rate_limit',
        ip,
        endpoint
      });
    }
  },

  // 웹훅 관련 로깅
  webhook: {
    received: (source, eventType, id) => {
      logger.info('Webhook received', {
        event: 'webhook.received',
        source,
        eventType,
        id
      });
    },
    
    processed: (source, eventType, id, success) => {
      const level = success ? 'info' : 'error';
      logger[level]('Webhook processed', {
        event: 'webhook.processed',
        source,
        eventType,
        id,
        success
      });
    }
  }
};

// 기본 로거에 전자상거래 헬퍼 추가
logger.ecommerce = ecommerceLogger;

module.exports = logger;