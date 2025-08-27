/**
 * 다국어 지원 시스템
 * Korean/English/Tagalog 언어팩
 */

const languages = {
  ko: {
    name: '한국어',
    code: 'ko',
    flag: '🇰🇷',
    direction: 'ltr',
    translations: {
      // 네비게이션 및 메뉴
      nav: {
        home: '홈',
        products: '상품',
        categories: '카테고리',
        orders: '주문내역',
        wallet: '크레딧 지갑',
        profile: '프로필',
        logout: '로그아웃',
        login: '로그인',
        register: '회원가입',
        cart: '장바구니',
        search: '검색'
      },
      
      // 메인 페이지
      home: {
        title: "King's Food Philippines",
        subtitle: '필리핀 최고의 한국 식품 도매업체',
        welcome: '안녕하세요!',
        featuredProducts: '추천 상품',
        newArrivals: '신상품',
        bestSellers: '인기상품',
        specialOffers: '특별 할인',
        shopNow: '지금 쇼핑하기',
        learnMore: '자세히 보기'
      },

      // 상품 관련
      products: {
        title: '한국 식품',
        price: '가격',
        perBox: '박스당',
        stock: '재고',
        category: '카테고리',
        description: '상품설명',
        ingredients: '원재료',
        nutrition: '영양정보',
        storage: '보관방법',
        expiry: '유통기한',
        origin: '원산지',
        addToCart: '장바구니 담기',
        buyNow: '바로 구매',
        outOfStock: '품절',
        limitedStock: '재고 부족',
        boxes: '박스',
        quantity: '수량',
        bulkDiscount: '대량 할인',
        wholesalePrice: '도매가격'
      },

      // 카테고리
      categories: {
        all: '전체',
        kimchi: '김치류',
        bulgogi: '불고기',
        tteokbokki: '떡볶이',
        ramen: '라면',
        banchan: '반찬류',
        frozen: '냉동식품',
        sauce: '소스류',
        snacks: '과자류',
        beverages: '음료',
        rice: '쌀/곡류'
      },

      // 주문 및 결제
      order: {
        orderSummary: '주문 요약',
        subtotal: '소계',
        bulkDiscount: '대량 할인',
        deliveryFee: '배송비',
        total: '총 결제금액',
        placeOrder: '주문하기',
        processing: '처리중',
        confirmed: '주문 확정',
        shipped: '배송중',
        delivered: '배송완료',
        cancelled: '주문취소',
        orderNumber: '주문번호',
        orderDate: '주문일시',
        deliveryAddress: '배송주소',
        paymentMethod: '결제방법',
        trackOrder: '주문 추적'
      },

      // 크레딧 지갑
      wallet: {
        title: '크레딧 지갑',
        balance: '잔액',
        chargeCredit: '크레딧 충전',
        chargeAmount: '충전 금액',
        bonus: '보너스',
        selectAmount: '금액 선택',
        paymentMethod: '결제 방법',
        transactionHistory: '거래 내역',
        charge: '충전',
        spend: '사용',
        refund: '환불',
        date: '날짜',
        amount: '금액',
        description: '내역',
        processingFee: '수수료'
      },

      // 결제 방법
      payment: {
        gcash: 'GCash',
        maya: 'Maya (PayMaya)',
        bdo: 'BDO 온라인 뱅킹',
        bpi: 'BPI 온라인 뱅킹',
        creditWallet: '크레딧 지갑',
        selectPayment: '결제 방법 선택',
        payNow: '결제하기',
        paymentSuccess: '결제 완료',
        paymentFailed: '결제 실패',
        processingPayment: '결제 처리중'
      },

      // 사용자 계정
      account: {
        profile: '프로필',
        personalInfo: '개인정보',
        name: '이름',
        phone: '전화번호',
        email: '이메일',
        address: '주소',
        customerLevel: '고객 등급',
        monthlySpending: '월 구매액',
        totalOrders: '총 주문수',
        memberSince: '가입일',
        editProfile: '프로필 수정',
        changePassword: '비밀번호 변경',
        addressBook: '주소록'
      },

      // 배송 정보
      delivery: {
        deliveryInfo: '배송 정보',
        estimatedDelivery: '예상 배송일',
        deliveryFee: '배송비',
        freeDelivery: '무료배송',
        standardDelivery: '일반배송',
        expressDelivery: '특급배송',
        deliveryAddress: '배송 주소',
        contactNumber: '연락처',
        deliveryInstructions: '배송 요청사항',
        trackingNumber: '송장번호'
      },

      // 고객 등급
      customerTiers: {
        retail: '일반 고객',
        bronze: '브론즈 회원',
        silver: '실버 회원',
        gold: '골드 회원',
        platinum: '플래티넘 회원',
        benefits: '혜택',
        nextTier: '다음 등급',
        tierBenefits: '등급별 혜택',
        deliveryDiscount: '배송비 할인',
        creditBonus: '크레딧 보너스'
      },

      // 알림 및 메시지
      notifications: {
        success: '성공',
        error: '오류',
        warning: '경고',
        info: '정보',
        orderPlaced: '주문이 접수되었습니다.',
        paymentCompleted: '결제가 완료되었습니다.',
        creditCharged: '크레딧이 충전되었습니다.',
        profileUpdated: '프로필이 업데이트되었습니다.',
        passwordChanged: '비밀번호가 변경되었습니다.'
      },

      // 폼 관련
      forms: {
        required: '필수 입력',
        optional: '선택사항',
        submit: '제출',
        cancel: '취소',
        save: '저장',
        edit: '수정',
        delete: '삭제',
        confirm: '확인',
        close: '닫기',
        back: '이전',
        next: '다음',
        loading: '로딩중...',
        pleaseWait: '잠시만 기다려주세요'
      },

      // 고객 서비스
      support: {
        customerService: '고객 서비스',
        contactUs: '문의하기',
        faq: '자주 묻는 질문',
        phone: '전화 문의',
        email: '이메일 문의',
        businessHours: '영업시간',
        emergencyContact: '긴급 연락처',
        supportTicket: '문의 티켓'
      },

      // 오류 메시지
      errors: {
        networkError: '네트워크 오류가 발생했습니다.',
        serverError: '서버 오류가 발생했습니다.',
        invalidCredentials: '로그인 정보가 올바르지 않습니다.',
        insufficientCredit: '크레딧이 부족합니다.',
        outOfStock: '재고가 부족합니다.',
        invalidPhone: '올바른 전화번호를 입력해주세요.',
        invalidEmail: '올바른 이메일을 입력해주세요.',
        passwordTooShort: '비밀번호는 최소 6자 이상이어야 합니다.'
      }
    }
  },

  en: {
    name: 'English',
    code: 'en',
    flag: '🇺🇸',
    direction: 'ltr',
    translations: {
      nav: {
        home: 'Home',
        products: 'Products',
        categories: 'Categories',
        orders: 'Orders',
        wallet: 'Credit Wallet',
        profile: 'Profile',
        logout: 'Logout',
        login: 'Login',
        register: 'Register',
        cart: 'Cart',
        search: 'Search'
      },

      home: {
        title: "King's Food Philippines",
        subtitle: 'Philippines Premier Korean Food Wholesale',
        welcome: 'Welcome!',
        featuredProducts: 'Featured Products',
        newArrivals: 'New Arrivals',
        bestSellers: 'Best Sellers',
        specialOffers: 'Special Offers',
        shopNow: 'Shop Now',
        learnMore: 'Learn More'
      },

      products: {
        title: 'Korean Foods',
        price: 'Price',
        perBox: 'per box',
        stock: 'Stock',
        category: 'Category',
        description: 'Description',
        ingredients: 'Ingredients',
        nutrition: 'Nutrition Facts',
        storage: 'Storage',
        expiry: 'Expiry Date',
        origin: 'Country of Origin',
        addToCart: 'Add to Cart',
        buyNow: 'Buy Now',
        outOfStock: 'Out of Stock',
        limitedStock: 'Limited Stock',
        boxes: 'boxes',
        quantity: 'Quantity',
        bulkDiscount: 'Bulk Discount',
        wholesalePrice: 'Wholesale Price'
      },

      categories: {
        all: 'All',
        kimchi: 'Kimchi',
        bulgogi: 'Bulgogi',
        tteokbokki: 'Tteokbokki',
        ramen: 'Ramen',
        banchan: 'Side Dishes',
        frozen: 'Frozen Foods',
        sauce: 'Sauces',
        snacks: 'Snacks',
        beverages: 'Beverages',
        rice: 'Rice & Grains'
      },

      order: {
        orderSummary: 'Order Summary',
        subtotal: 'Subtotal',
        bulkDiscount: 'Bulk Discount',
        deliveryFee: 'Delivery Fee',
        total: 'Total Amount',
        placeOrder: 'Place Order',
        processing: 'Processing',
        confirmed: 'Confirmed',
        shipped: 'Shipped',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
        orderNumber: 'Order Number',
        orderDate: 'Order Date',
        deliveryAddress: 'Delivery Address',
        paymentMethod: 'Payment Method',
        trackOrder: 'Track Order'
      },

      wallet: {
        title: 'Credit Wallet',
        balance: 'Balance',
        chargeCredit: 'Charge Credit',
        chargeAmount: 'Charge Amount',
        bonus: 'Bonus',
        selectAmount: 'Select Amount',
        paymentMethod: 'Payment Method',
        transactionHistory: 'Transaction History',
        charge: 'Charge',
        spend: 'Spend',
        refund: 'Refund',
        date: 'Date',
        amount: 'Amount',
        description: 'Description',
        processingFee: 'Processing Fee'
      },

      payment: {
        gcash: 'GCash',
        maya: 'Maya (PayMaya)',
        bdo: 'BDO Online Banking',
        bpi: 'BPI Online Banking',
        creditWallet: 'Credit Wallet',
        selectPayment: 'Select Payment Method',
        payNow: 'Pay Now',
        paymentSuccess: 'Payment Successful',
        paymentFailed: 'Payment Failed',
        processingPayment: 'Processing Payment'
      },

      account: {
        profile: 'Profile',
        personalInfo: 'Personal Information',
        name: 'Name',
        phone: 'Phone Number',
        email: 'Email',
        address: 'Address',
        customerLevel: 'Customer Level',
        monthlySpending: 'Monthly Spending',
        totalOrders: 'Total Orders',
        memberSince: 'Member Since',
        editProfile: 'Edit Profile',
        changePassword: 'Change Password',
        addressBook: 'Address Book'
      },

      delivery: {
        deliveryInfo: 'Delivery Information',
        estimatedDelivery: 'Estimated Delivery',
        deliveryFee: 'Delivery Fee',
        freeDelivery: 'Free Delivery',
        standardDelivery: 'Standard Delivery',
        expressDelivery: 'Express Delivery',
        deliveryAddress: 'Delivery Address',
        contactNumber: 'Contact Number',
        deliveryInstructions: 'Delivery Instructions',
        trackingNumber: 'Tracking Number'
      },

      customerTiers: {
        retail: 'Retail Customer',
        bronze: 'Bronze Member',
        silver: 'Silver Member',
        gold: 'Gold Member',
        platinum: 'Platinum Member',
        benefits: 'Benefits',
        nextTier: 'Next Tier',
        tierBenefits: 'Tier Benefits',
        deliveryDiscount: 'Delivery Discount',
        creditBonus: 'Credit Bonus'
      },

      notifications: {
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        info: 'Information',
        orderPlaced: 'Order has been placed successfully.',
        paymentCompleted: 'Payment completed successfully.',
        creditCharged: 'Credit has been charged successfully.',
        profileUpdated: 'Profile updated successfully.',
        passwordChanged: 'Password changed successfully.'
      },

      forms: {
        required: 'Required',
        optional: 'Optional',
        submit: 'Submit',
        cancel: 'Cancel',
        save: 'Save',
        edit: 'Edit',
        delete: 'Delete',
        confirm: 'Confirm',
        close: 'Close',
        back: 'Back',
        next: 'Next',
        loading: 'Loading...',
        pleaseWait: 'Please wait...'
      },

      support: {
        customerService: 'Customer Service',
        contactUs: 'Contact Us',
        faq: 'Frequently Asked Questions',
        phone: 'Phone Inquiry',
        email: 'Email Inquiry',
        businessHours: 'Business Hours',
        emergencyContact: 'Emergency Contact',
        supportTicket: 'Support Ticket'
      },

      errors: {
        networkError: 'Network error occurred.',
        serverError: 'Server error occurred.',
        invalidCredentials: 'Invalid login credentials.',
        insufficientCredit: 'Insufficient credit balance.',
        outOfStock: 'Insufficient stock.',
        invalidPhone: 'Please enter a valid phone number.',
        invalidEmail: 'Please enter a valid email address.',
        passwordTooShort: 'Password must be at least 6 characters long.'
      }
    }
  },

  tl: {
    name: 'Tagalog',
    code: 'tl', 
    flag: '🇵🇭',
    direction: 'ltr',
    translations: {
      nav: {
        home: 'Home',
        products: 'Mga Produkto',
        categories: 'Mga Kategorya',
        orders: 'Mga Order',
        wallet: 'Credit Wallet',
        profile: 'Profile',
        logout: 'Logout',
        login: 'Login',
        register: 'Mag-register',
        cart: 'Cart',
        search: 'Maghanap'
      },

      home: {
        title: "King's Food Philippines",
        subtitle: 'Pinakamahusay na Korean Food Wholesale sa Pilipinas',
        welcome: 'Maligayang pagdating!',
        featuredProducts: 'Mga Pangunahing Produkto',
        newArrivals: 'Mga Bagong Dating',
        bestSellers: 'Pinakamabenta',
        specialOffers: 'Mga Espesyal na Alok',
        shopNow: 'Mamili Na',
        learnMore: 'Alamin Pa'
      },

      products: {
        title: 'Korean Foods',
        price: 'Presyo',
        perBox: 'bawat kahon',
        stock: 'Stock',
        category: 'Kategorya',
        description: 'Paglalarawan',
        ingredients: 'Mga Sangkap',
        nutrition: 'Nutritional Facts',
        storage: 'Pag-iimbak',
        expiry: 'Expiry Date',
        origin: 'Pinagmulan',
        addToCart: 'Ilagay sa Cart',
        buyNow: 'Bilhin Ngayon',
        outOfStock: 'Walang Stock',
        limitedStock: 'Limitadong Stock',
        boxes: 'mga kahon',
        quantity: 'Dami',
        bulkDiscount: 'Bulk Discount',
        wholesalePrice: 'Wholesale Price'
      },

      categories: {
        all: 'Lahat',
        kimchi: 'Kimchi',
        bulgogi: 'Bulgogi',
        tteokbokki: 'Tteokbokki',
        ramen: 'Ramen',
        banchan: 'Side Dishes',
        frozen: 'Frozen Foods',
        sauce: 'Mga Sauce',
        snacks: 'Mga Snacks',
        beverages: 'Mga Inumin',
        rice: 'Bigas at Butil'
      },

      // 나머지 번역들도 필요에 따라 추가...
      // 간단히 하기 위해 영어 번역 사용
      order: {
        orderSummary: 'Order Summary',
        subtotal: 'Subtotal',
        bulkDiscount: 'Bulk Discount',
        deliveryFee: 'Delivery Fee',
        total: 'Kabuuang Halaga',
        placeOrder: 'Mag-order',
        processing: 'Pinoproseso',
        confirmed: 'Nakumpirma',
        shipped: 'Naipadala',
        delivered: 'Naihatid',
        cancelled: 'Nakansela',
        orderNumber: 'Order Number',
        orderDate: 'Petsa ng Order',
        deliveryAddress: 'Address ng Delivery',
        paymentMethod: 'Paraan ng Bayad',
        trackOrder: 'I-track ang Order'
      }
    }
  }
};

/**
 * 언어 감지 및 설정
 */
function detectLanguage() {
  const browserLang = navigator.language || navigator.userLanguage;
  const savedLang = localStorage.getItem('kingsfood_language');
  
  if (savedLang && languages[savedLang]) {
    return savedLang;
  }
  
  // 브라우저 언어 기반 감지
  if (browserLang.startsWith('ko')) return 'ko';
  if (browserLang.startsWith('tl') || browserLang.startsWith('fil')) return 'tl';
  
  return 'en'; // 기본값
}

/**
 * 언어 변경
 */
function setLanguage(langCode) {
  if (languages[langCode]) {
    localStorage.setItem('kingsfood_language', langCode);
    location.reload(); // 페이지 새로고침
  }
}

/**
 * 번역 가져오기
 */
function getTranslation(key, lang = null) {
  const currentLang = lang || detectLanguage();
  const translation = languages[currentLang];
  
  if (!translation) return key;
  
  // 키 경로로 번역 찾기 (예: 'nav.home')
  const keys = key.split('.');
  let result = translation.translations;
  
  for (const k of keys) {
    if (result && result[k]) {
      result = result[k];
    } else {
      return key; // 번역을 찾지 못한 경우 원본 키 반환
    }
  }
  
  return result;
}

/**
 * 숫자 현지화 (통화 포맷)
 */
function formatCurrency(amount, lang = null) {
  const currentLang = lang || detectLanguage();
  
  switch (currentLang) {
    case 'ko':
      return `₱${amount.toLocaleString('ko-KR')}`;
    case 'tl':
      return `₱${amount.toLocaleString('tl-PH')}`;
    default:
      return `₱${amount.toLocaleString('en-PH')}`;
  }
}

/**
 * 날짜 현지화
 */
function formatDate(date, lang = null) {
  const currentLang = lang || detectLanguage();
  const dateObj = new Date(date);
  
  switch (currentLang) {
    case 'ko':
      return dateObj.toLocaleDateString('ko-KR');
    case 'tl':
      return dateObj.toLocaleDateString('tl-PH');
    default:
      return dateObj.toLocaleDateString('en-PH');
  }
}

/**
 * 전화번호 포맷팅 (필리핀 형식)
 */
function formatPhoneNumber(phone, lang = null) {
  const currentLang = lang || detectLanguage();
  
  // +63-XXX-XXX-XXXX 형식으로 통일
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.startsWith('63') && cleanPhone.length === 12) {
    const formatted = `+63-${cleanPhone.slice(2, 5)}-${cleanPhone.slice(5, 8)}-${cleanPhone.slice(8)}`;
    return formatted;
  } else if (cleanPhone.startsWith('09') && cleanPhone.length === 11) {
    const formatted = `+63-${cleanPhone.slice(1, 4)}-${cleanPhone.slice(4, 7)}-${cleanPhone.slice(7)}`;
    return formatted;
  }
  
  return phone; // 형식이 맞지 않으면 원본 반환
}

module.exports = {
  languages,
  detectLanguage,
  setLanguage,
  getTranslation,
  formatCurrency,
  formatDate,
  formatPhoneNumber
};