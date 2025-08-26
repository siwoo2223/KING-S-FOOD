/**
 * 상품 이미지 스크래핑 및 처리 API
 * 외부 웹사이트에서 한국 식품 이미지를 검색하고 수집
 */

const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const logger = require('../../utils/logger');

const router = express.Router();

/**
 * 한국 식품 이미지 소스 웹사이트 목록
 */
const IMAGE_SOURCES = [
  {
    name: 'Korean Grocery Store',
    searchUrl: 'https://www.google.com/search?q={query}+korean+food&tbm=isch',
    selector: 'img[src*="googleusercontent"]'
  },
  {
    name: 'Coupang Search',
    searchUrl: 'https://www.coupang.com/np/search?q={query}',
    selector: 'img.search-product-wrap-img'
  }
];

/**
 * 상품명을 기반으로 검색 쿼리 생성
 * @param {string} productName 상품명
 * @returns {string} 검색 쿼리
 */
function generateSearchQuery(productName) {
  // 한글 상품명을 영어 키워드로 변환
  const koreanToEnglish = {
    '김치': 'kimchi',
    '라면': 'ramen noodles',
    '고추장': 'gochujang korean chili paste',
    '된장': 'doenjang korean soybean paste',
    '간장': 'soy sauce',
    '참기름': 'sesame oil',
    '고춧가루': 'korean red pepper flakes gochugaru',
    '미역': 'seaweed',
    '떡': 'korean rice cake tteok',
    '만두': 'korean dumpling mandu',
    '순두부': 'soft tofu',
    '청국장': 'cheonggukjang',
    '멸치': 'dried anchovies',
    '다시마': 'kelp kombu',
    '새우젓': 'salted shrimp jeotgal',
    '막걸리': 'makgeolli rice wine',
    '소주': 'soju korean alcohol',
    '녹차': 'korean green tea',
    '유자차': 'yuzu tea',
    '홍삼': 'korean red ginseng',
    '과자': 'korean snack',
    '쿠키': 'korean cookie',
    '사탕': 'korean candy',
    '초콜릿': 'korean chocolate'
  };
  
  let searchQuery = productName;
  
  // 한글 키워드를 영어로 변환
  Object.keys(koreanToEnglish).forEach(korean => {
    if (productName.includes(korean)) {
      searchQuery = koreanToEnglish[korean];
    }
  });
  
  // 브랜드명 추가
  const brandKeywords = ['nongshim', 'ottogi', 'cj', 'sempio', 'jinro', 'lotte'];
  const lowerProductName = productName.toLowerCase();
  
  brandKeywords.forEach(brand => {
    if (lowerProductName.includes(brand)) {
      searchQuery += ` ${brand}`;
    }
  });
  
  return `${searchQuery} korean food product`;
}

/**
 * Placeholder 이미지 URL 생성
 * @param {string} productName 상품명
 * @param {string} category 카테고리
 * @returns {string} 이미지 URL
 */
function generatePlaceholderImage(productName, category = 'food') {
  // 카테고리별 색상 매핑
  const categoryColors = {
    'kimchi': 'FF6B6B',      // 빨강 (김치)
    'noodles': 'FFE66D',     // 노랑 (면류)
    'sauces': 'A8E6CF',      // 초록 (소스류)
    'snacks': 'FFB4E6',      // 분홍 (과자류)
    'beverages': '87CEEB',   // 하늘색 (음료)
    'frozen': 'DDA0DD',      // 보라 (냉동식품)
    'vegetables': '90EE90',  // 연두 (채소)
    'seafood': '20B2AA',     // 청록 (해산물)
    'others': 'D3D3D3'       // 회색 (기타)
  };
  
  const color = categoryColors[category] || categoryColors['others'];
  const encodedName = encodeURIComponent(productName.substring(0, 20));
  
  // Placeholder.com API 사용
  return `https://via.placeholder.com/300x300/${color}/FFFFFF?text=${encodedName}`;
}

/**
 * 실제 이미지 검색 (시뮬레이션)
 * @param {string} productName 상품명
 * @param {string} category 카테고리
 * @returns {Promise<string[]>} 이미지 URL 배열
 */
async function searchProductImages(productName, category) {
  // 실제 환경에서는 웹 스크래핑이나 이미지 검색 API 사용
  // 여기서는 한국 식품 관련 샘플 이미지 URL 반환
  const sampleImages = {
    'kimchi': [
      'https://images.unsplash.com/photo-1555980463-9c4e1d7acaba?w=300',
      'https://images.unsplash.com/photo-1583706007542-97bd52ad9778?w=300'
    ],
    'noodles': [
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300',
      'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=300'
    ],
    'sauces': [
      'https://images.unsplash.com/photo-1594756202469-6799c78a26d8?w=300',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300'
    ],
    'snacks': [
      'https://images.unsplash.com/photo-1582449296554-f903b493c3ce?w=300',
      'https://images.unsplash.com/photo-1560963689-b5682b6447cc?w=300'
    ],
    'beverages': [
      'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300',
      'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300'
    ],
    'frozen': [
      'https://images.unsplash.com/photo-1496412705862-e0088f16f791?w=300',
      'https://images.unsplash.com/photo-1563611841-661c7d93329c?w=300'
    ]
  };
  
  // 카테고리에 해당하는 이미지가 있으면 랜덤 선택
  if (sampleImages[category]) {
    return sampleImages[category];
  }
  
  // 기본 이미지 반환
  return [generatePlaceholderImage(productName, category)];
}

/**
 * POST /api/images/search
 * 상품 이미지 검색
 */
router.post('/search', async (req, res) => {
  try {
    const { products } = req.body;
    
    if (!products || !Array.isArray(products)) {
      return res.status(400).json({
        success: false,
        message: '상품 목록이 필요합니다'
      });
    }
    
    logger.info(`Searching images for ${products.length} products`);
    
    const results = await Promise.all(
      products.map(async (product) => {
        try {
          const searchQuery = generateSearchQuery(product.name);
          const images = await searchProductImages(product.name, product.category);
          
          return {
            productId: product.id,
            productName: product.name,
            category: product.category,
            searchQuery,
            images: images.slice(0, 3), // 최대 3개 이미지
            primaryImage: images[0] || generatePlaceholderImage(product.name, product.category)
          };
        } catch (error) {
          logger.error(`Image search error for product ${product.name}:`, error);
          return {
            productId: product.id,
            productName: product.name,
            category: product.category,
            images: [generatePlaceholderImage(product.name, product.category)],
            primaryImage: generatePlaceholderImage(product.name, product.category),
            error: error.message
          };
        }
      })
    );
    
    // 결과를 JSON 파일로 저장
    const dataDir = path.join(process.cwd(), 'src', 'data');
    await fs.mkdir(dataDir, { recursive: true });
    
    const outputPath = path.join(dataDir, 'product_images.json');
    await fs.writeFile(outputPath, JSON.stringify(results, null, 2));
    
    res.json({
      success: true,
      message: `${results.length}개 상품의 이미지 검색이 완료되었습니다`,
      data: {
        total: results.length,
        successful: results.filter(r => !r.error).length,
        failed: results.filter(r => r.error).length,
        results: results.slice(0, 5) // 처음 5개 결과 미리보기
      }
    });
    
  } catch (error) {
    logger.error('Image search API error:', error);
    res.status(500).json({
      success: false,
      message: '이미지 검색 중 오류가 발생했습니다',
      error: error.message
    });
  }
});

/**
 * POST /api/images/enhance-inventory
 * 재고 데이터에 이미지 정보 추가
 */
router.post('/enhance-inventory', async (req, res) => {
  try {
    const inventoryPath = path.join(process.cwd(), 'src', 'data', 'processed_inventory.json');
    const imagesPath = path.join(process.cwd(), 'src', 'data', 'product_images.json');
    
    // 재고 데이터 로드
    let inventory;
    try {
      const inventoryData = await fs.readFile(inventoryPath, 'utf8');
      inventory = JSON.parse(inventoryData);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: '처리된 재고 데이터를 찾을 수 없습니다. 먼저 Excel 파일을 업로드해주세요.'
      });
    }
    
    // 이미지 데이터 로드 (없으면 검색 수행)
    let imageData;
    try {
      const imagesDataRaw = await fs.readFile(imagesPath, 'utf8');
      imageData = JSON.parse(imagesDataRaw);
    } catch (error) {
      // 이미지 데이터가 없으면 새로 검색
      logger.info('No existing image data found, performing new search...');
      
      const searchResults = await Promise.all(
        inventory.map(async (product) => {
          const images = await searchProductImages(product.name, product.category);
          return {
            productId: product.id,
            productName: product.name,
            category: product.category,
            images: images.slice(0, 3),
            primaryImage: images[0] || generatePlaceholderImage(product.name, product.category)
          };
        })
      );
      
      imageData = searchResults;
      await fs.writeFile(imagesPath, JSON.stringify(imageData, null, 2));
    }
    
    // 재고 데이터와 이미지 데이터 결합
    const enhancedInventory = inventory.map(product => {
      const imageInfo = imageData.find(img => 
        img.productId === product.id || 
        img.productName === product.name
      );
      
      return {
        ...product,
        images: imageInfo ? imageInfo.images : [generatePlaceholderImage(product.name, product.category)],
        primaryImage: imageInfo ? imageInfo.primaryImage : generatePlaceholderImage(product.name, product.category)
      };
    });
    
    // 결합된 데이터 저장
    const enhancedPath = path.join(process.cwd(), 'src', 'data', 'enhanced_inventory.json');
    await fs.writeFile(enhancedPath, JSON.stringify(enhancedInventory, null, 2));
    
    res.json({
      success: true,
      message: `${enhancedInventory.length}개 상품에 이미지가 추가되었습니다`,
      data: {
        total: enhancedInventory.length,
        withImages: enhancedInventory.filter(p => p.images && p.images.length > 0).length,
        preview: enhancedInventory.slice(0, 3)
      }
    });
    
  } catch (error) {
    logger.error('Inventory enhancement error:', error);
    res.status(500).json({
      success: false,
      message: '재고 데이터 개선 중 오류가 발생했습니다',
      error: error.message
    });
  }
});

/**
 * GET /api/images/sample-categories
 * 카테고리별 샘플 이미지 생성
 */
router.get('/sample-categories', async (req, res) => {
  try {
    const categories = [
      'kimchi', 'noodles', 'sauces', 'snacks', 
      'beverages', 'frozen', 'vegetables', 'seafood'
    ];
    
    const sampleData = categories.map(category => ({
      category,
      sampleProducts: [
        `${category} product 1`,
        `${category} product 2`,
        `${category} product 3`
      ].map((name, index) => ({
        name,
        image: generatePlaceholderImage(name, category),
        id: `${category}_${index + 1}`
      }))
    }));
    
    res.json({
      success: true,
      data: sampleData
    });
    
  } catch (error) {
    logger.error('Sample categories error:', error);
    res.status(500).json({
      success: false,
      message: '샘플 카테고리 생성 중 오류가 발생했습니다'
    });
  }
});

module.exports = router;