/**
 * 박스 단위 상품 API 라우트
 * 모든 상품은 박스 단위로만 판매
 */

const express = require('express');
const BoxProduct = require('../../models/BoxProduct');
const logger = require('../../utils/logger');

const router = express.Router();

/**
 * GET /api/box-products
 * 박스 상품 목록 조회 (필터링, 페이지네이션 지원)
 */
router.get('/', async (req, res) => {
  try {
    const {
      category,
      brand,
      priceMin,
      priceMax,
      inStock = true,
      sort = 'name',
      order = 'asc',
      page = 1,
      limit = 20,
      search
    } = req.query;
    
    // 쿼리 구성
    const query = { status: { $in: ['active'] } };
    
    if (category) query.category = category;
    if (brand) query.brand = new RegExp(brand, 'i');
    if (inStock === 'true') {
      query['inventory.totalBoxes'] = { $gt: 0 };
      query.$expr = { $gt: ['$inventory.totalBoxes', '$inventory.reservedBoxes'] };
    }
    
    if (priceMin || priceMax) {
      query['pricing.basePrice'] = {};
      if (priceMin) query['pricing.basePrice'].$gte = parseFloat(priceMin);
      if (priceMax) query['pricing.basePrice'].$lte = parseFloat(priceMax);
    }
    
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { nameEn: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { 'specifications.ingredients': new RegExp(search, 'i') }
      ];
    }
    
    // 정렬 옵션
    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;
    
    // 페이지네이션
    const skip = (page - 1) * limit;
    
    // 데이터 조회
    const [products, total] = await Promise.all([
      BoxProduct.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      BoxProduct.countDocuments(query)
    ]);
    
    // 응답 데이터 포맷팅
    const formattedProducts = products.map(product => {
      const availableBoxes = product.inventory.totalBoxes - product.inventory.reservedBoxes;
      const samplePricing = BoxProduct.prototype.calculatePrice.call(product, 1);
      
      return {
        id: product.productId,
        name: product.name,
        nameEn: product.nameEn,
        description: product.description,
        category: product.category,
        brand: product.brand,
        images: product.images || [],
        primaryImage: product.images?.find(img => img.isPrimary)?.url || 
                     (product.images?.[0]?.url) || 
                     `/api/placeholder/300x300?text=${encodeURIComponent(product.name)}`,
        
        // 박스 정보
        boxInfo: {
          itemsPerBox: product.boxInfo.itemsPerBox,
          unitType: product.boxInfo.unitType,
          weight: product.boxInfo.boxWeight,
          description: `${product.boxInfo.itemsPerBox}${product.boxInfo.unitType === 'piece' ? '개' : product.boxInfo.unitType} / 박스`
        },
        
        // 가격 정보
        pricing: {
          basePrice: product.pricing.basePrice,
          formattedPrice: `₱${product.pricing.basePrice.toLocaleString()}`,
          currency: product.pricing.currency,
          bulkDiscounts: product.pricing.bulkDiscounts.map(discount => ({
            minBoxes: discount.minBoxes,
            discountPercent: discount.discountPercent,
            description: `${discount.minBoxes}박스+ ${discount.discountPercent}% 할인`
          })),
          wholesalePrice: product.pricing.wholesalePrice,
          hasWholesalePrice: !!product.pricing.wholesalePrice
        },
        
        // 재고 정보
        inventory: {
          availableBoxes,
          isInStock: availableBoxes > 0,
          isLowStock: availableBoxes <= product.inventory.minStockAlert,
          stockLevel: availableBoxes > product.inventory.minStockAlert ? 'high' : 
                     availableBoxes > 0 ? 'low' : 'out',
          warehouse: product.inventory.warehouse
        },
        
        // 주문 정보
        orderLimits: product.orderLimits,
        
        // 배송 정보
        shipping: {
          refrigerated: product.shipping.refrigerated,
          frozen: product.shipping.frozen,
          shippingFeePerBox: product.shipping.shippingFeePerBox,
          specialHandling: product.shipping.refrigerated || product.shipping.frozen || product.shipping.fragile
        },
        
        // 통계
        stats: {
          averageRating: product.stats.averageRating,
          reviewCount: product.stats.reviewCount,
          totalSold: product.stats.totalSold,
          isPopular: product.stats.totalSold > 100
        },
        
        // 추가 정보
        specifications: product.specifications,
        
        // UI 표시용
        badges: generateProductBadges(product, availableBoxes),
        
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      };
    });
    
    // 필터 옵션 (사이드바용)
    const [categories, brands, priceRange] = await Promise.all([
      BoxProduct.distinct('category', { status: 'active' }),
      BoxProduct.distinct('brand', { status: 'active' }),
      BoxProduct.aggregate([
        { $match: { status: 'active' } },
        {
          $group: {
            _id: null,
            minPrice: { $min: '$pricing.basePrice' },
            maxPrice: { $max: '$pricing.basePrice' }
          }
        }
      ])
    ]);
    
    res.json({
      success: true,
      data: {
        products: formattedProducts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: skip + formattedProducts.length < total,
          hasPrev: page > 1
        },
        filters: {
          categories: categories.map(cat => ({
            value: cat,
            label: getCategoryLabel(cat),
            icon: getCategoryIcon(cat)
          })),
          brands,
          priceRange: priceRange[0] || { minPrice: 0, maxPrice: 10000 }
        },
        summary: {
          totalProducts: total,
          inStockProducts: formattedProducts.filter(p => p.inventory.isInStock).length,
          averagePrice: Math.round(formattedProducts.reduce((sum, p) => sum + p.pricing.basePrice, 0) / formattedProducts.length)
        }
      }
    });
    
  } catch (error) {
    logger.error('Box products query error:', error);
    res.status(500).json({
      success: false,
      message: '상품 목록 조회 중 오류가 발생했습니다',
      error: error.message
    });
  }
});

/**
 * GET /api/box-products/:productId
 * 특정 박스 상품 상세 정보
 */
router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { customerType = 'retail' } = req.query;
    
    const product = await BoxProduct.findOne({ 
      productId, 
      status: { $in: ['active', 'out_of_stock'] } 
    });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다'
      });
    }
    
    // 조회수 증가
    product.stats.viewCount += 1;
    await product.save();
    
    const availableBoxes = product.inventory.totalBoxes - product.inventory.reservedBoxes;
    
    // 다양한 수량별 가격 계산
    const pricingTiers = [1, 5, 10, 20, 50].map(quantity => {
      if (quantity <= availableBoxes) {
        const pricing = product.calculatePrice(quantity, customerType);
        return {
          quantity,
          ...pricing,
          nextDiscount: product.getNextDiscountInfo(quantity)
        };
      }
      return null;
    }).filter(Boolean);
    
    const formattedProduct = {
      id: product.productId,
      name: product.name,
      nameEn: product.nameEn,
      description: product.description,
      category: product.category,
      brand: product.brand,
      images: product.images || [],
      
      // 박스 상세 정보
      boxInfo: {
        itemsPerBox: product.boxInfo.itemsPerBox,
        unitType: product.boxInfo.unitType,
        weight: product.boxInfo.boxWeight,
        dimensions: product.boxInfo.boxDimensions,
        description: `${product.boxInfo.itemsPerBox}${getUnitLabel(product.boxInfo.unitType)} / 박스`,
        weightDescription: product.boxInfo.boxWeight ? `${product.boxInfo.boxWeight}kg / 박스` : null
      },
      
      // 가격 정보
      pricing: {
        basePrice: product.pricing.basePrice,
        wholesalePrice: product.pricing.wholesalePrice,
        currency: product.pricing.currency,
        bulkDiscounts: product.pricing.bulkDiscounts,
        tiers: pricingTiers,
        customerType
      },
      
      // 재고 정보
      inventory: {
        totalBoxes: product.inventory.totalBoxes,
        availableBoxes,
        reservedBoxes: product.inventory.reservedBoxes,
        isInStock: availableBoxes > 0,
        isLowStock: availableBoxes <= product.inventory.minStockAlert,
        minStockAlert: product.inventory.minStockAlert,
        warehouse: product.inventory.warehouse,
        stockStatus: getStockStatus(availableBoxes, product.inventory.minStockAlert)
      },
      
      // 주문 제한
      orderLimits: product.orderLimits,
      
      // 배송 정보
      shipping: product.shipping,
      
      // 상품 상세 정보
      specifications: product.specifications,
      
      // 통계 및 리뷰
      stats: product.stats,
      
      // SEO
      seo: product.seo,
      
      // 관련 정보
      badges: generateProductBadges(product, availableBoxes),
      recommendations: await getRecommendations(product),
      
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };
    
    res.json({
      success: true,
      data: formattedProduct
    });
    
  } catch (error) {
    logger.error('Box product detail error:', error);
    res.status(500).json({
      success: false,
      message: '상품 정보 조회 중 오류가 발생했습니다',
      error: error.message
    });
  }
});

/**
 * POST /api/box-products/:productId/calculate-price
 * 수량별 가격 계산
 */
router.post('/:productId/calculate-price', async (req, res) => {
  try {
    const { productId } = req.params;
    const { boxQuantity, customerType = 'retail' } = req.body;
    
    if (!boxQuantity || boxQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: '올바른 수량을 입력해주세요'
      });
    }
    
    const product = await BoxProduct.findOne({ productId, status: 'active' });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다'
      });
    }
    
    // 재고 확인
    const availability = product.checkAvailability(boxQuantity);
    
    if (!availability.isAvailable) {
      return res.status(400).json({
        success: false,
        message: '재고가 부족합니다',
        data: availability
      });
    }
    
    // 가격 계산
    const pricing = product.calculatePrice(boxQuantity, customerType);
    const nextDiscount = product.getNextDiscountInfo(boxQuantity);
    
    // 배송비 계산
    const shippingFee = calculateShippingFee(product, boxQuantity);
    const grandTotal = pricing.totalPrice + shippingFee.totalFee;
    
    res.json({
      success: true,
      data: {
        product: {
          id: product.productId,
          name: product.name,
          boxInfo: product.boxInfo
        },
        pricing,
        availability,
        shipping: shippingFee,
        totals: {
          subtotal: pricing.totalPrice,
          shippingFee: shippingFee.totalFee,
          grandTotal,
          formattedGrandTotal: `₱${grandTotal.toLocaleString()}`
        },
        nextDiscount,
        customerType
      }
    });
    
  } catch (error) {
    logger.error('Price calculation error:', error);
    res.status(500).json({
      success: false,
      message: '가격 계산 중 오류가 발생했습니다',
      error: error.message
    });
  }
});

/**
 * POST /api/box-products/:productId/check-availability
 * 재고 확인
 */
router.post('/:productId/check-availability', async (req, res) => {
  try {
    const { productId } = req.params;
    const { boxQuantity } = req.body;
    
    const product = await BoxProduct.findOne({ productId, status: 'active' });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다'
      });
    }
    
    const availability = product.checkAvailability(boxQuantity);
    
    res.json({
      success: true,
      data: {
        product: {
          id: product.productId,
          name: product.name
        },
        availability: {
          ...availability,
          stockStatus: getStockStatus(availability.availableBoxes, product.inventory.minStockAlert),
          estimatedRestockDate: availability.isAvailable ? null : getEstimatedRestockDate()
        }
      }
    });
    
  } catch (error) {
    logger.error('Availability check error:', error);
    res.status(500).json({
      success: false,
      message: '재고 확인 중 오류가 발생했습니다',
      error: error.message
    });
  }
});

/**
 * GET /api/box-products/categories/summary
 * 카테고리별 상품 요약
 */
router.get('/categories/summary', async (req, res) => {
  try {
    const categorySummary = await BoxProduct.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$category',
          totalProducts: { $sum: 1 },
          inStockProducts: {
            $sum: {
              $cond: [
                { $gt: [{ $subtract: ['$inventory.totalBoxes', '$inventory.reservedBoxes'] }, 0] },
                1,
                0
              ]
            }
          },
          averagePrice: { $avg: '$pricing.basePrice' },
          minPrice: { $min: '$pricing.basePrice' },
          maxPrice: { $max: '$pricing.basePrice' },
          totalBoxesAvailable: {
            $sum: { $subtract: ['$inventory.totalBoxes', '$inventory.reservedBoxes'] }
          }
        }
      },
      { $sort: { totalProducts: -1 } }
    ]);
    
    const formattedSummary = categorySummary.map(cat => ({
      category: cat._id,
      label: getCategoryLabel(cat._id),
      icon: getCategoryIcon(cat._id),
      totalProducts: cat.totalProducts,
      inStockProducts: cat.inStockProducts,
      outOfStockProducts: cat.totalProducts - cat.inStockProducts,
      averagePrice: Math.round(cat.averagePrice),
      priceRange: {
        min: cat.minPrice,
        max: cat.maxPrice,
        formatted: `₱${cat.minPrice.toLocaleString()} - ₱${cat.maxPrice.toLocaleString()}`
      },
      totalBoxesAvailable: cat.totalBoxesAvailable,
      stockHealthPercent: Math.round((cat.inStockProducts / cat.totalProducts) * 100)
    }));
    
    res.json({
      success: true,
      data: {
        categories: formattedSummary,
        overall: {
          totalCategories: formattedSummary.length,
          totalProducts: formattedSummary.reduce((sum, cat) => sum + cat.totalProducts, 0),
          totalInStock: formattedSummary.reduce((sum, cat) => sum + cat.inStockProducts, 0),
          averageStockHealth: Math.round(
            formattedSummary.reduce((sum, cat) => sum + cat.stockHealthPercent, 0) / formattedSummary.length
          )
        }
      }
    });
    
  } catch (error) {
    logger.error('Category summary error:', error);
    res.status(500).json({
      success: false,
      message: '카테고리 요약 조회 중 오류가 발생했습니다',
      error: error.message
    });
  }
});

// 헬퍼 함수들
function getCategoryLabel(category) {
  const labels = {
    kimchi: '김치/젓갈',
    noodles: '라면/면류',
    sauces: '장류/양념',
    snacks: '과자/간식',
    beverages: '음료/차',
    frozen: '냉동식품',
    vegetables: '채소/나물',
    seafood: '해산물',
    others: '기타'
  };
  return labels[category] || category;
}

function getCategoryIcon(category) {
  const icons = {
    kimchi: 'fas fa-pepper-hot',
    noodles: 'fas fa-bowl-food',
    sauces: 'fas fa-jar',
    snacks: 'fas fa-cookie',
    beverages: 'fas fa-mug-hot',
    frozen: 'fas fa-snowflake',
    vegetables: 'fas fa-leaf',
    seafood: 'fas fa-fish',
    others: 'fas fa-box'
  };
  return icons[category] || 'fas fa-box';
}

function getUnitLabel(unitType) {
  const labels = {
    piece: '개',
    kg: 'kg',
    liter: 'L',
    pack: '팩'
  };
  return labels[unitType] || unitType;
}

function getStockStatus(availableBoxes, minAlert) {
  if (availableBoxes === 0) return { status: 'out', label: '품절', color: 'red' };
  if (availableBoxes <= minAlert) return { status: 'low', label: '재고 부족', color: 'yellow' };
  return { status: 'good', label: '재고 충분', color: 'green' };
}

function generateProductBadges(product, availableBoxes) {
  const badges = [];
  
  if (product.stats.totalSold > 100) badges.push({ text: 'BEST', color: 'red' });
  if (product.pricing.bulkDiscounts?.length > 0) badges.push({ text: '대량할인', color: 'blue' });
  if (product.shipping.refrigerated) badges.push({ text: '냉장', color: 'cyan' });
  if (product.shipping.frozen) badges.push({ text: '냉동', color: 'purple' });
  if (availableBoxes <= product.inventory.minStockAlert && availableBoxes > 0) {
    badges.push({ text: '재고부족', color: 'orange' });
  }
  if (product.specifications?.certifications?.includes('halal')) {
    badges.push({ text: 'HALAL', color: 'green' });
  }
  
  return badges;
}

function calculateShippingFee(product, boxQuantity) {
  const baseShippingPerBox = product.shipping.shippingFeePerBox || 50; // 기본 박스당 ₱50
  let totalFee = baseShippingPerBox * boxQuantity;
  
  // 특수 처리 추가 요금
  if (product.shipping.refrigerated) totalFee += boxQuantity * 20;
  if (product.shipping.frozen) totalFee += boxQuantity * 30;
  if (product.shipping.fragile) totalFee += boxQuantity * 10;
  
  // 무료 배송 임계값 확인 (₱50,000 이상)
  const subtotal = product.pricing.basePrice * boxQuantity;
  const isFreeShipping = subtotal >= 50000;
  
  return {
    baseShippingPerBox,
    boxQuantity,
    baseFee: baseShippingPerBox * boxQuantity,
    additionalFees: totalFee - (baseShippingPerBox * boxQuantity),
    totalFee: isFreeShipping ? 0 : totalFee,
    isFreeShipping,
    freeShippingThreshold: 50000,
    amountForFreeShipping: Math.max(0, 50000 - subtotal)
  };
}

async function getRecommendations(product) {
  // 같은 카테고리의 다른 상품 추천
  const recommendations = await BoxProduct.find({
    category: product.category,
    productId: { $ne: product.productId },
    status: 'active',
    'inventory.totalBoxes': { $gt: 0 }
  })
  .limit(4)
  .select('productId name pricing.basePrice images stats.averageRating')
  .lean();
  
  return recommendations.map(rec => ({
    id: rec.productId,
    name: rec.name,
    price: rec.pricing.basePrice,
    formattedPrice: `₱${rec.pricing.basePrice.toLocaleString()}`,
    image: rec.images?.[0]?.url || `/api/placeholder/150x150?text=${encodeURIComponent(rec.name)}`,
    rating: rec.stats.averageRating
  }));
}

function getEstimatedRestockDate() {
  const restockDate = new Date();
  restockDate.setDate(restockDate.getDate() + 7); // 7일 후 재입고 예정
  return restockDate.toLocaleDateString('ko-KR');
}

module.exports = router;