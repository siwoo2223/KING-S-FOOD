/**
 * API 라우트 (RESTful API 엔드포인트)
 * Laravel-style API 리소스 라우팅
 */

const express = require('express');
const router = express.Router();

// API 정보 및 상태
router.get('/', (req, res) => {
  res.json({
    message: '🇵🇭 Philippines E-Commerce Platform API',
    version: 'v1.0.0',
    timezone: 'Asia/Manila',
    currency: 'PHP',
    endpoints: {
      authentication: '/auth',
      products: '/products',
      orders: '/orders', 
      payments: '/payments',
      customers: '/customers',
      admin: '/admin',
      webhooks: '/webhooks',
      ecount: '/ecount',
      compliance: '/compliance'
    },
    documentation: '/docs',
    status: 'active'
  });
});

// 인증 관련 라우트
router.use('/auth', require('./api/auth'));

// 상품 관련 라우트  
router.use('/products', require('./api/products'));

// 주문 관련 라우트
router.use('/orders', require('./api/orders'));

// 결제 관련 라우트
router.use('/payments', require('./api/payments'));

// 고객 관리 라우트
router.use('/customers', require('./api/customers'));

// 관리자 전용 라우트
router.use('/admin', require('./api/admin'));

// 웹훅 라우트 (결제 게이트웨이 콜백)
router.use('/webhooks', require('./api/webhooks'));

// ECOUNT ERP 연동 라우트
router.use('/ecount', require('./api/ecount'));

// 컴플라이언스 라우트 (BIR, DPA)
router.use('/compliance', require('./api/compliance'));

// 유틸리티 라우트
router.use('/utils', require('./api/utils'));

// 한국 식자재 전용 라우트
router.use('/korean-products', require('./api/korean-products'));

// 재고 관리 라우트
router.use('/inventory', require('./api/inventory-upload'));

// 이미지 처리 라우트
router.use('/images', require('./api/image-scraper'));

module.exports = router;