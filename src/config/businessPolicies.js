/**
 * King's Food Philippines 비즈니스 정책 및 규칙
 * 고객 서비스 정책, 환불 정책, 할인 정책 등
 */

const businessPolicies = {
  // 기본 비즈니스 정보
  companyInfo: {
    name: "King's Food Philippines",
    businessType: "Korean Food Wholesale",
    establishedYear: 2024,
    businessHours: {
      monday: { open: "08:00", close: "18:00", active: true },
      tuesday: { open: "08:00", close: "18:00", active: true },
      wednesday: { open: "08:00", close: "18:00", active: true },
      thursday: { open: "08:00", close: "18:00", active: true },
      friday: { open: "08:00", close: "18:00", active: true },
      saturday: { open: "08:00", close: "16:00", active: true },
      sunday: { open: "10:00", close: "14:00", active: false }
    },
    contact: {
      phone: "+63-2-1234-5678",
      mobile: "+63-917-123-4567",
      email: "support@kingsfood.ph",
      address: "123 Korean Food Street, Binondo, Manila 1006, Philippines"
    },
    socialMedia: {
      facebook: "https://facebook.com/kingsfoodph",
      instagram: "@kingsfoodphilippines", 
      website: "https://kingsfood.ph"
    }
  },

  // 주문 정책
  orderPolicies: {
    minimumOrder: {
      amount: 1500, // ₱1,500 최소 주문
      description: "최소 주문 금액은 ₱1,500입니다."
    },
    boxOnlyPolicy: {
      enabled: true,
      description: "모든 상품은 박스 단위로만 판매됩니다. 개별 상품 판매는 하지 않습니다.",
      minimumBoxQuantity: 1
    },
    bulkDiscountTiers: [
      { minBoxes: 2, maxBoxes: 4, discountRate: 0.03, description: "2-4박스: 3% 할인" },
      { minBoxes: 5, maxBoxes: 9, discountRate: 0.05, description: "5-9박스: 5% 할인" },
      { minBoxes: 10, maxBoxes: 19, discountRate: 0.08, description: "10-19박스: 8% 할인" },
      { minBoxes: 20, maxBoxes: null, discountRate: 0.12, description: "20박스 이상: 12% 할인" }
    ],
    orderCutoffTime: "15:00", // 오후 3시 이후 주문은 다음날 처리
    processingTime: "1-2 business days",
    cancellationPolicy: {
      allowedUntil: 2, // 주문 후 2시간 이내 취소 가능
      timeUnit: "hours",
      description: "주문 후 2시간 이내에만 취소가 가능합니다."
    }
  },

  // 크레딧 지갑 정책
  walletPolicies: {
    minimumCharge: 1000, // ₱1,000 최소 충전
    maximumCharge: 100000, // ₱100,000 최대 충전
    bonusRates: [
      { minAmount: 5000, maxAmount: 9999, rate: 0.05, description: "₱5,000-₱9,999: 5% 보너스" },
      { minAmount: 10000, maxAmount: 19999, rate: 0.08, description: "₱10,000-₱19,999: 8% 보너스" },
      { minAmount: 20000, maxAmount: null, rate: 0.10, description: "₱20,000 이상: 10% 보너스" }
    ],
    expiryPolicy: {
      enabled: false, // 크레딧 만료 없음
      description: "충전된 크레딧은 만료되지 않습니다."
    },
    refundPolicy: {
      enabled: true,
      processingTime: "3-5 business days",
      fee: 50, // ₱50 환불 수수료
      minimumAmount: 500, // ₱500 이상만 환불 가능
      description: "₱500 이상 크레딧 환불 시 ₱50 수수료가 부과됩니다."
    }
  },

  // 배송 정책
  deliveryPolicies: {
    methods: ["self_delivery"], // 자체 배송만
    selfDelivery: {
      enabled: true,
      description: "King's Food 자체 배송 서비스",
      trackingAvailable: true,
      signatureRequired: false,
      contactlessDelivery: true
    },
    packingPolicy: {
      coldChain: true, // 냉장 배송
      temperatureControl: "2-8°C",
      packingMaterials: ["insulated_box", "ice_packs", "bubble_wrap"],
      description: "모든 상품은 냉장 상태로 안전하게 포장되어 배송됩니다."
    },
    deliveryTime: {
      standardDelivery: {
        metroManila: "1-2 days",
        luzon: "2-4 days", 
        visayas: "4-6 days",
        mindanao: "5-8 days"
      },
      expressDelivery: {
        enabled: false, // 현재 미제공
        description: "익스프레스 배송은 추후 제공 예정입니다."
      }
    }
  },

  // 고객 등급 정책
  customerTierPolicies: {
    tiers: [
      {
        name: "retail",
        displayName: "일반 고객",
        minMonthlySpending: 0,
        benefits: ["기본 가격", "표준 배송"],
        deliveryDiscountRate: 0,
        creditBonusMultiplier: 1.0
      },
      {
        name: "bronze", 
        displayName: "브론즈 회원",
        minMonthlySpending: 50000,
        benefits: ["배송비 5% 할인", "크레딧 보너스 1.1배"],
        deliveryDiscountRate: 0.05,
        creditBonusMultiplier: 1.1
      },
      {
        name: "silver",
        displayName: "실버 회원", 
        minMonthlySpending: 150000,
        benefits: ["배송비 10% 할인", "크레딧 보너스 1.2배", "우선 고객 지원"],
        deliveryDiscountRate: 0.10,
        creditBonusMultiplier: 1.2
      },
      {
        name: "gold",
        displayName: "골드 회원",
        minMonthlySpending: 300000,
        benefits: ["배송비 15% 할인", "크레딧 보너스 1.3배", "전담 고객 매니저"],
        deliveryDiscountRate: 0.15,
        creditBonusMultiplier: 1.3
      },
      {
        name: "platinum",
        displayName: "플래티넘 회원",
        minMonthlySpending: 500000,
        benefits: ["배송비 20% 할인", "크레딧 보너스 1.5배", "VIP 고객 서비스", "특별 할인 혜택"],
        deliveryDiscountRate: 0.20,
        creditBonusMultiplier: 1.5
      }
    ],
    evaluationPeriod: "monthly", // 월별 평가
    tierMaintenance: {
      required: true,
      gracePeriod: 3, // 3개월 유예 기간
      description: "등급 유지를 위해서는 매월 최소 구매 금액을 충족해야 합니다."
    }
  },

  // 환불 및 교환 정책
  refundExchangePolicies: {
    refund: {
      enabled: true,
      timeLimit: 7, // 7일 이내
      conditions: [
        "상품 불량",
        "배송 중 손상", 
        "주문 내용과 다른 상품 수령",
        "유통기한 임박 상품 (남은 기간 3일 이내)"
      ],
      excludedItems: [
        "이미 개봉한 냉장/냉동 식품",
        "고객의 단순 변심",
        "유통기한이 충분한 정상 상품"
      ],
      processingTime: "3-7 business days",
      refundMethod: "credit_wallet", // 크레딧으로만 환불
      description: "환불은 크레딧 지갑으로만 처리됩니다."
    },
    exchange: {
      enabled: true,
      timeLimit: 3, // 3일 이내
      conditions: [
        "상품 불량",
        "주문 내용과 다른 상품 수령"
      ],
      additionalDeliveryFee: false, // 교환 시 배송비 무료
      processingTime: "2-5 business days"
    }
  },

  // 품질 보증 정책
  qualityAssurancePolicies: {
    freshnesGuarantee: {
      enabled: true,
      minimumShelfLife: 7, // 최소 7일 유통기한 보장
      temperatureGuarantee: "2-8°C 냉장 배송",
      description: "모든 상품은 최소 7일 이상의 유통기한을 보장합니다."
    },
    qualityControl: {
      inspectionProcess: [
        "입고 시 품질 검사",
        "포장 전 재검사",
        "배송 전 최종 확인"
      ],
      certifications: ["HACCP", "FDA Philippines", "Korean Quality Mark"],
      description: "엄격한 품질 관리 시스템을 통해 최상의 상품만 배송합니다."
    }
  },

  // 개인정보 보호 정책
  privacyPolicies: {
    dataCollection: {
      personalInfo: ["이름", "전화번호", "배송 주소"],
      businessInfo: ["구매 내역", "크레딧 거래 내역"],
      optionalInfo: ["이메일", "생년월일"],
      description: "서비스 제공에 필요한 최소한의 정보만 수집합니다."
    },
    dataUsage: [
      "주문 처리 및 배송",
      "고객 서비스 제공",
      "마케팅 정보 발송 (동의 시)",
      "서비스 개선"
    ],
    dataRetention: {
      activeCustomer: "서비스 이용 기간",
      inactiveCustomer: "3년",
      description: "개인정보는 관련 법규에 따라 안전하게 관리됩니다."
    },
    thirdPartySharing: {
      enabled: false,
      exceptions: [
        "법적 요구사항",
        "배송 업체 (배송 정보만)"
      ],
      description: "고객 동의 없이 제3자에게 개인정보를 제공하지 않습니다."
    }
  },

  // 고객 지원 정책
  customerSupportPolicies: {
    channels: [
      {
        type: "phone",
        contact: "+63-2-1234-5678",
        hours: "Monday-Friday: 8:00 AM - 6:00 PM",
        languages: ["English", "Korean", "Tagalog"]
      },
      {
        type: "mobile",
        contact: "+63-917-123-4567",
        hours: "Emergency orders: 24/7",
        description: "긴급 주문 및 배송 문의"
      },
      {
        type: "email",
        contact: "support@kingsfood.ph",
        responseTime: "24-48 hours",
        languages: ["English", "Korean"]
      },
      {
        type: "social_media",
        contact: "Facebook Messenger",
        hours: "Monday-Saturday: 9:00 AM - 7:00 PM",
        responseTime: "1-4 hours"
      }
    ],
    supportLevels: {
      basic: {
        customers: ["retail", "bronze"],
        responseTime: "24-48 hours",
        channels: ["email", "social_media"]
      },
      premium: {
        customers: ["silver", "gold"],
        responseTime: "4-12 hours",
        channels: ["phone", "email", "social_media"],
        dedicatedSupport: false
      },
      vip: {
        customers: ["platinum"],
        responseTime: "1-4 hours",
        channels: ["phone", "mobile", "email", "social_media"],
        dedicatedSupport: true,
        personalManager: true
      }
    }
  },

  // 프로모션 및 할인 정책
  promotionPolicies: {
    newCustomerDiscount: {
      enabled: true,
      discountRate: 0.10, // 10% 할인
      minimumOrder: 3000,
      validityPeriod: 30, // 30일
      description: "신규 고객 첫 주문 10% 할인 (₱3,000 이상 주문 시)"
    },
    seasonalPromotions: {
      enabled: true,
      events: [
        {
          name: "Korean New Year Special",
          period: "January 1-15",
          discountRate: 0.15,
          applicableCategories: ["traditional_foods", "rice_cakes"]
        },
        {
          name: "Chuseok Festival Sale", 
          period: "September (Lunar Calendar)",
          discountRate: 0.20,
          applicableCategories: ["all"]
        },
        {
          name: "Christmas Korean Food Package",
          period: "December 15-25",
          discountRate: 0.12,
          specialPackages: true
        }
      ]
    },
    loyaltyProgram: {
      enabled: true,
      pointsEarningRate: 0.01, // 1% 포인트 적립
      pointsRedemptionRate: 1, // 1포인트 = ₱1
      minimumRedemption: 500, // 최소 500포인트
      pointsExpiry: 365, // 1년 후 만료
      description: "구매 금액의 1%를 포인트로 적립하여 다음 주문에서 현금처럼 사용 가능"
    }
  },

  // 운영 시간 및 휴무일
  operationalSchedule: {
    regularHours: "Monday-Saturday: 8:00 AM - 6:00 PM",
    weekendHours: "Sunday: 10:00 AM - 2:00 PM (Limited service)",
    holidays: [
      { date: "2024-01-01", name: "New Year's Day" },
      { date: "2024-02-10", name: "Chinese New Year" },
      { date: "2024-04-09", name: "Araw ng Kagitingan" },
      { date: "2024-05-01", name: "Labor Day" },
      { date: "2024-06-12", name: "Independence Day" },
      { date: "2024-08-26", name: "National Heroes Day" },
      { date: "2024-11-30", name: "Bonifacio Day" },
      { date: "2024-12-25", name: "Christmas Day" },
      { date: "2024-12-30", name: "Rizal Day" }
    ],
    emergencyContact: {
      available: true,
      contact: "+63-917-123-4567",
      conditions: ["배송 지연", "상품 품질 문제", "긴급 주문"],
      additionalFee: 200 // ₱200 긴급 서비스 수수료
    }
  }
};

/**
 * 고객 등급별 혜택 계산
 */
function calculateCustomerBenefits(customerLevel, orderAmount, deliveryFee) {
  const tier = businessPolicies.customerTierPolicies.tiers.find(t => t.name === customerLevel);
  if (!tier) return { deliveryDiscount: 0, creditBonusMultiplier: 1.0 };

  const deliveryDiscount = Math.floor(deliveryFee * tier.deliveryDiscountRate);
  
  return {
    deliveryDiscount,
    creditBonusMultiplier: tier.creditBonusMultiplier,
    benefits: tier.benefits,
    displayName: tier.displayName
  };
}

/**
 * 대량 구매 할인 계산
 */
function calculateBulkDiscount(totalBoxes) {
  const { bulkDiscountTiers } = businessPolicies.orderPolicies;
  
  for (const tier of bulkDiscountTiers) {
    if (totalBoxes >= tier.minBoxes && (tier.maxBoxes === null || totalBoxes <= tier.maxBoxes)) {
      return {
        applicable: true,
        discountRate: tier.discountRate,
        description: tier.description,
        tier: tier
      };
    }
  }
  
  return { applicable: false, discountRate: 0 };
}

/**
 * 크레딧 충전 보너스 계산
 */
function calculateCreditBonus(chargeAmount, customerLevel = 'retail') {
  const { bonusRates } = businessPolicies.walletPolicies;
  const { creditBonusMultiplier } = calculateCustomerBenefits(customerLevel, 0, 0);
  
  let baseBonus = 0;
  for (const rate of bonusRates) {
    if (chargeAmount >= rate.minAmount && (rate.maxAmount === null || chargeAmount <= rate.maxAmount)) {
      baseBonus = Math.floor(chargeAmount * rate.rate);
      break;
    }
  }
  
  return Math.floor(baseBonus * creditBonusMultiplier);
}

/**
 * 주문 취소 가능 여부 확인
 */
function canCancelOrder(orderDate) {
  const { cancellationPolicy } = businessPolicies.orderPolicies;
  const now = new Date();
  const orderTime = new Date(orderDate);
  const timeDiffHours = (now - orderTime) / (1000 * 60 * 60);
  
  return timeDiffHours <= cancellationPolicy.allowedUntil;
}

/**
 * 환불 가능 여부 확인
 */
function canRefundOrder(orderDate, reason) {
  const { refund } = businessPolicies.refundExchangePolicies;
  if (!refund.enabled) return { allowed: false, reason: '환불 서비스가 비활성화되어 있습니다.' };
  
  const now = new Date();
  const orderTime = new Date(orderDate);
  const timeDiffDays = (now - orderTime) / (1000 * 60 * 60 * 24);
  
  if (timeDiffDays > refund.timeLimit) {
    return { allowed: false, reason: `환불 가능 기간(${refund.timeLimit}일)이 경과했습니다.` };
  }
  
  if (!refund.conditions.includes(reason)) {
    return { allowed: false, reason: '환불 사유가 정책에 해당하지 않습니다.' };
  }
  
  return { allowed: true, processingTime: refund.processingTime };
}

/**
 * 영업시간 확인
 */
function isBusinessHours() {
  const now = new Date();
  const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
  const currentTime = now.toTimeString().slice(0, 5);
  
  const businessHours = businessPolicies.companyInfo.businessHours[currentDay];
  if (!businessHours.active) return false;
  
  return currentTime >= businessHours.open && currentTime <= businessHours.close;
}

module.exports = {
  businessPolicies,
  calculateCustomerBenefits,
  calculateBulkDiscount,
  calculateCreditBonus,
  canCancelOrder,
  canRefundOrder,
  isBusinessHours
};