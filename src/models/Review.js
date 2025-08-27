/**
 * 고객 리뷰 및 평점 모델
 * King's Food Philippines 전용
 */

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // 기본 정보
  reviewId: {
    type: String,
    unique: true,
    required: true,
    default: () => `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },

  // 사용자 및 상품 정보
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BoxProduct',
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },

  // 평점 및 리뷰 내용
  rating: {
    overall: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    taste: {
      type: Number,
      min: 1,
      max: 5
    },
    quality: {
      type: Number,
      min: 1,
      max: 5
    },
    packaging: {
      type: Number,
      min: 1,
      max: 5
    },
    delivery: {
      type: Number,
      min: 1,
      max: 5
    }
  },

  // 리뷰 텍스트
  review: {
    title: {
      type: String,
      maxlength: 100
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000
    },
    language: {
      type: String,
      enum: ['ko', 'en', 'tl'],
      default: 'en'
    }
  },

  // 사진 및 미디어
  media: {
    photos: [{
      url: String,
      caption: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    videos: [{
      url: String,
      caption: String,
      duration: Number,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },

  // 리뷰 상태 및 관리
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'hidden'],
    default: 'pending'
  },
  moderationNote: String,

  // 유용성 평가
  helpfulness: {
    helpfulCount: {
      type: Number,
      default: 0
    },
    notHelpfulCount: {
      type: Number,
      default: 0
    },
    helpfulUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    notHelpfulUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },

  // 검증된 구매 여부
  verifiedPurchase: {
    type: Boolean,
    default: false
  },

  // 리뷰 태그
  tags: [{
    type: String,
    enum: [
      'fresh', 'authentic', 'delicious', 'good_packaging',
      'fast_delivery', 'good_value', 'recommended',
      'too_salty', 'too_spicy', 'expired_soon', 'damaged_package',
      'late_delivery', 'expensive', 'not_recommended'
    ]
  }],

  // 업체 응답
  merchantReply: {
    content: String,
    repliedAt: Date,
    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },

  // 리워드 지급 여부
  rewardGiven: {
    type: Boolean,
    default: false
  },
  rewardAmount: {
    type: Number,
    default: 0
  },

  // 고객 정보 (검토용)
  customerInfo: {
    customerLevel: String,
    totalOrders: Number,
    reviewCount: Number
  },

  // 메타데이터
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceType: String,
    reviewSource: {
      type: String,
      enum: ['web', 'mobile', 'app', 'email_invitation'],
      default: 'web'
    }
  },

  // 날짜 정보
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: Date,
  rejectedAt: Date
});

// 인덱스 설정
reviewSchema.index({ userId: 1, productId: 1 });
reviewSchema.index({ productId: 1, status: 1, 'rating.overall': -1 });
reviewSchema.index({ orderId: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ verifiedPurchase: 1 });

// 가상 필드 - 평균 평점 계산
reviewSchema.virtual('averageDetailRating').get(function() {
  const ratings = this.rating;
  const detailRatings = [ratings.taste, ratings.quality, ratings.packaging, ratings.delivery].filter(r => r);
  if (detailRatings.length === 0) return null;
  return detailRatings.reduce((sum, rating) => sum + rating, 0) / detailRatings.length;
});

// 유용성 점수 계산
reviewSchema.virtual('helpfulnessScore').get(function() {
  const total = this.helpfulness.helpfulCount + this.helpfulness.notHelpfulCount;
  if (total === 0) return 0;
  return (this.helpfulness.helpfulCount / total) * 100;
});

// 미들웨어 - 업데이트 시 updatedAt 갱신
reviewSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// 미들웨어 - 승인 시 승인 날짜 설정
reviewSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'approved') {
      this.approvedAt = new Date();
    } else if (this.status === 'rejected') {
      this.rejectedAt = new Date();
    }
  }
  next();
});

// 인스턴스 메소드 - 리뷰 승인
reviewSchema.methods.approve = function(moderatorNote = null) {
  this.status = 'approved';
  this.approvedAt = new Date();
  if (moderatorNote) {
    this.moderationNote = moderatorNote;
  }
  return this.save();
};

// 인스턴스 메소드 - 리뷰 거절
reviewSchema.methods.reject = function(reason) {
  this.status = 'rejected';
  this.rejectedAt = new Date();
  this.moderationNote = reason;
  return this.save();
};

// 인스턴스 메소드 - 유용함 표시
reviewSchema.methods.markHelpful = function(userId) {
  if (!this.helpfulness.helpfulUsers.includes(userId)) {
    // 이미 도움되지 않음으로 표시한 경우 제거
    this.helpfulness.notHelpfulUsers.pull(userId);
    this.helpfulness.notHelpfulCount = Math.max(0, this.helpfulness.notHelpfulCount - 1);
    
    // 도움됨 추가
    this.helpfulness.helpfulUsers.push(userId);
    this.helpfulness.helpfulCount += 1;
  }
  return this.save();
};

// 인스턴스 메소드 - 도움되지 않음 표시
reviewSchema.methods.markNotHelpful = function(userId) {
  if (!this.helpfulness.notHelpfulUsers.includes(userId)) {
    // 이미 도움됨으로 표시한 경우 제거
    this.helpfulness.helpfulUsers.pull(userId);
    this.helpfulness.helpfulCount = Math.max(0, this.helpfulness.helpfulCount - 1);
    
    // 도움되지 않음 추가
    this.helpfulness.notHelpfulUsers.push(userId);
    this.helpfulness.notHelpfulCount += 1;
  }
  return this.save();
};

// 인스턴스 메소드 - 업체 응답 추가
reviewSchema.methods.addMerchantReply = function(replyContent, repliedBy) {
  this.merchantReply = {
    content: replyContent,
    repliedAt: new Date(),
    repliedBy: repliedBy
  };
  return this.save();
};

// 정적 메소드 - 상품별 평균 평점 계산
reviewSchema.statics.calculateProductRating = async function(productId) {
  const result = await this.aggregate([
    {
      $match: { 
        productId: mongoose.Types.ObjectId(productId),
        status: 'approved'
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating.overall' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: {
            rating: '$rating.overall',
            taste: '$rating.taste',
            quality: '$rating.quality',
            packaging: '$rating.packaging',
            delivery: '$rating.delivery'
          }
        }
      }
    }
  ]);

  if (result.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      detailRatings: { taste: 0, quality: 0, packaging: 0, delivery: 0 }
    };
  }

  const data = result[0];
  
  // 평점 분포 계산
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const detailRatings = { taste: 0, quality: 0, packaging: 0, delivery: 0 };
  let detailCounts = { taste: 0, quality: 0, packaging: 0, delivery: 0 };

  data.ratingDistribution.forEach(item => {
    distribution[item.rating]++;
    
    if (item.taste) { detailRatings.taste += item.taste; detailCounts.taste++; }
    if (item.quality) { detailRatings.quality += item.quality; detailCounts.quality++; }
    if (item.packaging) { detailRatings.packaging += item.packaging; detailCounts.packaging++; }
    if (item.delivery) { detailRatings.delivery += item.delivery; detailCounts.delivery++; }
  });

  // 세부 평점 평균 계산
  Object.keys(detailRatings).forEach(key => {
    if (detailCounts[key] > 0) {
      detailRatings[key] = detailRatings[key] / detailCounts[key];
    }
  });

  return {
    averageRating: Math.round(data.averageRating * 10) / 10,
    totalReviews: data.totalReviews,
    ratingDistribution: distribution,
    detailRatings
  };
};

// 정적 메소드 - 사용자별 리뷰 통계
reviewSchema.statics.getUserReviewStats = async function(userId) {
  const result = await this.aggregate([
    {
      $match: { userId: mongoose.Types.ObjectId(userId) }
    },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        approvedReviews: {
          $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
        },
        averageRating: { $avg: '$rating.overall' },
        totalHelpfulVotes: { $sum: '$helpfulness.helpfulCount' }
      }
    }
  ]);

  return result.length > 0 ? result[0] : {
    totalReviews: 0,
    approvedReviews: 0,
    averageRating: 0,
    totalHelpfulVotes: 0
  };
};

// 정적 메소드 - 리뷰 리워드 계산
reviewSchema.statics.calculateReviewReward = function(rating, hasPhotos, hasDetailed) {
  let baseReward = 50; // 기본 ₱50 크레딧
  
  if (hasPhotos) baseReward += 30; // 사진 첨부 시 ₱30 추가
  if (hasDetailed) baseReward += 20; // 세부 평점 작성 시 ₱20 추가
  if (rating >= 4) baseReward += 10; // 4점 이상 시 ₱10 추가
  
  return baseReward;
};

module.exports = mongoose.model('Review', reviewSchema);