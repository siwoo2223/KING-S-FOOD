/**
 * 웹훅 API 라우트
 * 결제 게이트웨이 콜백 처리 및 자동화 트리거
 */

const express = require('express');
const router = express.Router();

// PayMongo 웹훅 처리
router.post('/paymongo', (req, res) => {
  // 실제 구현에서는 webhook signature 검증 필요
  const event = req.body;
  
  res.status(200).json({
    success: true,
    message: 'PayMongo webhook received',
    data: {
      event_type: event.data?.attributes?.type || 'unknown',
      event_id: event.data?.id || 'unknown',
      processed_at: new Date().toISOString(),
      actions_triggered: [
        'Payment status update',
        'ECOUNT inventory sync',
        'BIR receipt generation',
        'Customer notification'
      ],
      note: 'Will be implemented with PayMongo webhook controller'
    }
  });
});

// Xendit 웹훅 처리
router.post('/xendit', (req, res) => {
  // 실제 구현에서는 callback token 검증 필요
  const event = req.body;
  
  res.status(200).json({
    success: true,
    message: 'Xendit webhook received',
    data: {
      event_type: event.event || 'unknown',
      payment_id: event.id || 'unknown',
      processed_at: new Date().toISOString(),
      actions_triggered: [
        'Payment status update',
        'Order fulfillment',
        'Customer notification'
      ],
      note: 'Will be implemented with Xendit webhook controller'
    }
  });
});

// Dragonpay 웹훅 처리
router.post('/dragonpay', (req, res) => {
  // 실제 구현에서는 digest hash 검증 필요
  const event = req.body;
  
  res.status(200).json({
    success: true,
    message: 'Dragonpay webhook received',
    data: {
      transaction_id: event.txnid || 'unknown',
      reference_number: event.refno || 'unknown',
      status: event.status || 'unknown',
      processed_at: new Date().toISOString(),
      actions_triggered: [
        'Payment confirmation',
        'Order processing',
        'Inventory update'
      ],
      note: 'Will be implemented with Dragonpay webhook controller'
    }
  });
});

// GCash 웹훅 처리 (직접 연동 시)
router.post('/gcash', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'GCash webhook received',
    data: {
      note: 'Will be implemented when GCash direct integration is ready'
    }
  });
});

// BDO 웹훅 처리 (직접 연동 시)
router.post('/bdo', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'BDO webhook received',
    data: {
      note: 'Will be implemented when BDO direct integration is ready'
    }
  });
});

// ECOUNT ERP 웹훅 (ERP 시스템에서 보내는 알림)
router.post('/ecount', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ECOUNT webhook received',
    data: {
      event_type: req.body.event_type || 'unknown',
      entity_type: req.body.entity_type || 'unknown',
      entity_id: req.body.entity_id || 'unknown',
      processed_at: new Date().toISOString(),
      actions_triggered: [
        'Inventory sync',
        'Order status update',
        'Customer notification'
      ],
      note: 'Will be implemented with ECOUNT integration controller'
    }
  });
});

// 일반 시스템 웹훅 (내부 시스템 간 통신)
router.post('/system', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'System webhook received',
    data: {
      event: req.body.event || 'unknown',
      source: req.body.source || 'unknown',
      processed_at: new Date().toISOString(),
      note: 'Internal system webhooks'
    }
  });
});

// 웹훅 로그 조회 (관리자용)
router.get('/logs', (req, res) => {
  res.json({
    success: true,
    message: 'Webhook logs retrieved',
    data: {
      logs: [],
      pagination: {
        current_page: 1,
        per_page: 50,
        total: 0,
        last_page: 1
      },
      filters: {
        source: req.query.source || null,
        event_type: req.query.event_type || null,
        status: req.query.status || null,
        date_from: req.query.date_from || null,
        date_to: req.query.date_to || null
      },
      summary: {
        total_webhooks: 0,
        successful: 0,
        failed: 0,
        pending: 0
      },
      note: 'Will be implemented with webhook log controller'
    }
  });
});

// 웹훅 재시도 (실패한 웹훅 처리)
router.post('/retry/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    success: true,
    message: 'Webhook retry initiated',
    data: {
      webhook_id: id,
      retry_attempt: 1,
      scheduled_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      note: 'Will be implemented with webhook retry system'
    }
  });
});

// 웹훅 테스트 (개발용)
if (process.env.NODE_ENV === 'development') {
  router.post('/test/:gateway', (req, res) => {
    const { gateway } = req.params;
    res.json({
      success: true,
      message: `Test webhook for ${gateway}`,
      data: {
        gateway: gateway,
        test_payload: req.body,
        processed_at: new Date().toISOString(),
        note: 'Development test webhook endpoint'
      }
    });
  });
}

module.exports = router;