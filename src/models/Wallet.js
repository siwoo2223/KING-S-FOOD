/**
 * 사용자 지갑 모델
 * 크레딧 충전/사용 관리
 */

const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    default: 'PHP',
    enum: ['PHP']
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'locked'],
    default: 'active'
  },
  totalCharged: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 지갑 거래 내역 스키마
const walletTransactionSchema = new mongoose.Schema({
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['charge', 'purchase', 'refund', 'bonus', 'adjustment'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  balanceBefore: {
    type: Number,
    required: true
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  referenceId: {
    type: String, // 주문 ID, 충전 ID 등
    default: null
  },
  paymentMethod: {
    type: String,
    enum: ['gcash', 'maya', 'bank_transfer', 'bdo', 'bpi', 'metrobank', 'system'],
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'completed'
  },
  metadata: {
    type: Object,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 충전 요청 스키마
const chargeRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 500, // 최소 충전 금액 ₱500
    max: 50000 // 최대 충전 금액 ₱50,000
  },
  bonusAmount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['gcash', 'maya', 'bank_transfer', 'bdo', 'bpi', 'metrobank'],
    required: true
  },
  paymentDetails: {
    type: Object,
    default: {}
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'expired'],
    default: 'pending'
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24시간 후 만료
  },
  processedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 충전 보너스 계산 메소드
walletSchema.statics.calculateBonus = function(amount) {
  const bonusRates = {
    5000: 0.05,   // ₱5,000+ : 5% 보너스
    10000: 0.08,  // ₱10,000+ : 8% 보너스
    20000: 0.10   // ₱20,000+ : 10% 보너스
  };
  
  let bonusRate = 0;
  
  if (amount >= 20000) bonusRate = bonusRates[20000];
  else if (amount >= 10000) bonusRate = bonusRates[10000];
  else if (amount >= 5000) bonusRate = bonusRates[5000];
  
  return Math.floor(amount * bonusRate);
};

// 잔액 업데이트 메소드
walletSchema.methods.updateBalance = function(amount, type, description, referenceId = null) {
  const balanceBefore = this.balance;
  
  if (type === 'charge' || type === 'refund' || type === 'bonus') {
    this.balance += amount;
    if (type === 'charge') this.totalCharged += amount;
  } else if (type === 'purchase') {
    if (this.balance < amount) {
      throw new Error('잔액이 부족합니다');
    }
    this.balance -= amount;
    this.totalSpent += amount;
  }
  
  this.updatedAt = new Date();
  
  return {
    balanceBefore,
    balanceAfter: this.balance,
    transaction: {
      walletId: this._id,
      userId: this.userId,
      type,
      amount,
      balanceBefore,
      balanceAfter: this.balance,
      description,
      referenceId
    }
  };
};

// 인덱스 설정
walletSchema.index({ userId: 1 });
walletTransactionSchema.index({ walletId: 1, createdAt: -1 });
walletTransactionSchema.index({ userId: 1, createdAt: -1 });
chargeRequestSchema.index({ userId: 1, createdAt: -1 });
chargeRequestSchema.index({ status: 1, expiresAt: 1 });

const Wallet = mongoose.model('Wallet', walletSchema);
const WalletTransaction = mongoose.model('WalletTransaction', walletTransactionSchema);
const ChargeRequest = mongoose.model('ChargeRequest', chargeRequestSchema);

module.exports = {
  Wallet,
  WalletTransaction,
  ChargeRequest
};