/**
 * 웹 라우트 (고객 쇼핑몰 및 관리자 패널)
 * Laravel-style 라우팅
 */

const express = require('express');
const path = require('path');
const router = express.Router();

// 정적 파일 제공을 위한 미들웨어
const serveStatic = (filePath, contentType = 'text/html') => {
  return (req, res) => {
    res.sendFile(path.join(__dirname, '../../public', filePath));
  };
};

// 홈페이지 (고객 쇼핑몰)
router.get('/', (req, res) => {
  res.json({
    message: '🇵🇭 필리핀 전자상거래 플랫폼에 오신 것을 환영합니다!',
    features: [
      '🛒 온라인 쇼핑몰',
      '💳 필리핀 현지 결제 (PayMongo, Xendit, Dragonpay)',
      '📱 GCash, BDO 연동 (2차 개발)',
      '🔄 ECOUNT ERP 자동 동기화',
      '📋 BIR 전자영수증 발행',
      '🔒 DPA 개인정보보호 준수'
    ],
    currency: 'PHP (₱)',
    timezone: 'Asia/Manila',
    version: '1.0.0'
  });
});

// 상품 목록
router.get('/products', (req, res) => {
  res.json({
    message: 'Product catalog page',
    note: 'This will be replaced with Vue.js frontend'
  });
});

// 상품 상세
router.get('/products/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    message: `Product detail page for product ID: ${id}`,
    note: 'This will be replaced with Vue.js frontend'
  });
});

// 장바구니
router.get('/cart', (req, res) => {
  res.json({
    message: 'Shopping cart page',
    note: 'This will be replaced with Vue.js frontend'
  });
});

// 결제 페이지
router.get('/checkout', (req, res) => {
  res.json({
    message: 'Checkout page',
    supportedPayments: [
      'Credit/Debit Cards (PayMongo)',
      'GCash (PayMongo)',
      'GrabPay (PayMongo)',
      'Bank Transfer (Xendit)',
      'eWallets (Xendit)',
      'Over-the-counter (Dragonpay)',
      '7-Eleven, Cebuana, MLhuillier, etc.'
    ],
    note: 'This will be replaced with Vue.js frontend'
  });
});

// 주문 확인
router.get('/order/confirmation/:orderId', (req, res) => {
  const { orderId } = req.params;
  res.json({
    message: `Order confirmation page for order: ${orderId}`,
    note: 'This will be replaced with Vue.js frontend'
  });
});

// 고객 계정 페이지들
router.get('/account', (req, res) => {
  res.json({
    message: 'Customer account dashboard',
    note: 'This will be replaced with Vue.js frontend'
  });
});

router.get('/account/orders', (req, res) => {
  res.json({
    message: 'Customer order history',
    note: 'This will be replaced with Vue.js frontend'
  });
});

router.get('/account/profile', (req, res) => {
  res.json({
    message: 'Customer profile settings',
    note: 'This will be replaced with Vue.js frontend'
  });
});

// 관리자 패널 라우트
router.get('/admin', (req, res) => {
  res.json({
    message: '🔐 관리자 대시보드',
    features: [
      '📊 실시간 매출 대시보드',
      '📦 주문 관리',
      '🛍️ 상품 관리',
      '👥 고객 관리',
      '💳 결제 내역',
      '🔄 ECOUNT ERP 동기화 상태',
      '📋 BIR 영수증 관리',
      '🔒 DPA 개인정보 관리',
      '⚙️ 시스템 설정'
    ],
    currency: 'PHP (₱)',
    timezone: 'Asia/Manila',
    note: 'This will be replaced with Vue.js admin panel'
  });
});

// 관리자 패널 서브페이지들
router.get('/admin/dashboard', (req, res) => {
  res.json({
    message: 'Admin dashboard with sales analytics',
    note: 'Vue.js dashboard with real-time data'
  });
});

router.get('/admin/orders', (req, res) => {
  res.json({
    message: 'Order management interface',
    note: 'Vue.js order management with ECOUNT sync status'
  });
});

router.get('/admin/products', (req, res) => {
  res.json({
    message: 'Product management interface',
    note: 'Vue.js product management with ECOUNT inventory sync'
  });
});

router.get('/admin/customers', (req, res) => {
  res.json({
    message: 'Customer management interface',
    note: 'Vue.js customer management with DPA compliance'
  });
});

router.get('/admin/payments', (req, res) => {
  res.json({
    message: 'Payment management interface',
    gateways: ['PayMongo', 'Xendit', 'Dragonpay', 'GCash (planned)', 'BDO (planned)'],
    note: 'Vue.js payment management dashboard'
  });
});

router.get('/admin/ecount', (req, res) => {
  res.json({
    message: 'ECOUNT ERP integration dashboard',
    features: [
      'Real-time inventory sync',
      'Order sync status',
      'Customer sync status',
      'Manual sync triggers',
      'Error logs and resolution'
    ],
    note: 'Vue.js ECOUNT integration management'
  });
});

router.get('/admin/compliance', (req, res) => {
  res.json({
    message: 'Compliance management dashboard',
    regulations: [
      'BIR Electronic Receipt Generation',
      'DPA Data Privacy Compliance',
      'BSP Payment System Regulations',
      'DTI Consumer Protection'
    ],
    note: 'Vue.js compliance management interface'
  });
});

// 정적 페이지들
router.get('/privacy-policy', (req, res) => {
  res.json({
    message: 'Privacy Policy (DPA Compliant)',
    note: 'Static page with Philippines DPA compliance details'
  });
});

router.get('/terms-of-service', (req, res) => {
  res.json({
    message: 'Terms of Service',
    note: 'Static page with Philippines e-commerce terms'
  });
});

router.get('/shipping-info', (req, res) => {
  res.json({
    message: 'Shipping Information',
    coverage: 'Nationwide Philippines delivery',
    note: 'Static page with shipping details and rates'
  });
});

router.get('/contact', (req, res) => {
  res.json({
    message: 'Contact Information',
    location: 'Philippines',
    timezone: 'Asia/Manila',
    note: 'Contact page with Philippines business hours'
  });
});

// 에러 페이지들
router.get('/404', (req, res) => {
  res.status(404).json({
    message: 'Page Not Found',
    note: 'Custom 404 page'
  });
});

router.get('/500', (req, res) => {
  res.status(500).json({
    message: 'Internal Server Error',
    note: 'Custom 500 page'
  });
});

// 개발용 테스트 페이지들
if (process.env.NODE_ENV === 'development') {
  router.get('/dev/test-payment', (req, res) => {
    res.json({
      message: 'Payment Gateway Test Page',
      gateways: {
        paymongo: {
          status: 'configured',
          environment: process.env.PAYMONGO_ENVIRONMENT || 'sandbox'
        },
        xendit: {
          status: 'configured', 
          environment: process.env.XENDIT_ENVIRONMENT || 'test'
        },
        dragonpay: {
          status: 'configured',
          environment: process.env.DRAGONPAY_ENVIRONMENT || 'sandbox'
        }
      },
      note: 'Development only - test payment integrations'
    });
  });

  router.get('/dev/test-ecount', (req, res) => {
    res.json({
      message: 'ECOUNT ERP Test Page',
      connection: {
        status: 'configured',
        baseUrl: process.env.ECOUNT_API_BASE_URL,
        autoSync: process.env.ECOUNT_AUTO_SYNC === 'true'
      },
      note: 'Development only - test ECOUNT integration'
    });
  });
}

module.exports = router;