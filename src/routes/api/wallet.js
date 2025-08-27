/**
 * 지갑 시스템 API 라우트
 * 크레딧 충전, 사용, 거래내역 관리
 */

const express = require('express');
const { Wallet, WalletTransaction, ChargeRequest } = require('../../models/Wallet');
const logger = require('../../utils/logger');

const router = express.Router();

/**
 * GET /api/wallet/balance/:userId
 * 사용자 지갑 잔액 조회
 */
router.get('/balance/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    let wallet = await findOrCreateWallet(userId);
    
    res.json({
      success: true,
      data: {
        userId,
        balance: wallet.balance,
        currency: wallet.currency,
        status: wallet.status,
        totalCharged: wallet.totalCharged,
        totalSpent: wallet.totalSpent,
        formattedBalance: `₱${wallet.balance.toLocaleString()}`,
        lastUpdated: wallet.updatedAt
      }
    });
    
  } catch (error) {
    logger.error('Wallet balance query error:', error);
    res.status(500).json({
      success: false,
      message: '지갑 정보 조회 중 오류가 발생했습니다',
      error: error.message
    });
  }
});

/**
 * POST /api/wallet/charge/request
 * 크레딧 충전 요청
 */
router.post('/charge/request', async (req, res) => {
  try {
    const { userId, amount, paymentMethod } = req.body;
    
    // 입력 검증
    if (!userId || !amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: '필수 정보가 누락되었습니다'
      });
    }
    
    // 충전 금액 검증
    if (amount < 500 || amount > 50000) {
      return res.status(400).json({
        success: false,
        message: '충전 금액은 ₱500 ~ ₱50,000 범위여야 합니다'
      });
    }
    
    // 지급 방법 검증
    const validPaymentMethods = ['gcash', 'maya', 'bank_transfer', 'bdo', 'bpi', 'metrobank'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: '지원하지 않는 결제 방법입니다'
      });
    }
    
    // 보너스 계산
    const bonusAmount = Wallet.calculateBonus(amount);
    const totalAmount = amount + bonusAmount;
    
    // 충전 요청 생성
    const chargeRequest = new ChargeRequest({
      userId,
      amount,
      bonusAmount,
      totalAmount,
      paymentMethod,
      paymentDetails: generatePaymentDetails(paymentMethod, amount)
    });
    
    await chargeRequest.save();
    
    res.json({
      success: true,
      message: '충전 요청이 생성되었습니다',
      data: {
        requestId: chargeRequest._id,
        amount,
        bonusAmount,
        totalAmount,
        paymentMethod,
        paymentDetails: chargeRequest.paymentDetails,
        expiresAt: chargeRequest.expiresAt,
        status: chargeRequest.status
      }
    });
    
  } catch (error) {
    logger.error('Charge request error:', error);
    res.status(500).json({
      success: false,
      message: '충전 요청 중 오류가 발생했습니다',
      error: error.message
    });
  }
});

/**
 * POST /api/wallet/charge/complete
 * 충전 완료 처리 (관리자/시스템용)
 */
router.post('/charge/complete', async (req, res) => {
  try {
    const { requestId, transactionId } = req.body;
    
    const chargeRequest = await ChargeRequest.findById(requestId);
    if (!chargeRequest) {
      return res.status(404).json({
        success: false,
        message: '충전 요청을 찾을 수 없습니다'
      });
    }
    
    if (chargeRequest.status !== 'pending' && chargeRequest.status !== 'processing') {
      return res.status(400).json({
        success: false,
        message: '이미 처리된 충전 요청입니다'
      });
    }
    
    // 지갑 찾기 또는 생성
    let wallet = await findOrCreateWallet(chargeRequest.userId);
    
    // 충전 금액 추가
    const chargeResult = wallet.updateBalance(
      chargeRequest.amount, 
      'charge', 
      `${chargeRequest.paymentMethod} 충전`, 
      chargeRequest._id
    );
    
    await wallet.save();
    
    // 거래 내역 기록
    const transaction = new WalletTransaction(chargeResult.transaction);
    await transaction.save();
    
    // 보너스가 있으면 보너스도 추가
    if (chargeRequest.bonusAmount > 0) {
      const bonusResult = wallet.updateBalance(
        chargeRequest.bonusAmount,
        'bonus',
        `충전 보너스 (${Math.round((chargeRequest.bonusAmount / chargeRequest.amount) * 100)}%)`,
        chargeRequest._id
      );
      
      await wallet.save();
      
      const bonusTransaction = new WalletTransaction(bonusResult.transaction);
      await bonusTransaction.save();
    }
    
    // 충전 요청 상태 업데이트
    chargeRequest.status = 'completed';
    chargeRequest.processedAt = new Date();
    chargeRequest.paymentDetails.transactionId = transactionId;
    await chargeRequest.save();
    
    res.json({
      success: true,
      message: '충전이 완료되었습니다',
      data: {
        walletBalance: wallet.balance,
        chargedAmount: chargeRequest.amount,
        bonusAmount: chargeRequest.bonusAmount,
        totalReceived: chargeRequest.totalAmount,
        formattedBalance: `₱${wallet.balance.toLocaleString()}`
      }
    });
    
  } catch (error) {
    logger.error('Charge completion error:', error);
    res.status(500).json({
      success: false,
      message: '충전 처리 중 오류가 발생했습니다',
      error: error.message
    });
  }
});

/**
 * POST /api/wallet/spend
 * 크레딧 사용 (주문 결제용)
 */
router.post('/spend', async (req, res) => {
  try {
    const { userId, amount, description, orderId } = req.body;
    
    if (!userId || !amount || !description) {
      return res.status(400).json({
        success: false,
        message: '필수 정보가 누락되었습니다'
      });
    }
    
    let wallet = await findOrCreateWallet(userId);
    
    if (wallet.balance < amount) {
      return res.status(400).json({
        success: false,
        message: '잔액이 부족합니다',
        data: {
          currentBalance: wallet.balance,
          requiredAmount: amount,
          shortage: amount - wallet.balance,
          formattedShortage: `₱${(amount - wallet.balance).toLocaleString()}`
        }
      });
    }
    
    // 크레딧 차감
    const spendResult = wallet.updateBalance(amount, 'purchase', description, orderId);
    await wallet.save();
    
    // 거래 내역 기록
    const transaction = new WalletTransaction(spendResult.transaction);
    await transaction.save();
    
    res.json({
      success: true,
      message: '결제가 완료되었습니다',
      data: {
        paidAmount: amount,
        remainingBalance: wallet.balance,
        formattedBalance: `₱${wallet.balance.toLocaleString()}`,
        transactionId: transaction._id
      }
    });
    
  } catch (error) {
    logger.error('Wallet spend error:', error);
    res.status(500).json({
      success: false,
      message: '결제 처리 중 오류가 발생했습니다',
      error: error.message
    });
  }
});

/**
 * GET /api/wallet/transactions/:userId
 * 거래 내역 조회
 */
router.get('/transactions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, type } = req.query;
    
    const skip = (page - 1) * limit;
    const query = { userId };
    
    if (type) {
      query.type = type;
    }
    
    const transactions = await WalletTransaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const total = await WalletTransaction.countDocuments(query);
    
    const formattedTransactions = transactions.map(tx => ({
      ...tx,
      formattedAmount: `₱${tx.amount.toLocaleString()}`,
      formattedBalanceBefore: `₱${tx.balanceBefore.toLocaleString()}`,
      formattedBalanceAfter: `₱${tx.balanceAfter.toLocaleString()}`,
      typeLabel: getTransactionTypeLabel(tx.type),
      icon: getTransactionIcon(tx.type),
      color: getTransactionColor(tx.type)
    }));
    
    res.json({
      success: true,
      data: {
        transactions: formattedTransactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: skip + transactions.length < total,
          hasPrev: page > 1
        }
      }
    });
    
  } catch (error) {
    logger.error('Transactions query error:', error);
    res.status(500).json({
      success: false,
      message: '거래 내역 조회 중 오류가 발생했습니다',
      error: error.message
    });
  }
});

/**
 * GET /api/wallet/charge-methods
 * 충전 방법 및 수수료 정보
 */
router.get('/charge-methods', (req, res) => {
  try {
    const chargeMethods = [
      {
        id: 'gcash',
        name: 'GCash',
        icon: '/images/payment/gcash.png',
        fee: 0,
        minAmount: 500,
        maxAmount: 10000,
        processingTime: '즉시',
        description: 'GCash 앱을 통한 즉시 충전'
      },
      {
        id: 'maya',
        name: 'Maya (PayMaya)', 
        icon: '/images/payment/maya.png',
        fee: 0,
        minAmount: 500,
        maxAmount: 15000,
        processingTime: '즉시',
        description: 'Maya 앱을 통한 즉시 충전'
      },
      {
        id: 'bdo',
        name: 'BDO Online Banking',
        icon: '/images/payment/bdo.png', 
        fee: 10,
        minAmount: 1000,
        maxAmount: 50000,
        processingTime: '1-2시간',
        description: 'BDO 인터넷뱅킹 계좌이체'
      },
      {
        id: 'bpi',
        name: 'BPI Online Banking',
        icon: '/images/payment/bpi.png',
        fee: 10,
        minAmount: 1000, 
        maxAmount: 50000,
        processingTime: '1-2시간',
        description: 'BPI 인터넷뱅킹 계좌이체'
      }
    ];
    
    const bonusRates = [
      { minAmount: 5000, bonus: 5, description: '₱5,000 이상 충전 시 5% 보너스' },
      { minAmount: 10000, bonus: 8, description: '₱10,000 이상 충전 시 8% 보너스' },
      { minAmount: 20000, bonus: 10, description: '₱20,000 이상 충전 시 10% 보너스' }
    ];
    
    res.json({
      success: true,
      data: {
        methods: chargeMethods,
        bonusRates,
        currency: 'PHP',
        globalLimits: {
          minAmount: 500,
          maxAmount: 50000,
          dailyLimit: 100000
        }
      }
    });
    
  } catch (error) {
    logger.error('Charge methods error:', error);
    res.status(500).json({
      success: false,
      message: '충전 방법 조회 중 오류가 발생했습니다'
    });
  }
});

// 헬퍼 함수들
async function findOrCreateWallet(userId) {
  let wallet = await Wallet.findOne({ userId });
  
  if (!wallet) {
    wallet = new Wallet({ userId });
    await wallet.save();
  }
  
  return wallet;
}

function generatePaymentDetails(paymentMethod, amount) {
  const baseDetails = {
    amount,
    currency: 'PHP',
    createdAt: new Date()
  };
  
  switch (paymentMethod) {
    case 'gcash':
      return {
        ...baseDetails,
        merchantName: "King's Food PH",
        referenceNumber: `GCASH${Date.now()}`,
        instructions: 'GCash 앱에서 "Send Money" → "Via Mobile Number" → 09178887777'
      };
      
    case 'maya':
      return {
        ...baseDetails,
        merchantName: "King's Food PH", 
        referenceNumber: `MAYA${Date.now()}`,
        instructions: 'Maya 앱에서 "Send" → "To Mobile Number" → 09178887777'
      };
      
    case 'bdo':
      return {
        ...baseDetails,
        bankName: 'Banco de Oro',
        accountName: "King's Food Philippines Inc.",
        accountNumber: '1234567890123',
        referenceNumber: `BDO${Date.now()}`,
        instructions: 'BDO Online에서 "Fund Transfer" → "To Another BDO Account"'
      };
      
    case 'bpi':
      return {
        ...baseDetails,
        bankName: 'Bank of the Philippine Islands',
        accountName: "King's Food Philippines Inc.",
        accountNumber: '9876543210987', 
        referenceNumber: `BPI${Date.now()}`,
        instructions: 'BPI Online에서 "Transfer Funds" → "To Other BPI Account"'
      };
      
    default:
      return baseDetails;
  }
}

function getTransactionTypeLabel(type) {
  const labels = {
    'charge': '충전',
    'purchase': '구매', 
    'refund': '환불',
    'bonus': '보너스',
    'adjustment': '조정'
  };
  return labels[type] || type;
}

function getTransactionIcon(type) {
  const icons = {
    'charge': 'fas fa-plus-circle',
    'purchase': 'fas fa-minus-circle',
    'refund': 'fas fa-undo',
    'bonus': 'fas fa-gift',
    'adjustment': 'fas fa-cog'
  };
  return icons[type] || 'fas fa-circle';
}

function getTransactionColor(type) {
  const colors = {
    'charge': 'text-green-600',
    'purchase': 'text-red-600', 
    'refund': 'text-blue-600',
    'bonus': 'text-purple-600',
    'adjustment': 'text-gray-600'
  };
  return colors[type] || 'text-gray-600';
}

module.exports = router;