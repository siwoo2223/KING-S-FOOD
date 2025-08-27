/**
 * 실제 SMS 서비스 연동
 * Philippines 전용 SMS 발송 서비스
 */

const axios = require('axios');

class SMSService {
  constructor() {
    this.providers = {
      // Twilio 설정 (권장)
      twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        fromNumber: process.env.TWILIO_FROM_NUMBER || '+1234567890',
        apiUrl: 'https://api.twilio.com/2010-04-01'
      },
      
      // AWS SNS 설정
      aws_sns: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'ap-southeast-1',
        senderId: process.env.AWS_SNS_SENDER_ID || 'KINGSFOOD'
      },

      // Semaphore Philippines 설정 (현지 SMS 서비스)
      semaphore: {
        apiKey: process.env.SEMAPHORE_API_KEY,
        senderId: process.env.SEMAPHORE_SENDER_ID || 'KINGSFOOD',
        apiUrl: 'https://api.semaphore.co'
      },

      // Globe Labs Philippines
      globe: {
        appId: process.env.GLOBE_APP_ID,
        appSecret: process.env.GLOBE_APP_SECRET,
        shortCode: process.env.GLOBE_SHORT_CODE || '21581234',
        apiUrl: 'https://devapi.globelabs.com.ph'
      }
    };

    // 기본 프로바이더 설정 (Semaphore 권장 - 필리핀 현지)
    this.defaultProvider = process.env.SMS_PROVIDER || 'semaphore';
  }

  /**
   * Twilio SMS 발송
   */
  async sendTwilioSMS(to, message, options = {}) {
    try {
      const { twilio } = this.providers;
      
      const smsData = {
        From: twilio.fromNumber,
        To: to,
        Body: message
      };

      if (process.env.NODE_ENV === 'production') {
        const auth = Buffer.from(`${twilio.accountSid}:${twilio.authToken}`).toString('base64');
        
        const response = await axios.post(
          `${twilio.apiUrl}/Accounts/${twilio.accountSid}/Messages.json`,
          new URLSearchParams(smsData),
          {
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );

        return {
          success: true,
          messageId: response.data.sid,
          status: response.data.status,
          provider: 'twilio'
        };
      } else {
        return {
          success: true,
          messageId: `twilio_sim_${Date.now()}`,
          status: 'sent',
          provider: 'twilio_simulation'
        };
      }
    } catch (error) {
      console.error('Twilio SMS 발송 오류:', error);
      throw new Error('Twilio SMS 발송에 실패했습니다.');
    }
  }

  /**
   * Semaphore Philippines SMS 발송 (현지 추천)
   */
  async sendSemaphoreSMS(to, message, options = {}) {
    try {
      const { semaphore } = this.providers;
      
      const smsData = {
        apikey: semaphore.apiKey,
        number: to,
        message: message,
        sendername: semaphore.senderId
      };

      if (process.env.NODE_ENV === 'production') {
        const response = await axios.post(
          `${semaphore.apiUrl}/api/v4/messages`,
          smsData,
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );

        return {
          success: true,
          messageId: response.data[0]?.message_id || `semaphore_${Date.now()}`,
          status: response.data[0]?.status || 'Sent',
          provider: 'semaphore',
          cost: response.data[0]?.cost || 0
        };
      } else {
        return {
          success: true,
          messageId: `semaphore_sim_${Date.now()}`,
          status: 'Sent',
          provider: 'semaphore_simulation'
        };
      }
    } catch (error) {
      console.error('Semaphore SMS 발송 오류:', error);
      throw new Error('Semaphore SMS 발송에 실패했습니다.');
    }
  }

  /**
   * Globe Labs SMS 발송
   */
  async sendGlobeSMS(to, message, options = {}) {
    try {
      const { globe } = this.providers;
      
      const smsData = {
        outboundSMSMessageRequest: {
          clientCorrelator: `globe_${Date.now()}`,
          senderAddress: globe.shortCode,
          outboundSMSTextMessage: {
            message: message
          },
          address: to
        }
      };

      if (process.env.NODE_ENV === 'production') {
        const response = await axios.post(
          `${globe.apiUrl}/smsmessaging/v1/outbound/${globe.shortCode}/requests`,
          smsData,
          {
            headers: {
              'Content-Type': 'application/json'
            },
            params: {
              access_token: options.accessToken || process.env.GLOBE_ACCESS_TOKEN
            }
          }
        );

        return {
          success: true,
          messageId: response.data.outboundSMSMessageRequest.clientCorrelator,
          status: 'sent',
          provider: 'globe'
        };
      } else {
        return {
          success: true,
          messageId: `globe_sim_${Date.now()}`,
          status: 'sent',
          provider: 'globe_simulation'
        };
      }
    } catch (error) {
      console.error('Globe SMS 발송 오류:', error);
      throw new Error('Globe SMS 발송에 실패했습니다.');
    }
  }

  /**
   * 통합 SMS 발송 함수
   */
  async sendSMS(to, message, options = {}) {
    const provider = options.provider || this.defaultProvider;
    
    // 전화번호 포맷 검증 및 정리
    const cleanNumber = this.formatPhilippinesNumber(to);
    if (!cleanNumber) {
      throw new Error('올바른 필리핀 전화번호 형식이 아닙니다.');
    }

    try {
      let result;
      
      switch (provider) {
        case 'twilio':
          result = await this.sendTwilioSMS(cleanNumber, message, options);
          break;
        case 'semaphore':
          result = await this.sendSemaphoreSMS(cleanNumber, message, options);
          break;
        case 'globe':
          result = await this.sendGlobeSMS(cleanNumber, message, options);
          break;
        default:
          // 기본값으로 Semaphore 사용
          result = await this.sendSemaphoreSMS(cleanNumber, message, options);
      }

      // SMS 발송 로그 기록
      await this.logSMSActivity(cleanNumber, message, result, provider);
      
      return result;
    } catch (error) {
      console.error('SMS 발송 실패:', error);
      
      // 백업 프로바이더로 재시도
      if (provider !== 'semaphore') {
        console.log('백업 프로바이더(Semaphore)로 재시도...');
        try {
          const backupResult = await this.sendSemaphoreSMS(cleanNumber, message, options);
          await this.logSMSActivity(cleanNumber, message, backupResult, 'semaphore_backup');
          return backupResult;
        } catch (backupError) {
          console.error('백업 SMS 발송도 실패:', backupError);
        }
      }
      
      throw error;
    }
  }

  /**
   * 인증 코드 SMS 발송
   */
  async sendVerificationCode(phoneNumber, code, options = {}) {
    const message = options.customMessage || 
      `[King's Food] 인증번호: ${code}\n유효시간: 5분\n타인에게 절대 알려주지 마세요.`;
    
    return await this.sendSMS(phoneNumber, message, {
      ...options,
      type: 'verification'
    });
  }

  /**
   * 주문 알림 SMS 발송
   */
  async sendOrderNotification(phoneNumber, orderInfo, options = {}) {
    const message = `[King's Food] 주문이 접수되었습니다.\n주문번호: ${orderInfo.orderId}\n금액: ₱${orderInfo.amount.toLocaleString()}\n배송지: ${orderInfo.address}\n문의: 02-1234-5678`;
    
    return await this.sendSMS(phoneNumber, message, {
      ...options,
      type: 'order_notification'
    });
  }

  /**
   * 결제 완료 SMS 발송
   */
  async sendPaymentConfirmation(phoneNumber, paymentInfo, options = {}) {
    const message = `[King's Food] 결제가 완료되었습니다.\n주문번호: ${paymentInfo.orderId}\n결제금액: ₱${paymentInfo.amount.toLocaleString()}\n크레딧 잔액: ₱${paymentInfo.balance.toLocaleString()}`;
    
    return await this.sendSMS(phoneNumber, message, {
      ...options,
      type: 'payment_confirmation'
    });
  }

  /**
   * 배송 알림 SMS 발송
   */
  async sendDeliveryUpdate(phoneNumber, deliveryInfo, options = {}) {
    const message = `[King's Food] 배송 상태가 업데이트되었습니다.\n주문번호: ${deliveryInfo.orderId}\n상태: ${deliveryInfo.status}\n예상도착: ${deliveryInfo.estimatedTime}\n운전기사: ${deliveryInfo.driverPhone}`;
    
    return await this.sendSMS(phoneNumber, message, {
      ...options,
      type: 'delivery_update'
    });
  }

  /**
   * 필리핀 전화번호 포맷팅
   */
  formatPhilippinesNumber(phoneNumber) {
    // 숫자만 추출
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // 필리핀 번호 패턴 확인
    if (cleanNumber.startsWith('63')) {
      // +63으로 시작하는 경우
      return '+' + cleanNumber;
    } else if (cleanNumber.startsWith('09') && cleanNumber.length === 11) {
      // 09으로 시작하는 11자리 (현지 형식)
      return '+63' + cleanNumber.substring(1);
    } else if (cleanNumber.startsWith('9') && cleanNumber.length === 10) {
      // 9로 시작하는 10자리
      return '+63' + cleanNumber;
    } else {
      return null; // 잘못된 형식
    }
  }

  /**
   * SMS 활동 로그 기록
   */
  async logSMSActivity(phoneNumber, message, result, provider) {
    try {
      const logData = {
        phoneNumber,
        messageLength: message.length,
        provider,
        messageId: result.messageId,
        status: result.status,
        success: result.success,
        timestamp: new Date(),
        cost: result.cost || 0
      };

      // 실제 환경에서는 데이터베이스에 저장
      console.log('SMS 로그:', logData);
      
      // 여기에 MongoDB 저장 로직 추가 가능
      // await SMSLog.create(logData);
      
    } catch (error) {
      console.error('SMS 로그 기록 실패:', error);
    }
  }

  /**
   * SMS 발송 상태 확인
   */
  async checkSMSStatus(messageId, provider) {
    try {
      switch (provider) {
        case 'twilio':
          if (process.env.NODE_ENV === 'production') {
            const auth = Buffer.from(`${this.providers.twilio.accountSid}:${this.providers.twilio.authToken}`).toString('base64');
            const response = await axios.get(
              `${this.providers.twilio.apiUrl}/Accounts/${this.providers.twilio.accountSid}/Messages/${messageId}.json`,
              {
                headers: { 'Authorization': `Basic ${auth}` }
              }
            );
            return {
              status: response.data.status,
              dateUpdated: response.data.dateUpdated,
              errorCode: response.data.errorCode,
              errorMessage: response.data.errorMessage
            };
          } else {
            return { status: 'delivered', dateUpdated: new Date().toISOString() };
          }

        case 'semaphore':
          if (process.env.NODE_ENV === 'production') {
            const response = await axios.get(
              `${this.providers.semaphore.apiUrl}/api/v4/messages/${messageId}`,
              {
                params: { apikey: this.providers.semaphore.apiKey }
              }
            );
            return response.data;
          } else {
            return { status: 'Delivered', timestamp: new Date().toISOString() };
          }

        default:
          return { status: 'unknown', message: '지원하지 않는 프로바이더입니다.' };
      }
    } catch (error) {
      console.error('SMS 상태 확인 오류:', error);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * 대량 SMS 발송 (마케팅용)
   */
  async sendBulkSMS(recipients, message, options = {}) {
    const results = [];
    const batchSize = options.batchSize || 100;
    const delay = options.delay || 1000; // 1초 대기

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      const batchResults = [];

      for (const recipient of batch) {
        try {
          const result = await this.sendSMS(recipient.phoneNumber, message, {
            ...options,
            customerName: recipient.name
          });
          batchResults.push({
            phoneNumber: recipient.phoneNumber,
            success: true,
            messageId: result.messageId
          });
        } catch (error) {
          batchResults.push({
            phoneNumber: recipient.phoneNumber,
            success: false,
            error: error.message
          });
        }

        // 배치 간 대기
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      results.push(...batchResults);
      console.log(`대량 SMS 발송 진행률: ${Math.min(i + batchSize, recipients.length)}/${recipients.length}`);
    }

    return {
      totalSent: results.filter(r => r.success).length,
      totalFailed: results.filter(r => !r.success).length,
      details: results
    };
  }
}

module.exports = new SMSService();