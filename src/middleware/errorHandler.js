/**
 * 전역 에러 핸들링 미들웨어
 * Laravel-style 에러 처리 및 필리핀 현지화 대응
 */

const logger = require('../utils/logger');

/**
 * 404 Not Found 핸들러
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

/**
 * 글로벌 에러 핸들러
 */
const errorHandler = (error, req, res, next) => {
  const statusCode = error.status || error.statusCode || 500;
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // 에러 로깅 (필리핀 타임존)
  logger.error('Application error', {
    requestId: req.id,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    error: {
      message: error.message,
      status: statusCode,
      stack: isDevelopment ? error.stack : undefined
    }
  });

  // 에러 응답 구조 (Laravel Illuminate 스타일)
  const errorResponse = {
    success: false,
    message: error.message || 'Internal Server Error',
    status: statusCode,
    timestamp: new Date().toISOString(),
    timezone: 'Asia/Manila',
    path: req.originalUrl,
    requestId: req.id,
  };

  // 개발 환경에서만 스택 트레이스 포함
  if (isDevelopment) {
    errorResponse.stack = error.stack;
    errorResponse.details = error.details || null;
  }

  // 특정 에러 타입별 처리
  switch (statusCode) {
    case 400:
      errorResponse.type = 'validation_error';
      errorResponse.message = error.message || 'Bad Request';
      break;
      
    case 401:
      errorResponse.type = 'authentication_error';
      errorResponse.message = 'Authentication required';
      break;
      
    case 403:
      errorResponse.type = 'authorization_error';
      errorResponse.message = 'Access forbidden';
      break;
      
    case 404:
      errorResponse.type = 'not_found_error';
      errorResponse.message = 'Resource not found';
      break;
      
    case 422:
      errorResponse.type = 'validation_error';
      errorResponse.errors = error.errors || null;
      break;
      
    case 429:
      errorResponse.type = 'rate_limit_error';
      errorResponse.message = 'Too many requests';
      errorResponse.retryAfter = error.retryAfter || 60;
      break;
      
    case 500:
    default:
      errorResponse.type = 'internal_server_error';
      errorResponse.message = isDevelopment ? error.message : 'Internal Server Error';
      
      // 프로덕션에서는 민감한 정보 숨김
      if (!isDevelopment) {
        errorResponse.message = 'Something went wrong. Please try again later.';
      }
      break;
  }

  // 결제 관련 에러 특별 처리 (필리핀 결제 게이트웨이)
  if (error.isPaymentError) {
    errorResponse.type = 'payment_error';
    errorResponse.gateway = error.gateway;
    errorResponse.paymentId = error.paymentId;
    errorResponse.merchantReference = error.merchantReference;
    
    // 고객에게 표시할 안전한 메시지
    errorResponse.customerMessage = getCustomerFriendlyMessage(error.code);
  }

  // ECOUNT ERP 연동 에러 처리
  if (error.isEcountError) {
    errorResponse.type = 'ecount_integration_error';
    errorResponse.ecountErrorCode = error.ecountErrorCode;
    
    // ERP 시스템 에러는 내부 로그만 기록
    if (!isDevelopment) {
      errorResponse.message = 'System integration error. Please contact support.';
    }
  }

  // DPA 컴플라이언스 위반 에러
  if (error.isDpaViolation) {
    errorResponse.type = 'data_privacy_error';
    errorResponse.message = 'Data privacy policy violation detected';
    
    // DPA 위반은 특별 로깅
    logger.error('DPA compliance violation', {
      requestId: req.id,
      violation: error.violation,
      affectedData: error.affectedData,
      ip: req.ip
    });
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * 비동기 에러 처리 래퍼
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 커스텀 에러 클래스들
 */
class AppError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, errors = null) {
    super(message, 422);
    this.errors = errors;
  }
}

class PaymentError extends AppError {
  constructor(message, gateway, paymentId = null, merchantReference = null, code = null) {
    super(message, 402); // 402 Payment Required
    this.isPaymentError = true;
    this.gateway = gateway;
    this.paymentId = paymentId;
    this.merchantReference = merchantReference;
    this.code = code;
  }
}

class EcountError extends AppError {
  constructor(message, ecountErrorCode = null) {
    super(message, 503); // 503 Service Unavailable
    this.isEcountError = true;
    this.ecountErrorCode = ecountErrorCode;
  }
}

class DpaError extends AppError {
  constructor(message, violation, affectedData = null) {
    super(message, 403);
    this.isDpaViolation = true;
    this.violation = violation;
    this.affectedData = affectedData;
  }
}

/**
 * 고객 친화적인 결제 에러 메시지 (필리핀 현지화)
 */
function getCustomerFriendlyMessage(errorCode) {
  const messages = {
    'CARD_DECLINED': 'Your card was declined. Please try a different payment method or contact your bank.',
    'INSUFFICIENT_FUNDS': 'Insufficient funds in your account. Please try a different payment method.',
    'INVALID_CARD': 'Invalid card information. Please check your card details and try again.',
    'EXPIRED_CARD': 'Your card has expired. Please use a different card.',
    'GCASH_UNAVAILABLE': 'GCash is currently unavailable. Please try again later or use a different payment method.',
    'BDO_UNAVAILABLE': 'BDO online banking is currently unavailable. Please try again later.',
    'NETWORK_ERROR': 'Network connection error. Please check your internet connection and try again.',
    'TIMEOUT': 'Payment request timed out. Please try again.',
    'DUPLICATE_TRANSACTION': 'This transaction has already been processed.',
    'INVALID_AMOUNT': 'Invalid payment amount. Please check and try again.',
    'MAINTENANCE': 'Payment system is under maintenance. Please try again later.',
    'UNKNOWN': 'An unexpected error occurred. Please try again or contact customer support.'
  };

  return messages[errorCode] || messages.UNKNOWN;
}

/**
 * Validation 에러 포매터 (express-validator 연동)
 */
const formatValidationErrors = (errors) => {
  const formatted = {};
  
  errors.forEach(error => {
    if (!formatted[error.param]) {
      formatted[error.param] = [];
    }
    formatted[error.param].push(error.msg);
  });

  return formatted;
};

module.exports = {
  notFound,
  errorHandler,
  asyncHandler,
  AppError,
  ValidationError,
  PaymentError,
  EcountError,
  DpaError,
  formatValidationErrors
};