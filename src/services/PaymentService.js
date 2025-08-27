/**
 * 실제 결제 시스템 연동 서비스
 * King's Food Philippines 전용
 */

const axios = require('axios');

class PaymentService {
  constructor() {
    this.providers = {
      gcash: {
        apiUrl: process.env.GCASH_API_URL || 'https://api.gcash.com',
        merchantId: process.env.GCASH_MERCHANT_ID,
        secretKey: process.env.GCASH_SECRET_KEY,
        publicKey: process.env.GCASH_PUBLIC_KEY
      },
      maya: {
        apiUrl: process.env.MAYA_API_URL || 'https://pg-sandbox.paymaya.com',
        publicKey: process.env.MAYA_PUBLIC_KEY,
        secretKey: process.env.MAYA_SECRET_KEY
      },
      bdo: {
        apiUrl: process.env.BDO_API_URL || 'https://api.bdo.com.ph',
        merchantId: process.env.BDO_MERCHANT_ID,
        apiKey: process.env.BDO_API_KEY
      },
      bpi: {
        apiUrl: process.env.BPI_API_URL || 'https://api.bpi.com.ph',
        merchantId: process.env.BPI_MERCHANT_ID,
        apiKey: process.env.BPI_API_KEY
      }
    };
  }

  /**
   * GCash 결제 처리
   */
  async processGCashPayment(paymentData) {
    try {
      const { amount, orderId, customerInfo } = paymentData;
      
      // GCash API 호출 준비
      const gcashData = {
        amount: amount * 100, // centavos로 변환
        currency: 'PHP',
        description: `King's Food Credit Charge - Order ${orderId}`,
        redirectUrl: {
          success: `${process.env.BASE_URL}/payment/gcash/success`,
          failure: `${process.env.BASE_URL}/payment/gcash/failure`,
          cancel: `${process.env.BASE_URL}/payment/gcash/cancel`
        },
        requestReferenceNumber: orderId,
        metadata: {
          customerName: customerInfo.name,
          customerPhone: customerInfo.phone,
          customerEmail: customerInfo.email || ''
        }
      };

      // 실제 환경에서는 실제 GCash API 호출
      if (process.env.NODE_ENV === 'production') {
        const response = await axios.post(
          `${this.providers.gcash.apiUrl}/checkout`,
          gcashData,
          {
            headers: {
              'Authorization': `Bearer ${this.providers.gcash.publicKey}`,
              'Content-Type': 'application/json'
            }
          }
        );
        return response.data;
      } else {
        // 개발 환경에서는 시뮬레이션
        return {
          checkoutId: `gcash_${Date.now()}`,
          redirectUrl: `${process.env.BASE_URL}/payment/gcash/simulate?amount=${amount}&orderId=${orderId}`,
          status: 'PENDING_PAYMENT'
        };
      }
    } catch (error) {
      console.error('GCash 결제 처리 오류:', error);
      throw new Error('GCash 결제 처리 중 오류가 발생했습니다.');
    }
  }

  /**
   * Maya (PayMaya) 결제 처리  
   */
  async processMayaPayment(paymentData) {
    try {
      const { amount, orderId, customerInfo } = paymentData;

      const mayaData = {
        totalAmount: {
          value: amount,
          currency: 'PHP'
        },
        buyer: {
          firstName: customerInfo.name.split(' ')[0] || '',
          lastName: customerInfo.name.split(' ').slice(1).join(' ') || '',
          contact: {
            phone: customerInfo.phone,
            email: customerInfo.email || `${customerInfo.phone}@kingsfood.ph`
          }
        },
        items: [{
          name: 'King\'s Food Credit Charge',
          quantity: 1,
          code: 'CREDIT_CHARGE',
          description: `Credit wallet charge for Order ${orderId}`,
          amount: {
            value: amount,
            currency: 'PHP'
          },
          totalAmount: {
            value: amount,
            currency: 'PHP'  
          }
        }],
        redirectUrl: {
          success: `${process.env.BASE_URL}/payment/maya/success`,
          failure: `${process.env.BASE_URL}/payment/maya/failure`,
          cancel: `${process.env.BASE_URL}/payment/maya/cancel`
        },
        requestReferenceNumber: orderId,
        metadata: {
          merchantName: 'King\'s Food Philippines',
          orderType: 'CREDIT_CHARGE'
        }
      };

      if (process.env.NODE_ENV === 'production') {
        const response = await axios.post(
          `${this.providers.maya.apiUrl}/v1/checkouts`,
          mayaData,
          {
            headers: {
              'Authorization': `Basic ${Buffer.from(this.providers.maya.publicKey + ':').toString('base64')}`,
              'Content-Type': 'application/json'
            }
          }
        );
        return response.data;
      } else {
        return {
          checkoutId: `maya_${Date.now()}`,
          redirectUrl: `${process.env.BASE_URL}/payment/maya/simulate?amount=${amount}&orderId=${orderId}`,
          status: 'CREATED'
        };
      }
    } catch (error) {
      console.error('Maya 결제 처리 오류:', error);
      throw new Error('Maya 결제 처리 중 오류가 발생했습니다.');
    }
  }

  /**
   * BDO 온라인 뱅킹 결제 처리
   */
  async processBDOPayment(paymentData) {
    try {
      const { amount, orderId, customerInfo } = paymentData;

      const bdoData = {
        merchantId: this.providers.bdo.merchantId,
        amount: amount,
        currency: 'PHP',
        orderNumber: orderId,
        description: `King's Food Credit Charge - ${orderId}`,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email || `${customerInfo.phone}@kingsfood.ph`,
        customerPhone: customerInfo.phone,
        returnUrl: `${process.env.BASE_URL}/payment/bdo/return`,
        cancelUrl: `${process.env.BASE_URL}/payment/bdo/cancel`,
        callbackUrl: `${process.env.BASE_URL}/api/payment/bdo/callback`
      };

      if (process.env.NODE_ENV === 'production') {
        const response = await axios.post(
          `${this.providers.bdo.apiUrl}/payment/create`,
          bdoData,
          {
            headers: {
              'X-API-Key': this.providers.bdo.apiKey,
              'Content-Type': 'application/json'
            }
          }
        );
        return response.data;
      } else {
        return {
          transactionId: `bdo_${Date.now()}`,
          paymentUrl: `${process.env.BASE_URL}/payment/bdo/simulate?amount=${amount}&orderId=${orderId}`,
          status: 'PENDING'
        };
      }
    } catch (error) {
      console.error('BDO 결제 처리 오류:', error);
      throw new Error('BDO 결제 처리 중 오류가 발생했습니다.');
    }
  }

  /**
   * BPI 온라인 뱅킹 결제 처리
   */
  async processBPIPayment(paymentData) {
    try {
      const { amount, orderId, customerInfo } = paymentData;

      const bpiData = {
        merchantId: this.providers.bpi.merchantId,
        transactionAmount: amount,
        currency: 'PHP',
        merchantReferenceNumber: orderId,
        description: `King's Food - Credit Wallet Charge`,
        payerName: customerInfo.name,
        payerEmail: customerInfo.email || `${customerInfo.phone}@kingsfood.ph`,
        payerMobile: customerInfo.phone,
        successUrl: `${process.env.BASE_URL}/payment/bpi/success`,
        failUrl: `${process.env.BASE_URL}/payment/bpi/failure`,
        cancelUrl: `${process.env.BASE_URL}/payment/bpi/cancel`,
        notificationUrl: `${process.env.BASE_URL}/api/payment/bpi/notify`
      };

      if (process.env.NODE_ENV === 'production') {
        const response = await axios.post(
          `${this.providers.bpi.apiUrl}/payments`,
          bpiData,
          {
            headers: {
              'Authorization': `Bearer ${this.providers.bpi.apiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );
        return response.data;
      } else {
        return {
          paymentId: `bpi_${Date.now()}`,
          checkoutUrl: `${process.env.BASE_URL}/payment/bpi/simulate?amount=${amount}&orderId=${orderId}`,
          status: 'CREATED'
        };
      }
    } catch (error) {
      console.error('BPI 결제 처리 오류:', error);
      throw new Error('BPI 결제 처리 중 오류가 발생했습니다.');
    }
  }

  /**
   * 통합 결제 처리 함수
   */
  async processPayment(provider, paymentData) {
    switch (provider.toLowerCase()) {
      case 'gcash':
        return await this.processGCashPayment(paymentData);
      case 'maya':
      case 'paymaya':
        return await this.processMayaPayment(paymentData);
      case 'bdo':
        return await this.processBDOPayment(paymentData);
      case 'bpi':
        return await this.processBPIPayment(paymentData);
      default:
        throw new Error('지원하지 않는 결제 방식입니다.');
    }
  }

  /**
   * 결제 상태 확인
   */
  async checkPaymentStatus(provider, transactionId) {
    try {
      switch (provider.toLowerCase()) {
        case 'gcash':
          if (process.env.NODE_ENV === 'production') {
            const response = await axios.get(
              `${this.providers.gcash.apiUrl}/checkout/${transactionId}`,
              {
                headers: {
                  'Authorization': `Bearer ${this.providers.gcash.secretKey}`
                }
              }
            );
            return response.data;
          } else {
            return { status: 'PAYMENT_SUCCESS', transactionId };
          }

        case 'maya':
          if (process.env.NODE_ENV === 'production') {
            const response = await axios.get(
              `${this.providers.maya.apiUrl}/v1/checkouts/${transactionId}`,
              {
                headers: {
                  'Authorization': `Basic ${Buffer.from(this.providers.maya.secretKey + ':').toString('base64')}`
                }
              }
            );
            return response.data;
          } else {
            return { status: 'DONE', transactionId };
          }

        case 'bdo':
          if (process.env.NODE_ENV === 'production') {
            const response = await axios.get(
              `${this.providers.bdo.apiUrl}/payment/status/${transactionId}`,
              {
                headers: {
                  'X-API-Key': this.providers.bdo.apiKey
                }
              }
            );
            return response.data;
          } else {
            return { status: 'SUCCESS', transactionId };
          }

        case 'bpi':
          if (process.env.NODE_ENV === 'production') {
            const response = await axios.get(
              `${this.providers.bpi.apiUrl}/payments/${transactionId}`,
              {
                headers: {
                  'Authorization': `Bearer ${this.providers.bpi.apiKey}`
                }
              }
            );
            return response.data;
          } else {
            return { status: 'COMPLETED', transactionId };
          }

        default:
          throw new Error('지원하지 않는 결제 방식입니다.');
      }
    } catch (error) {
      console.error('결제 상태 확인 오류:', error);
      throw new Error('결제 상태 확인 중 오류가 발생했습니다.');
    }
  }

  /**
   * 결제 환불 처리
   */
  async processRefund(provider, transactionId, amount, reason) {
    try {
      const refundData = {
        transactionId,
        amount,
        reason,
        requestDate: new Date().toISOString()
      };

      switch (provider.toLowerCase()) {
        case 'gcash':
          if (process.env.NODE_ENV === 'production') {
            const response = await axios.post(
              `${this.providers.gcash.apiUrl}/refunds`,
              refundData,
              {
                headers: {
                  'Authorization': `Bearer ${this.providers.gcash.secretKey}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            return response.data;
          } else {
            return { refundId: `gcash_refund_${Date.now()}`, status: 'REFUND_SUCCESS' };
          }

        case 'maya':
          if (process.env.NODE_ENV === 'production') {
            const response = await axios.post(
              `${this.providers.maya.apiUrl}/v1/refunds`,
              refundData,
              {
                headers: {
                  'Authorization': `Basic ${Buffer.from(this.providers.maya.secretKey + ':').toString('base64')}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            return response.data;
          } else {
            return { id: `maya_refund_${Date.now()}`, status: 'SUCCESS' };
          }

        default:
          return { refundId: `${provider}_refund_${Date.now()}`, status: 'PENDING_MANUAL_PROCESS' };
      }
    } catch (error) {
      console.error('환불 처리 오류:', error);
      throw new Error('환불 처리 중 오류가 발생했습니다.');
    }
  }
}

module.exports = new PaymentService();