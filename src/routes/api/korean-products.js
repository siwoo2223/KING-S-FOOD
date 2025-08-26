/**
 * 한국 식자재 전용 API 라우트
 * King's Food - 필리핀 한국 식자재 도매
 */

const express = require('express');
const router = express.Router();

// 한국 식자재 카테고리 목록
router.get('/categories', (req, res) => {
  res.json({
    success: true,
    message: 'Korean food categories retrieved',
    data: {
      categories: [
        {
          id: 'kimchi',
          name: '김치/젓갈',
          name_en: 'Kimchi & Pickled Foods',
          name_filipino: 'Kimchi at Pickled Foods',
          icon: 'fas fa-pepper-hot',
          color: 'red',
          product_count: 2440,
          subcategories: [
            { id: 'cabbage-kimchi', name: '배추김치', name_en: 'Cabbage Kimchi' },
            { id: 'radish-kimchi', name: '깍두기', name_en: 'Cubed Radish Kimchi' },
            { id: 'cucumber-kimchi', name: '오이소박이', name_en: 'Cucumber Kimchi' },
            { id: 'fermented-seafood', name: '젓갈류', name_en: 'Fermented Seafood' }
          ]
        },
        {
          id: 'noodles',
          name: '라면/면류',
          name_en: 'Instant Noodles & Noodles',
          name_filipino: 'Instant Noodles at Noodles',
          icon: 'fas fa-bowl-food',
          color: 'orange',
          product_count: 1876,
          subcategories: [
            { id: 'instant-ramen', name: '봉지라면', name_en: 'Instant Ramen' },
            { id: 'cup-noodles', name: '컵라면', name_en: 'Cup Noodles' },
            { id: 'naengmyeon', name: '냉면', name_en: 'Cold Noodles' },
            { id: 'udon', name: '우동면', name_en: 'Udon Noodles' }
          ]
        },
        {
          id: 'vegetables',
          name: '채소/나물',
          name_en: 'Vegetables & Herbs',
          name_filipino: 'Gulay at Herbs',
          icon: 'fas fa-leaf',
          color: 'green',
          product_count: 3245,
          subcategories: [
            { id: 'fresh-vegetables', name: '신선채소', name_en: 'Fresh Vegetables' },
            { id: 'dried-vegetables', name: '건나물', name_en: 'Dried Vegetables' },
            { id: 'korean-herbs', name: '한국나물', name_en: 'Korean Herbs' },
            { id: 'mushrooms', name: '버섯류', name_en: 'Mushrooms' }
          ]
        },
        {
          id: 'seafood',
          name: '생선/해산물',
          name_en: 'Fish & Seafood',
          name_filipino: 'Isda at Seafood',
          icon: 'fas fa-fish',
          color: 'blue',
          product_count: 1543,
          subcategories: [
            { id: 'fresh-fish', name: '생선류', name_en: 'Fresh Fish' },
            { id: 'dried-seafood', name: '건어물', name_en: 'Dried Seafood' },
            { id: 'canned-seafood', name: '통조림', name_en: 'Canned Seafood' },
            { id: 'seaweed', name: '김/미역', name_en: 'Seaweed' }
          ]
        },
        {
          id: 'sauces',
          name: '조미료/양념',
          name_en: 'Seasonings & Sauces',
          name_filipino: 'Seasonings at Sauces',
          icon: 'fas fa-wine-bottle',
          color: 'purple',
          product_count: 987,
          subcategories: [
            { id: 'gochujang', name: '고추장', name_en: 'Gochujang (Chili Paste)' },
            { id: 'doenjang', name: '된장', name_en: 'Doenjang (Soybean Paste)' },
            { id: 'soy-sauce', name: '간장', name_en: 'Soy Sauce' },
            { id: 'sesame-oil', name: '참기름', name_en: 'Sesame Oil' }
          ]
        },
        {
          id: 'snacks',
          name: '과자/간식',
          name_en: 'Snacks & Confectionery',
          name_filipino: 'Snacks at Confectionery',
          icon: 'fas fa-cookie',
          color: 'yellow',
          product_count: 2156,
          subcategories: [
            { id: 'chips', name: '스낵류', name_en: 'Chips & Crackers' },
            { id: 'cookies', name: '쿠키/비스킷', name_en: 'Cookies & Biscuits' },
            { id: 'candy', name: '사탕/젤리', name_en: 'Candy & Jelly' },
            { id: 'chocolate', name: '초콜릿', name_en: 'Chocolate' }
          ]
        },
        {
          id: 'beverages',
          name: '차/음료',
          name_en: 'Tea & Beverages',
          name_filipino: 'Tsaa at Inumin',
          icon: 'fas fa-coffee',
          color: 'indigo',
          product_count: 1432,
          subcategories: [
            { id: 'korean-tea', name: '한국차', name_en: 'Korean Tea' },
            { id: 'coffee', name: '커피', name_en: 'Coffee' },
            { id: 'soft-drinks', name: '음료수', name_en: 'Soft Drinks' },
            { id: 'traditional-drinks', name: '전통음료', name_en: 'Traditional Drinks' }
          ]
        },
        {
          id: 'frozen',
          name: '냉동식품',
          name_en: 'Frozen Foods',
          name_filipino: 'Frozen Foods',
          icon: 'fas fa-snowflake',
          color: 'cyan',
          product_count: 876,
          subcategories: [
            { id: 'frozen-dumplings', name: '만두류', name_en: 'Frozen Dumplings' },
            { id: 'frozen-meat', name: '냉동육류', name_en: 'Frozen Meat' },
            { id: 'frozen-vegetables', name: '냉동채소', name_en: 'Frozen Vegetables' },
            { id: 'ice-cream', name: '아이스크림', name_en: 'Ice Cream' }
          ]
        }
      ],
      total_products: 14555,
      currency: 'PHP',
      wholesale_available: true
    }
  });
});

// 인기 한국 상품 목록
router.get('/popular', (req, res) => {
  res.json({
    success: true,
    message: 'Popular Korean products retrieved',
    data: {
      products: [
        {
          id: 'kimchi-5kg',
          name: '맛있는 배추김치 5kg',
          name_en: 'Delicious Cabbage Kimchi 5kg',
          brand: 'King\'s Food',
          category: 'kimchi',
          images: [
            '/images/products/kimchi-5kg-1.jpg',
            '/images/products/kimchi-5kg-2.jpg'
          ],
          price: {
            retail: 1798,
            wholesale: 899,
            currency: 'PHP',
            formatted_retail: '₱1,798',
            formatted_wholesale: '₱899',
            discount_percent: 50
          },
          rating: {
            average: 4.8,
            count: 547
          },
          features: [
            '당일배송 가능',
            '한국산 배추 100%',
            '무료배송',
            '냉장보관 필수'
          ],
          wholesale: {
            min_quantity: 10,
            bulk_discounts: [
              { min_qty: 10, discount: 5 },
              { min_qty: 50, discount: 10 },
              { min_qty: 100, discount: 15 }
            ]
          },
          stock: {
            available: true,
            quantity: 150,
            warehouse: 'Manila'
          },
          shipping: {
            same_day: true,
            free_shipping: true,
            areas: ['Metro Manila', 'Quezon City', 'Makati']
          }
        },
        {
          id: 'shin-ramen-40pack',
          name: '농심 신라면 40개들이',
          name_en: 'Nongshim Shin Ramyun 40 Pack',
          brand: 'Nongshim',
          category: 'noodles',
          images: [
            '/images/products/shin-ramen-40-1.jpg',
            '/images/products/shin-ramen-40-2.jpg'
          ],
          price: {
            retail: 1856,
            wholesale: 1299,
            currency: 'PHP',
            formatted_retail: '₱1,856',
            formatted_wholesale: '₱1,299',
            discount_percent: 30
          },
          rating: {
            average: 4.9,
            count: 1203
          },
          features: [
            '한국 직수입 정품',
            '무료배송',
            '대용량 할인',
            '유통기한 6개월 이상'
          ],
          wholesale: {
            min_quantity: 5,
            bulk_discounts: [
              { min_qty: 5, discount: 3 },
              { min_qty: 20, discount: 7 },
              { min_qty: 50, discount: 12 }
            ]
          },
          stock: {
            available: true,
            quantity: 89,
            warehouse: 'Manila'
          },
          shipping: {
            same_day: false,
            free_shipping: true,
            areas: ['All Philippines']
          }
        },
        {
          id: 'gochujang-3kg',
          name: '순창 고추장 3kg 대용량',
          name_en: 'Sunchang Gochujang 3kg Bulk',
          brand: 'Sunchang',
          category: 'sauces',
          images: [
            '/images/products/gochujang-3kg-1.jpg',
            '/images/products/gochujang-3kg-2.jpg'
          ],
          price: {
            retail: 899,
            wholesale: 599,
            currency: 'PHP',
            formatted_retail: '₱899',
            formatted_wholesale: '₱599',
            discount_percent: 33
          },
          rating: {
            average: 4.7,
            count: 892
          },
          features: [
            '업소용 대용량',
            '도매할인 적용',
            '한국 전통 발효',
            '매운맛 조절 가능'
          ],
          wholesale: {
            min_quantity: 6,
            bulk_discounts: [
              { min_qty: 6, discount: 5 },
              { min_qty: 24, discount: 10 },
              { min_qty: 48, discount: 18 }
            ]
          },
          stock: {
            available: true,
            quantity: 234,
            warehouse: 'Manila'
          },
          shipping: {
            same_day: true,
            free_shipping: false,
            shipping_fee: 85,
            areas: ['Metro Manila', 'Cavite', 'Laguna']
          }
        }
      ],
      filters: {
        brands: ['Nongshim', 'Ottogi', 'Sunchang', 'CJ', 'King\'s Food'],
        price_ranges: [
          { min: 0, max: 500, label: 'Under ₱500' },
          { min: 500, max: 1000, label: '₱500 - ₱1,000' },
          { min: 1000, max: 2000, label: '₱1,000 - ₱2,000' },
          { min: 2000, max: null, label: 'Over ₱2,000' }
        ],
        features: [
          '당일배송',
          '무료배송',
          '도매할인',
          '한국직수입',
          '냉장/냉동',
          '대용량'
        ]
      },
      currency: 'PHP',
      timezone: 'Asia/Manila'
    }
  });
});

// 오늘의 특가 상품
router.get('/deals', (req, res) => {
  const now = new Date();
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  
  res.json({
    success: true,
    message: 'Today\'s special deals',
    data: {
      deal_info: {
        title: '🔥 오늘의 특가',
        end_time: endOfDay.toISOString(),
        remaining_hours: Math.ceil((endOfDay - now) / (1000 * 60 * 60))
      },
      products: [
        {
          id: 'deal-kimchi-1',
          name: '포기김치 10kg 업소용',
          name_en: 'Whole Cabbage Kimchi 10kg Commercial',
          original_price: 3599,
          deal_price: 1799,
          savings: 1800,
          discount_percent: 50,
          rating: 4.6,
          reviews: 234,
          features: ['50% 대폭할인', '업소용 대용량', '당일제조'],
          stock: 45,
          sold_today: 23
        },
        {
          id: 'deal-bulgogi-1',
          name: '불고기용 소고기 2kg',
          name_en: 'Bulgogi Beef 2kg Sliced',
          original_price: 4299,
          deal_price: 3199,
          savings: 1100,
          discount_percent: 26,
          rating: 4.8,
          reviews: 156,
          features: ['프리미엄 한우', '얇게 썰어서 배송', '냉장배송'],
          stock: 28,
          sold_today: 15
        },
        {
          id: 'deal-seafood-1',
          name: '김/미역 모듬세트',
          name_en: 'Seaweed Variety Set',
          original_price: 1299,
          deal_price: 799,
          savings: 500,
          discount_percent: 38,
          rating: 4.5,
          reviews: 445,
          features: ['5가지 해조류', '영양만점', '무료배송'],
          stock: 167,
          sold_today: 89
        }
      ],
      total_deals: 24,
      currency: 'PHP'
    }
  });
});

// 신상품 목록
router.get('/new-arrivals', (req, res) => {
  res.json({
    success: true,
    message: 'New Korean products',
    data: {
      new_products: [
        {
          id: 'new-tteokbokki',
          name: '떡볶이 떡 + 소스 세트',
          name_en: 'Tteokbokki Rice Cake + Sauce Set',
          brand: 'King\'s Food',
          arrival_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          price: {
            retail: 599,
            wholesale: 449,
            currency: 'PHP'
          },
          features: ['신상품', '간편 조리', '매운맛/순한맛 선택'],
          pre_order: false,
          stock: 200
        },
        {
          id: 'new-korean-pear',
          name: '한국 배 (신고배) 5kg',
          name_en: 'Korean Pear (Shingo) 5kg',
          brand: 'Fresh Import',
          arrival_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          price: {
            retail: 2499,
            wholesale: 1999,
            currency: 'PHP'
          },
          features: ['항공직송', '프리미엄', '선물용 포장'],
          pre_order: true,
          stock: 50,
          pre_order_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      arrival_schedule: [
        {
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          products: ['한국 사과', '유자차', '인삼 제품']
        },
        {
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          products: ['갈비탕 재료', '냉면 육수', '한국 막걸리']
        }
      ]
    }
  });
});

// 도매 전용 가격표
router.get('/wholesale-prices', (req, res) => {
  res.json({
    success: true,
    message: 'Wholesale pricing information',
    data: {
      wholesale_tiers: [
        {
          tier: 'bronze',
          name: '브론즈 도매',
          min_order: 50000, // PHP 50,000
          benefits: {
            discount_percent: 5,
            free_shipping: false,
            payment_terms: 'Cash on Delivery'
          }
        },
        {
          tier: 'silver',
          name: '실버 도매',
          min_order: 150000, // PHP 150,000
          benefits: {
            discount_percent: 10,
            free_shipping: true,
            payment_terms: '7 days credit'
          }
        },
        {
          tier: 'gold',
          name: '골드 도매',
          min_order: 500000, // PHP 500,000
          benefits: {
            discount_percent: 15,
            free_shipping: true,
            payment_terms: '15 days credit',
            priority_delivery: true
          }
        },
        {
          tier: 'platinum',
          name: '플래티넘 도매',
          min_order: 1000000, // PHP 1,000,000
          benefits: {
            discount_percent: 20,
            free_shipping: true,
            payment_terms: '30 days credit',
            priority_delivery: true,
            dedicated_support: true
          }
        }
      ],
      bulk_categories: [
        {
          category: 'kimchi',
          name: '김치류',
          min_quantity: 20,
          unit: '포기',
          bulk_discount: 12
        },
        {
          category: 'noodles',
          name: '라면/면류',
          min_quantity: 100,
          unit: '개',
          bulk_discount: 15
        },
        {
          category: 'sauces',
          name: '장류/양념',
          min_quantity: 50,
          unit: '개',
          bulk_discount: 18
        }
      ],
      contact_info: {
        wholesale_hotline: '+63-917-XXX-XXXX',
        email: 'wholesale@kingsfood.ph',
        business_hours: '8:00 AM - 6:00 PM (Manila Time)',
        consultation: 'Free wholesale consultation available'
      }
    }
  });
});

// 한국 식자재 검색
router.get('/search', (req, res) => {
  const { q, category, price_min, price_max, brand, sort } = req.query;
  
  res.json({
    success: true,
    message: `Search results for: ${q || 'all products'}`,
    data: {
      search_query: q,
      total_results: 1247,
      results: [
        // Mock search results based on query
        {
          id: 'search-result-1',
          name: q ? `${q} 관련 상품 1` : '인기 상품 1',
          name_en: q ? `${q} Related Product 1` : 'Popular Product 1',
          price: {
            retail: 899,
            wholesale: 699,
            currency: 'PHP'
          },
          rating: 4.3,
          reviews: 156,
          category: category || 'kimchi',
          brand: brand || 'King\'s Food',
          in_stock: true
        }
      ],
      filters_applied: {
        category,
        price_range: price_min || price_max ? { min: price_min, max: price_max } : null,
        brand,
        sort: sort || 'relevance'
      },
      suggested_searches: [
        '김치냉장고',
        '한국라면',
        '고추장',
        '된장찌개',
        '불고기양념'
      ],
      popular_brands: [
        'Nongshim', 'Ottogi', 'CJ', 'Sunchang', 'King\'s Food'
      ]
    }
  });
});

// 한국 브랜드 정보
router.get('/brands', (req, res) => {
  res.json({
    success: true,
    message: 'Korean food brands available',
    data: {
      premium_brands: [
        {
          id: 'nongshim',
          name: '농심 (Nongshim)',
          country: '한국 (Korea)',
          established: 1965,
          specialties: ['라면', '과자', '음료'],
          products_count: 245,
          description: '한국 대표 식품 브랜드, 신라면으로 유명'
        },
        {
          id: 'ottogi',
          name: '오뚜기 (Ottogi)',
          country: '한국 (Korea)',
          established: 1969,
          specialties: ['카레', '스프', '조미료'],
          products_count: 189,
          description: '한국 가정의 맛을 전 세계에 전하는 브랜드'
        },
        {
          id: 'cj',
          name: 'CJ 제일제당',
          country: '한국 (Korea)',
          established: 1953,
          specialties: ['햇반', '비비고', '냉동식품'],
          products_count: 312,
          description: 'K-Food 글로벌 리더, 비비고 브랜드 운영'
        }
      ],
      local_brands: [
        {
          id: 'kings-food',
          name: 'King\'s Food',
          country: '필리핀 (Philippines)',
          established: 2018,
          specialties: ['직수입 한국식품', '도매 유통'],
          products_count: 1567,
          description: '필리핀 최대 한국 식자재 도매 전문업체'
        }
      ]
    }
  });
});

module.exports = router;