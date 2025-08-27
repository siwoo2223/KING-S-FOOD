/**
 * 간소화된 사용자 모델
 * 최소한의 정보만 수집 (KYC 없음)
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  // 기본 정보 (필수)
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  
  // 연락처 정보
  phone: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(phone) {
        // 필리핀 휴대폰 번호 형식 검증
        return /^(\+63|0)[0-9]{10}$/.test(phone);
      },
      message: '올바른 필리핀 휴대폰 번호를 입력해주세요 (+63 또는 0으로 시작)'
    }
  },
  
  email: {
    type: String,
    sparse: true, // 선택사항이므로 sparse 인덱스
    lowercase: true,
    validate: {
      validator: function(email) {
        if (!email) return true; // 선택사항이므로 빈 값 허용
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: '올바른 이메일 주소를 입력해주세요'
    }
  },
  
  // 주소 정보 (간소화)
  address: {
    // 상세 주소
    street: {
      type: String,
      required: true,
      maxLength: 200
    },
    
    // 바랑가이
    barangay: {
      type: String,
      required: true,
      maxLength: 100
    },
    
    // 시/도시
    city: {
      type: String,
      required: true,
      maxLength: 100
    },
    
    // 주/지역
    province: {
      type: String,
      required: true,
      maxLength: 100
    },
    
    // 우편번호
    postalCode: {
      type: String,
      required: true,
      validate: {
        validator: function(code) {
          return /^[0-9]{4}$/.test(code); // 필리핀 우편번호는 4자리
        },
        message: '올바른 우편번호를 입력해주세요 (4자리 숫자)'
      }
    },
    
    // 배송 참고사항
    deliveryNotes: {
      type: String,
      maxLength: 500,
      default: ''
    }
  },
  
  // 비즈니스 정보 (선택사항)
  businessInfo: {
    type: {
      type: String,
      enum: ['personal', 'restaurant', 'retail', 'wholesale', 'others'],
      default: 'personal'
    },
    
    businessName: {
      type: String,
      maxLength: 200,
      default: ''
    },
    
    // 간단한 사업자 분류 (세무목적 아님)
    category: {
      type: String,
      enum: ['korean_restaurant', 'general_restaurant', 'grocery_store', 'convenience_store', 'market_vendor', 'online_seller', 'others'],
      default: 'others'
    }
  },
  
  // 인증 정보
  auth: {
    password: {
      type: String,
      required: true,
      minLength: 6
    },
    
    // SMS 인증
    phoneVerified: {
      type: Boolean,
      default: false
    },
    
    phoneVerificationCode: {
      type: String,
      default: null
    },
    
    phoneVerificationExpires: {
      type: Date,
      default: null
    },
    
    // 이메일 인증 (선택사항)
    emailVerified: {
      type: Boolean,
      default: false
    },
    
    // 마지막 로그인
    lastLoginAt: {
      type: Date,
      default: null
    },
    
    // 로그인 실패 카운트
    loginAttempts: {
      type: Number,
      default: 0,
      max: 10
    },
    
    // 계정 잠김 시간
    lockedUntil: {
      type: Date,
      default: null
    }
  },
  
  // 고객 레벨 (도매 할인용)
  customerLevel: {
    type: String,
    enum: ['retail', 'bronze', 'silver', 'gold', 'platinum'],
    default: 'retail'
  },
  
  // 구매 통계 (자동 계산)
  purchaseStats: {
    totalOrders: {
      type: Number,
      default: 0
    },
    
    totalSpent: {
      type: Number,
      default: 0
    },
    
    averageOrderValue: {
      type: Number,
      default: 0
    },
    
    lastOrderDate: {
      type: Date,
      default: null
    },
    
    // 고객 레벨 자동 업그레이드용
    monthlySpending: {
      type: Number,
      default: 0
    },
    
    lastLevelUpdate: {
      type: Date,
      default: Date.now
    }
  },
  
  // 선호 설정
  preferences: {
    // 언어 설정
    language: {
      type: String,
      enum: ['ko', 'en', 'fil'], // Korean, English, Filipino
      default: 'ko'
    },
    
    // 알림 설정
    notifications: {
      sms: {
        type: Boolean,
        default: true
      },
      email: {
        type: Boolean,
        default: true
      },
      promotions: {
        type: Boolean,
        default: true
      },
      lowStock: {
        type: Boolean,
        default: false
      }
    },
    
    // 배송 선호사항
    delivery: {
      preferredTimeSlot: {
        type: String,
        enum: ['morning', 'afternoon', 'evening', 'anytime'],
        default: 'anytime'
      },
      
      specialInstructions: {
        type: String,
        maxLength: 500,
        default: ''
      }
    }
  },
  
  // 계정 상태
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending_verification'],
    default: 'pending_verification'
  },
  
  // 생성/수정 시간
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

// 비밀번호 해싱 (저장 전)
userSchema.pre('save', async function(next) {
  if (!this.isModified('auth.password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.auth.password = await bcrypt.hash(this.auth.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 비밀번호 검증 메소드
userSchema.methods.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.auth.password);
};

// 계정 잠김 확인
userSchema.virtual('isLocked').get(function() {
  return !!(this.auth.lockedUntil && this.auth.lockedUntil > Date.now());
});

// SMS 인증코드 생성
userSchema.methods.generatePhoneVerificationCode = function() {
  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6자리 숫자
  
  this.auth.phoneVerificationCode = code;
  this.auth.phoneVerificationExpires = new Date(Date.now() + 5 * 60 * 1000); // 5분 후 만료
  
  return code;
};

// SMS 인증코드 검증
userSchema.methods.verifyPhoneCode = function(code) {
  if (!this.auth.phoneVerificationCode) return false;
  if (Date.now() > this.auth.phoneVerificationExpires) return false;
  if (this.auth.phoneVerificationCode !== code) return false;
  
  // 인증 성공
  this.auth.phoneVerified = true;
  this.auth.phoneVerificationCode = null;
  this.auth.phoneVerificationExpires = null;
  this.status = 'active';
  
  return true;
};

// 로그인 시도 관리
userSchema.methods.handleLoginAttempt = function(isSuccess) {
  if (isSuccess) {
    // 성공 시 리셋
    this.auth.loginAttempts = 0;
    this.auth.lockedUntil = null;
    this.auth.lastLoginAt = new Date();
  } else {
    // 실패 시 카운트 증가
    this.auth.loginAttempts += 1;
    
    // 5회 이상 실패 시 30분 잠금
    if (this.auth.loginAttempts >= 5) {
      this.auth.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
    }
  }
};

// 고객 레벨 업데이트 (월 구매액 기준)
userSchema.methods.updateCustomerLevel = function() {
  const monthlySpending = this.purchaseStats.monthlySpending;
  let newLevel = 'retail';
  
  if (monthlySpending >= 500000) newLevel = 'platinum';      // ₱500,000+
  else if (monthlySpending >= 200000) newLevel = 'gold';     // ₱200,000+
  else if (monthlySpending >= 100000) newLevel = 'silver';   // ₱100,000+
  else if (monthlySpending >= 50000) newLevel = 'bronze';    // ₱50,000+
  
  const oldLevel = this.customerLevel;
  this.customerLevel = newLevel;
  this.purchaseStats.lastLevelUpdate = new Date();
  
  return {
    oldLevel,
    newLevel,
    upgraded: getLevelRank(newLevel) > getLevelRank(oldLevel)
  };
};

// 구매 통계 업데이트
userSchema.methods.updatePurchaseStats = function(orderAmount) {
  this.purchaseStats.totalOrders += 1;
  this.purchaseStats.totalSpent += orderAmount;
  this.purchaseStats.averageOrderValue = this.purchaseStats.totalSpent / this.purchaseStats.totalOrders;
  this.purchaseStats.lastOrderDate = new Date();
  
  // 월간 구매액 업데이트 (같은 달인 경우)
  const now = new Date();
  const lastUpdate = this.purchaseStats.lastLevelUpdate;
  
  if (now.getMonth() === lastUpdate.getMonth() && now.getFullYear() === lastUpdate.getFullYear()) {
    this.purchaseStats.monthlySpending += orderAmount;
  } else {
    // 새로운 달이면 리셋
    this.purchaseStats.monthlySpending = orderAmount;
  }
  
  // 레벨 업데이트 확인
  return this.updateCustomerLevel();
};

// 주소 포맷 (표시용)
userSchema.methods.getFormattedAddress = function(includeNotes = false) {
  const addr = this.address;
  let formatted = `${addr.street}, ${addr.barangay}, ${addr.city}, ${addr.province} ${addr.postalCode}`;
  
  if (includeNotes && addr.deliveryNotes) {
    formatted += ` (${addr.deliveryNotes})`;
  }
  
  return formatted;
};

// 할인률 계산 (고객 레벨별)
userSchema.methods.getDiscountRate = function() {
  const discountRates = {
    retail: 0,
    bronze: 5,    // 5%
    silver: 10,   // 10%
    gold: 15,     // 15%
    platinum: 20  // 20%
  };
  
  return discountRates[this.customerLevel] || 0;
};

// 헬퍼 함수
function getLevelRank(level) {
  const ranks = {
    retail: 0,
    bronze: 1,
    silver: 2,
    gold: 3,
    platinum: 4
  };
  return ranks[level] || 0;
}

// 인덱스 설정
userSchema.index({ phone: 1 }, { unique: true });
userSchema.index({ email: 1 }, { sparse: true });
userSchema.index({ status: 1 });
userSchema.index({ customerLevel: 1 });
userSchema.index({ 'address.city': 1, 'address.province': 1 });
userSchema.index({ createdAt: 1 });

// 가상 필드
userSchema.virtual('fullName').get(function() {
  return this.name;
});

userSchema.virtual('isVerified').get(function() {
  return this.auth.phoneVerified;
});

userSchema.virtual('canOrder').get(function() {
  return this.status === 'active' && this.auth.phoneVerified && !this.isLocked;
});

const User = mongoose.model('User', userSchema);

module.exports = User;