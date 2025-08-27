/**
 * 박스 단위 상품 모델
 * 모든 상품은 박스 단위로만 판매
 */

const mongoose = require('mongoose');

const boxProductSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  nameEn: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true,
    enum: ['kimchi', 'noodles', 'sauces', 'snacks', 'beverages', 'frozen', 'vegetables', 'seafood', 'others']
  },
  brand: {
    type: String,
    default: "King's Food"
  },
  
  // 박스 단위 정보
  boxInfo: {
    itemsPerBox: {
      type: Number,
      required: true,
      min: 1
    },
    boxWeight: {
      type: Number, // kg
      default: 0
    },
    boxDimensions: {
      length: Number, // cm
      width: Number,
      height: Number
    },
    unitType: {
      type: String,
      enum: ['piece', 'kg', 'liter', 'pack'],
      default: 'piece'
    }
  },
  
  // 가격 정보 (박스당)
  pricing: {
    basePrice: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'PHP'
    },
    // 박스 수량별 할인
    bulkDiscounts: [{
      minBoxes: {
        type: Number,
        required: true
      },
      discountPercent: {
        type: Number,
        required: true,
        min: 0,
        max: 50
      }
    }],
    wholesalePrice: {
      type: Number,
      default: null // 도매가 (설정된 경우)
    }
  },
  
  // 재고 정보 (박스 단위)
  inventory: {
    totalBoxes: {
      type: Number,
      required: true,
      min: 0
    },
    reservedBoxes: {
      type: Number,
      default: 0,
      min: 0
    },
    availableBoxes: {
      type: Number,
      default: function() {
        return this.totalBoxes - this.reservedBoxes;
      }
    },
    minStockAlert: {
      type: Number,
      default: 10 // 10박스 이하 시 알림
    },
    warehouse: {
      type: String,
      default: 'Manila Main'
    }
  },
  
  // 주문 제한
  orderLimits: {
    minOrderBoxes: {
      type: Number,
      default: 1,
      min: 1
    },
    maxOrderBoxes: {
      type: Number,
      default: 100
    },
    multipleOf: {
      type: Number,
      default: 1 // 반드시 이 수량의 배수로만 주문 가능
    }
  },
  
  // 배송 정보
  shipping: {
    weight: Number, // 박스당 배송 중량
    refrigerated: {
      type: Boolean,
      default: false
    },
    frozen: {
      type: Boolean,
      default: false
    },
    fragile: {
      type: Boolean,
      default: false
    },
    shippingFeePerBox: {
      type: Number,
      default: 0
    }
  },
  
  // 상품 이미지
  images: [{
    url: String,
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  // 상태
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued', 'out_of_stock'],
    default: 'active'
  },
  
  // SEO 및 메타데이터
  seo: {
    title: String,
    description: String,
    keywords: [String]
  },
  
  // 추가 정보
  specifications: {
    origin: {
      type: String,
      default: '한국'
    },
    expiryDays: Number, // 유통기한 일수
    ingredients: [String],
    nutritionFacts: Object,
    certifications: [String] // 할랄, 유기농 등
  },
  
  // 통계
  stats: {
    totalSold: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviewCount: {
      type: Number,
      default: 0
    },
    viewCount: {
      type: Number,
      default: 0
    }
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

// 가격 계산 메소드
boxProductSchema.methods.calculatePrice = function(boxQuantity, customerType = 'retail') {
  let basePrice = this.pricing.basePrice;
  
  // 도매 고객의 경우 도매가 적용
  if (customerType === 'wholesale' && this.pricing.wholesalePrice) {
    basePrice = this.pricing.wholesalePrice;
  }
  
  let finalPrice = basePrice;
  let appliedDiscount = 0;
  
  // 박스 수량 할인 적용 (가장 높은 할인율 찾기)
  if (this.pricing.bulkDiscounts && this.pricing.bulkDiscounts.length > 0) {
    const applicableDiscounts = this.pricing.bulkDiscounts
      .filter(discount => boxQuantity >= discount.minBoxes)
      .sort((a, b) => b.discountPercent - a.discountPercent);
    
    if (applicableDiscounts.length > 0) {
      appliedDiscount = applicableDiscounts[0].discountPercent;
      finalPrice = basePrice * (1 - appliedDiscount / 100);
    }
  }
  
  const totalPrice = finalPrice * boxQuantity;
  const totalDiscount = (basePrice - finalPrice) * boxQuantity;
  
  return {
    basePrice,
    finalPricePerBox: finalPrice,
    boxQuantity,
    subtotal: basePrice * boxQuantity,
    totalDiscount,
    totalPrice,
    appliedDiscountPercent: appliedDiscount,
    savings: totalDiscount,
    priceBreakdown: {
      basePrice: `₱${basePrice.toLocaleString()}`,
      finalPrice: `₱${finalPrice.toLocaleString()}`,
      total: `₱${totalPrice.toLocaleString()}`,
      savings: totalDiscount > 0 ? `₱${totalDiscount.toLocaleString()}` : null
    }
  };
};

// 재고 확인 메소드
boxProductSchema.methods.checkAvailability = function(requestedBoxes) {
  const available = this.inventory.totalBoxes - this.inventory.reservedBoxes;
  
  return {
    isAvailable: available >= requestedBoxes,
    availableBoxes: available,
    requestedBoxes,
    shortfall: Math.max(0, requestedBoxes - available),
    canPartialFulfill: available > 0 && available < requestedBoxes,
    isOutOfStock: available === 0
  };
};

// 재고 예약 메소드
boxProductSchema.methods.reserveStock = function(boxQuantity) {
  const availability = this.checkAvailability(boxQuantity);
  
  if (!availability.isAvailable) {
    throw new Error(`재고 부족: ${availability.shortfall}박스 부족`);
  }
  
  this.inventory.reservedBoxes += boxQuantity;
  this.updatedAt = new Date();
  
  return {
    reserved: boxQuantity,
    totalReserved: this.inventory.reservedBoxes,
    availableBoxes: this.inventory.totalBoxes - this.inventory.reservedBoxes
  };
};

// 재고 해제 메소드  
boxProductSchema.methods.releaseStock = function(boxQuantity) {
  this.inventory.reservedBoxes = Math.max(0, this.inventory.reservedBoxes - boxQuantity);
  this.updatedAt = new Date();
  
  return {
    released: boxQuantity,
    totalReserved: this.inventory.reservedBoxes,
    availableBoxes: this.inventory.totalBoxes - this.inventory.reservedBoxes
  };
};

// 판매 완료 처리
boxProductSchema.methods.completeSale = function(boxQuantity) {
  this.inventory.totalBoxes -= boxQuantity;
  this.inventory.reservedBoxes = Math.max(0, this.inventory.reservedBoxes - boxQuantity);
  this.stats.totalSold += boxQuantity;
  this.updatedAt = new Date();
  
  // 재고 부족 상태 확인
  if (this.inventory.totalBoxes === 0) {
    this.status = 'out_of_stock';
  }
  
  return {
    sold: boxQuantity,
    totalSold: this.stats.totalSold,
    remainingStock: this.inventory.totalBoxes,
    newStatus: this.status
  };
};

// 다음 할인 구간 정보
boxProductSchema.methods.getNextDiscountInfo = function(currentBoxes) {
  if (!this.pricing.bulkDiscounts || this.pricing.bulkDiscounts.length === 0) {
    return null;
  }
  
  const sortedDiscounts = this.pricing.bulkDiscounts
    .sort((a, b) => a.minBoxes - b.minBoxes);
  
  const nextDiscount = sortedDiscounts.find(discount => 
    discount.minBoxes > currentBoxes
  );
  
  if (!nextDiscount) return null;
  
  const boxesNeeded = nextDiscount.minBoxes - currentBoxes;
  const currentPrice = this.calculatePrice(currentBoxes);
  const nextPrice = this.calculatePrice(nextDiscount.minBoxes);
  const savings = currentPrice.totalPrice - nextPrice.totalPrice;
  
  return {
    boxesNeeded,
    minBoxes: nextDiscount.minBoxes,
    discountPercent: nextDiscount.discountPercent,
    potentialSavings: savings,
    message: `${boxesNeeded}박스 더 주문하면 ${nextDiscount.discountPercent}% 할인! (₱${savings.toLocaleString()} 절약)`
  };
};

// 인덱스 설정
boxProductSchema.index({ productId: 1 });
boxProductSchema.index({ category: 1, status: 1 });
boxProductSchema.index({ 'inventory.availableBoxes': 1 });
boxProductSchema.index({ 'pricing.basePrice': 1 });
boxProductSchema.index({ status: 1, createdAt: -1 });

// 가상 필드
boxProductSchema.virtual('isInStock').get(function() {
  return this.inventory.totalBoxes > this.inventory.reservedBoxes && this.status === 'active';
});

boxProductSchema.virtual('needsRestock').get(function() {
  return (this.inventory.totalBoxes - this.inventory.reservedBoxes) <= this.inventory.minStockAlert;
});

const BoxProduct = mongoose.model('BoxProduct', boxProductSchema);

module.exports = BoxProduct;