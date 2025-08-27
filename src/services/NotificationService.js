/**
 * 푸시 알림 및 통합 알림 서비스
 * 웹 푸시, SMS, 이메일 통합 관리
 */

const SMSService = require('./SMSService');

class NotificationService {
  constructor() {
    this.notificationTypes = {
      ORDER_PLACED: 'order_placed',
      ORDER_CONFIRMED: 'order_confirmed',
      ORDER_SHIPPED: 'order_shipped',
      ORDER_DELIVERED: 'order_delivered',
      ORDER_CANCELLED: 'order_cancelled',
      PAYMENT_COMPLETED: 'payment_completed',
      PAYMENT_FAILED: 'payment_failed',
      CREDIT_CHARGED: 'credit_charged',
      CREDIT_LOW: 'credit_low',
      STOCK_LOW: 'stock_low',
      PROMOTION: 'promotion',
      WELCOME: 'welcome',
      TIER_UPGRADE: 'tier_upgrade'
    };

    this.channels = {
      WEB_PUSH: 'web_push',
      SMS: 'sms',
      EMAIL: 'email',
      IN_APP: 'in_app'
    };

    // 알림 템플릿
    this.templates = {
      [this.notificationTypes.ORDER_PLACED]: {
        title: {
          ko: '주문이 접수되었습니다',
          en: 'Order Placed Successfully',
          tl: 'Matagumpay na Na-order'
        },
        body: {
          ko: '주문번호 {orderId}가 접수되었습니다. 총 금액: ₱{amount}',
          en: 'Order {orderId} has been placed. Total: ₱{amount}',
          tl: 'Ang order {orderId} ay nailagay na. Total: ₱{amount}'
        },
        icon: '/icons/order-success.png',
        sound: 'order_success.mp3',
        channels: ['web_push', 'sms', 'in_app']
      },

      [this.notificationTypes.ORDER_CONFIRMED]: {
        title: {
          ko: '주문이 확정되었습니다',
          en: 'Order Confirmed',
          tl: 'Nakumpirma ang Order'
        },
        body: {
          ko: '주문번호 {orderId}가 확정되어 준비 중입니다.',
          en: 'Order {orderId} has been confirmed and is being prepared.',
          tl: 'Ang order {orderId} ay nakumpirma at inihahanda na.'
        },
        icon: '/icons/order-confirmed.png',
        channels: ['web_push', 'in_app']
      },

      [this.notificationTypes.ORDER_SHIPPED]: {
        title: {
          ko: '상품이 배송 시작되었습니다',
          en: 'Order Shipped',
          tl: 'Naipadala ang Order'
        },
        body: {
          ko: '주문번호 {orderId}가 배송 시작되었습니다. 예상 도착일: {estimatedDelivery}',
          en: 'Order {orderId} has been shipped. Estimated delivery: {estimatedDelivery}',
          tl: 'Ang order {orderId} ay naipadala na. Estimated delivery: {estimatedDelivery}'
        },
        icon: '/icons/shipping.png',
        actionButtons: [
          { action: 'track', label: { ko: '배송 추적', en: 'Track Order', tl: 'I-track' } }
        ],
        channels: ['web_push', 'sms', 'in_app']
      },

      [this.notificationTypes.ORDER_DELIVERED]: {
        title: {
          ko: '배송 완료',
          en: 'Order Delivered',
          tl: 'Naihatid ang Order'
        },
        body: {
          ko: '주문번호 {orderId}가 성공적으로 배송되었습니다.',
          en: 'Order {orderId} has been delivered successfully.',
          tl: 'Ang order {orderId} ay matagumpay na naihatid.'
        },
        icon: '/icons/delivered.png',
        actionButtons: [
          { action: 'review', label: { ko: '리뷰 작성', en: 'Write Review', tl: 'Sumulat ng Review' } }
        ],
        channels: ['web_push', 'sms', 'in_app']
      },

      [this.notificationTypes.CREDIT_CHARGED]: {
        title: {
          ko: '크레딧 충전 완료',
          en: 'Credit Charged Successfully',
          tl: 'Matagumpay na Na-charge ang Credit'
        },
        body: {
          ko: '₱{amount} 충전 완료. 보너스: ₱{bonus}. 현재 잔액: ₱{balance}',
          en: '₱{amount} charged successfully. Bonus: ₱{bonus}. Current balance: ₱{balance}',
          tl: '₱{amount} na-charge na. Bonus: ₱{bonus}. Kasalukuyang balance: ₱{balance}'
        },
        icon: '/icons/credit-success.png',
        channels: ['web_push', 'in_app']
      },

      [this.notificationTypes.CREDIT_LOW]: {
        title: {
          ko: '크레딧 부족 알림',
          en: 'Low Credit Balance',
          tl: 'Mababang Credit Balance'
        },
        body: {
          ko: '크레딧 잔액이 ₱{balance}입니다. 충전을 권장합니다.',
          en: 'Your credit balance is ₱{balance}. Please consider charging.',
          tl: 'Ang inyong credit balance ay ₱{balance}. Mag-charge po.'
        },
        icon: '/icons/credit-low.png',
        actionButtons: [
          { action: 'charge', label: { ko: '충전하기', en: 'Charge Now', tl: 'Mag-charge Ngayon' } }
        ],
        channels: ['web_push', 'in_app']
      },

      [this.notificationTypes.TIER_UPGRADE]: {
        title: {
          ko: '등급 승급 축하드립니다!',
          en: 'Congratulations on Your Tier Upgrade!',
          tl: 'Congratulations sa Inyong Tier Upgrade!'
        },
        body: {
          ko: '{tierName} 등급으로 승급하셨습니다! 새로운 혜택을 확인하세요.',
          en: 'You have been upgraded to {tierName}! Check out your new benefits.',
          tl: 'Na-upgrade kayo sa {tierName}! Tingnan ang mga bagong benefits.'
        },
        icon: '/icons/tier-upgrade.png',
        actionButtons: [
          { action: 'benefits', label: { ko: '혜택 보기', en: 'View Benefits', tl: 'Tingnan ang Benefits' } }
        ],
        channels: ['web_push', 'sms', 'in_app']
      }
    };

    // 사용자별 알림 설정
    this.userPreferences = new Map();
  }

  /**
   * 웹 푸시 알림 전송
   */
  async sendWebPushNotification(userId, notificationType, data = {}, options = {}) {
    try {
      const user = await this.getUserInfo(userId);
      if (!user || !user.pushSubscription) {
        console.log('사용자 푸시 구독 정보 없음:', userId);
        return { success: false, reason: 'No push subscription' };
      }

      const template = this.templates[notificationType];
      if (!template) {
        throw new Error('알 수 없는 알림 타입: ' + notificationType);
      }

      const language = user.preferredLanguage || 'en';
      const notification = this.buildNotification(template, data, language);

      // Service Worker를 통한 웹 푸시 발송
      if (process.env.NODE_ENV === 'production') {
        const webpush = require('web-push');
        
        webpush.setVapidDetails(
          'mailto:support@kingsfood.ph',
          process.env.VAPID_PUBLIC_KEY,
          process.env.VAPID_PRIVATE_KEY
        );

        const payload = JSON.stringify({
          title: notification.title,
          body: notification.body,
          icon: notification.icon,
          badge: '/icons/badge.png',
          tag: notificationType,
          data: {
            type: notificationType,
            ...data,
            timestamp: Date.now()
          },
          actions: notification.actionButtons || [],
          requireInteraction: options.requireInteraction || false,
          silent: options.silent || false
        });

        const result = await webpush.sendNotification(user.pushSubscription, payload);
        return { success: true, result };
      } else {
        // 개발 환경에서는 시뮬레이션
        console.log('웹 푸시 알림 시뮬레이션:', {
          userId,
          title: notification.title,
          body: notification.body,
          data
        });
        return { success: true, simulated: true };
      }
    } catch (error) {
      console.error('웹 푸시 알림 전송 오류:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * SMS 알림 전송
   */
  async sendSMSNotification(userId, notificationType, data = {}) {
    try {
      const user = await this.getUserInfo(userId);
      if (!user || !user.phone) {
        return { success: false, reason: 'No phone number' };
      }

      // SMS 알림 설정 확인
      const preferences = this.getUserNotificationPreferences(userId);
      if (!preferences.sms.enabled || !preferences.sms.types.includes(notificationType)) {
        return { success: false, reason: 'SMS notifications disabled for this type' };
      }

      const template = this.templates[notificationType];
      if (!template || !template.channels.includes('sms')) {
        return { success: false, reason: 'SMS not supported for this notification type' };
      }

      const language = user.preferredLanguage || 'en';
      const notification = this.buildNotification(template, data, language);

      // SMS 메시지 구성
      const smsMessage = `[King's Food] ${notification.title}\n${notification.body}`;
      
      const result = await SMSService.sendSMS(user.phone, smsMessage, {
        type: 'notification',
        notificationType
      });

      return result;
    } catch (error) {
      console.error('SMS 알림 전송 오류:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 인앱 알림 전송 (실시간)
   */
  async sendInAppNotification(userId, notificationType, data = {}) {
    try {
      const template = this.templates[notificationType];
      if (!template || !template.channels.includes('in_app')) {
        return { success: false, reason: 'In-app notification not supported' };
      }

      const user = await this.getUserInfo(userId);
      const language = user?.preferredLanguage || 'en';
      const notification = this.buildNotification(template, data, language);

      // 실시간 알림 데이터 구성
      const inAppNotification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: notificationType,
        title: notification.title,
        body: notification.body,
        icon: notification.icon,
        data: data,
        timestamp: new Date().toISOString(),
        read: false,
        actions: notification.actionButtons || []
      };

      // WebSocket이나 Server-Sent Events를 통한 실시간 전송
      // 실제 구현에서는 Socket.io나 다른 실시간 통신 라이브러리 사용
      if (global.io) {
        global.io.to(`user_${userId}`).emit('notification', inAppNotification);
      }

      // 데이터베이스에 알림 저장 (읽지 않은 알림 관리용)
      await this.saveNotificationToDatabase(userId, inAppNotification);

      return { success: true, notification: inAppNotification };
    } catch (error) {
      console.error('인앱 알림 전송 오류:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 이메일 알림 전송 (미래 확장용)
   */
  async sendEmailNotification(userId, notificationType, data = {}) {
    try {
      const user = await this.getUserInfo(userId);
      if (!user || !user.email) {
        return { success: false, reason: 'No email address' };
      }

      // 이메일 발송 로직은 향후 구현
      // Nodemailer나 SendGrid 등 사용 예정
      console.log('이메일 알림 (향후 구현):', { userId, notificationType, data });
      
      return { success: true, pending: true, message: '이메일 알림 기능은 향후 구현 예정입니다.' };
    } catch (error) {
      console.error('이메일 알림 전송 오류:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 통합 알림 전송 (모든 활성화된 채널로 전송)
   */
  async sendNotification(userId, notificationType, data = {}, options = {}) {
    const results = {};

    try {
      const preferences = this.getUserNotificationPreferences(userId);
      const template = this.templates[notificationType];

      if (!template) {
        throw new Error('알 수 없는 알림 타입: ' + notificationType);
      }

      // 웹 푸시 알림
      if (template.channels.includes('web_push') && 
          preferences.webPush.enabled && 
          preferences.webPush.types.includes(notificationType)) {
        results.webPush = await this.sendWebPushNotification(userId, notificationType, data, options.webPush);
      }

      // SMS 알림
      if (template.channels.includes('sms') && 
          preferences.sms.enabled && 
          preferences.sms.types.includes(notificationType)) {
        results.sms = await this.sendSMSNotification(userId, notificationType, data);
      }

      // 인앱 알림 (항상 전송)
      if (template.channels.includes('in_app')) {
        results.inApp = await this.sendInAppNotification(userId, notificationType, data);
      }

      // 이메일 알림 (향후)
      if (template.channels.includes('email') && 
          preferences.email.enabled && 
          preferences.email.types.includes(notificationType)) {
        results.email = await this.sendEmailNotification(userId, notificationType, data);
      }

      // 알림 전송 로그 기록
      await this.logNotificationActivity(userId, notificationType, data, results);

      return { success: true, results };
    } catch (error) {
      console.error('통합 알림 전송 오류:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 사용자 알림 설정 가져오기
   */
  getUserNotificationPreferences(userId) {
    // 기본 설정
    const defaultPreferences = {
      webPush: {
        enabled: true,
        types: [
          this.notificationTypes.ORDER_PLACED,
          this.notificationTypes.ORDER_SHIPPED,
          this.notificationTypes.ORDER_DELIVERED,
          this.notificationTypes.CREDIT_CHARGED,
          this.notificationTypes.TIER_UPGRADE
        ]
      },
      sms: {
        enabled: true,
        types: [
          this.notificationTypes.ORDER_PLACED,
          this.notificationTypes.ORDER_SHIPPED,
          this.notificationTypes.ORDER_DELIVERED
        ]
      },
      email: {
        enabled: false, // 기본 비활성화
        types: []
      },
      inApp: {
        enabled: true, // 항상 활성화
        types: Object.values(this.notificationTypes)
      }
    };

    return this.userPreferences.get(userId) || defaultPreferences;
  }

  /**
   * 사용자 알림 설정 업데이트
   */
  updateUserNotificationPreferences(userId, preferences) {
    this.userPreferences.set(userId, preferences);
    
    // 실제 구현에서는 데이터베이스에 저장
    console.log('알림 설정 업데이트:', { userId, preferences });
  }

  /**
   * 알림 템플릿으로 메시지 구성
   */
  buildNotification(template, data, language) {
    const title = this.interpolateString(template.title[language] || template.title.en, data);
    const body = this.interpolateString(template.body[language] || template.body.en, data);
    
    return {
      title,
      body,
      icon: template.icon,
      sound: template.sound,
      actionButtons: template.actionButtons?.map(button => ({
        ...button,
        title: button.label[language] || button.label.en
      }))
    };
  }

  /**
   * 문자열 템플릿 보간
   */
  interpolateString(template, data) {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return data[key] !== undefined ? data[key] : match;
    });
  }

  /**
   * 사용자 정보 가져오기 (Mock)
   */
  async getUserInfo(userId) {
    // 실제 구현에서는 데이터베이스에서 사용자 정보 조회
    return {
      id: userId,
      phone: '+63-917-123-4567', // Mock 데이터
      email: 'user@example.com',
      preferredLanguage: 'en',
      pushSubscription: process.env.NODE_ENV === 'production' ? null : { 
        endpoint: 'mock_endpoint',
        keys: { p256dh: 'mock_key', auth: 'mock_auth' }
      }
    };
  }

  /**
   * 알림을 데이터베이스에 저장
   */
  async saveNotificationToDatabase(userId, notification) {
    try {
      // 실제 구현에서는 MongoDB에 저장
      console.log('알림 저장:', { userId, notification: notification.title });
    } catch (error) {
      console.error('알림 저장 오류:', error);
    }
  }

  /**
   * 알림 활동 로그 기록
   */
  async logNotificationActivity(userId, type, data, results) {
    try {
      const logData = {
        userId,
        notificationType: type,
        data,
        results,
        timestamp: new Date(),
        success: Object.values(results).some(r => r.success)
      };

      console.log('알림 로그:', logData);
      // 실제 구현에서는 로그 데이터베이스에 저장
    } catch (error) {
      console.error('알림 로그 기록 오류:', error);
    }
  }

  /**
   * 대량 알림 전송 (프로모션용)
   */
  async sendBulkNotification(userIds, notificationType, data = {}, options = {}) {
    const results = [];
    const batchSize = options.batchSize || 100;
    const delay = options.delay || 500; // 0.5초 대기

    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);
      const batchPromises = batch.map(userId => 
        this.sendNotification(userId, notificationType, data, options)
      );

      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults);

      // 다음 배치 전 대기
      if (i + batchSize < userIds.length && delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      console.log(`대량 알림 진행률: ${Math.min(i + batchSize, userIds.length)}/${userIds.length}`);
    }

    return {
      totalSent: results.filter(r => r.status === 'fulfilled').length,
      totalFailed: results.filter(r => r.status === 'rejected').length,
      details: results
    };
  }
}

module.exports = new NotificationService();