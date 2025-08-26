/**
 * 재고 파일 업로드 및 처리 API
 * Excel 파일을 업로드하여 상품 데이터로 변환
 */

const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs').promises;
const logger = require('../../utils/logger');

const router = express.Router();

// 파일 업로드 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'inventory-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Excel 파일만 업로드 가능합니다 (.xlsx, .xls)'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB 제한
  }
});

/**
 * Excel 파일에서 상품 데이터 추출
 * @param {string} filePath - Excel 파일 경로
 * @returns {Promise<Array>} 상품 데이터 배열
 */
async function processExcelFile(filePath) {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet);

    logger.info(`Processing ${rawData.length} rows from Excel file`);

    const products = rawData.map((row, index) => {
      // Excel 컬럼명을 표준화
      const normalizedRow = {};
      Object.keys(row).forEach(key => {
        const normalizedKey = key.toLowerCase().trim();
        normalizedRow[normalizedKey] = row[key];
      });

      // 상품 데이터 매핑 (다양한 컬럼명 대응)
      const product = {
        id: index + 1,
        name: normalizedRow['상품명'] || normalizedRow['제품명'] || normalizedRow['product'] || normalizedRow['name'] || `상품 ${index + 1}`,
        nameEn: normalizedRow['영문명'] || normalizedRow['english'] || null,
        brand: normalizedRow['브랜드'] || normalizedRow['brand'] || '기타',
        category: categorizeProduct(normalizedRow['카테고리'] || normalizedRow['category'] || normalizedRow['상품명'] || '기타'),
        description: normalizedRow['설명'] || normalizedRow['description'] || '',
        unit: normalizedRow['단위'] || normalizedRow['unit'] || 'EA',
        weight: parseFloat(normalizedRow['중량'] || normalizedRow['weight'] || 0),
        retailPrice: parseFloat(normalizedRow['소매가'] || normalizedRow['retail'] || normalizedRow['price'] || 0),
        wholesalePrice: parseFloat(normalizedRow['도매가'] || normalizedRow['wholesale'] || 0),
        stock: parseInt(normalizedRow['재고'] || normalizedRow['stock'] || normalizedRow['quantity'] || 0),
        minOrder: parseInt(normalizedRow['최소주문'] || normalizedRow['min'] || 1),
        origin: normalizedRow['원산지'] || normalizedRow['origin'] || '한국',
        expiry: normalizedRow['유통기한'] || normalizedRow['expiry'] || null,
        barcode: normalizedRow['바코드'] || normalizedRow['barcode'] || null,
        supplier: normalizedRow['공급업체'] || normalizedRow['supplier'] || 'King\'s Food',
        status: (normalizedRow['재고'] || 0) > 0 ? 'available' : 'out_of_stock',
        tags: extractTags(normalizedRow),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // 도매가가 없으면 소매가 기준으로 계산
      if (!product.wholesalePrice && product.retailPrice) {
        product.wholesalePrice = Math.round(product.retailPrice * 0.8);
      }

      return product;
    });

    logger.info(`Successfully processed ${products.length} products`);
    return products;
  } catch (error) {
    logger.error('Excel 파일 처리 중 오류:', error);
    throw new Error('Excel 파일 처리에 실패했습니다');
  }
}

/**
 * 상품명을 기반으로 카테고리 분류
 */
function categorizeProduct(productName) {
  const name = (productName || '').toLowerCase();
  
  if (name.includes('김치') || name.includes('kimchi')) return 'kimchi';
  if (name.includes('라면') || name.includes('면') || name.includes('noodle') || name.includes('ramen')) return 'noodles';
  if (name.includes('고추장') || name.includes('된장') || name.includes('간장') || name.includes('sauce') || name.includes('paste')) return 'sauces';
  if (name.includes('과자') || name.includes('스낵') || name.includes('snack') || name.includes('cookie')) return 'snacks';
  if (name.includes('음료') || name.includes('차') || name.includes('drink') || name.includes('beverage')) return 'beverages';
  if (name.includes('냉동') || name.includes('만두') || name.includes('frozen')) return 'frozen';
  if (name.includes('채소') || name.includes('야채') || name.includes('vegetable')) return 'vegetables';
  if (name.includes('해산물') || name.includes('생선') || name.includes('seafood')) return 'seafood';
  
  return 'others';
}

/**
 * 상품 태그 추출
 */
function extractTags(row) {
  const tags = [];
  const name = (row['상품명'] || row['name'] || '').toLowerCase();
  
  if (name.includes('유기농') || name.includes('organic')) tags.push('organic');
  if (name.includes('무첨가') || name.includes('natural')) tags.push('natural');
  if (name.includes('매운') || name.includes('spicy')) tags.push('spicy');
  if (name.includes('달콤') || name.includes('sweet')) tags.push('sweet');
  if (name.includes('할랄') || name.includes('halal')) tags.push('halal');
  
  return tags;
}

/**
 * POST /api/inventory/upload
 * Excel 재고 파일 업로드 및 처리
 */
router.post('/upload', upload.single('inventory'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Excel 파일을 업로드해주세요'
      });
    }

    logger.info(`Excel file uploaded: ${req.file.filename}`);
    
    // uploads 디렉토리 생성
    const uploadsDir = path.join(process.cwd(), 'uploads');
    try {
      await fs.mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // 디렉토리가 이미 존재하는 경우 무시
    }

    // Excel 파일 처리
    const products = await processExcelFile(req.file.path);
    
    // 처리된 데이터를 JSON 파일로 저장
    const dataDir = path.join(process.cwd(), 'src', 'data');
    await fs.mkdir(dataDir, { recursive: true });
    
    const outputPath = path.join(dataDir, 'processed_inventory.json');
    await fs.writeFile(outputPath, JSON.stringify(products, null, 2));

    // 업로드된 Excel 파일 삭제 (선택사항)
    await fs.unlink(req.file.path);

    res.json({
      success: true,
      message: `${products.length}개 상품이 성공적으로 처리되었습니다`,
      data: {
        total: products.length,
        categories: [...new Set(products.map(p => p.category))],
        brands: [...new Set(products.map(p => p.brand))],
        preview: products.slice(0, 5) // 처음 5개 상품 미리보기
      }
    });

  } catch (error) {
    logger.error('Inventory upload error:', error);
    
    // 업로드된 파일이 있다면 삭제
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        logger.error('File cleanup error:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: error.message || '재고 파일 처리 중 오류가 발생했습니다'
    });
  }
});

/**
 * GET /api/inventory/status
 * 처리된 재고 데이터 상태 확인
 */
router.get('/status', async (req, res) => {
  try {
    const dataPath = path.join(process.cwd(), 'src', 'data', 'processed_inventory.json');
    
    try {
      await fs.access(dataPath);
      const data = await fs.readFile(dataPath, 'utf8');
      const products = JSON.parse(data);
      
      const stats = {
        total: products.length,
        inStock: products.filter(p => p.status === 'available').length,
        outOfStock: products.filter(p => p.status === 'out_of_stock').length,
        categories: [...new Set(products.map(p => p.category))].length,
        brands: [...new Set(products.map(p => p.brand))].length,
        lastUpdated: new Date(Math.max(...products.map(p => new Date(p.updatedAt)))).toISOString()
      };
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.json({
        success: true,
        data: {
          total: 0,
          message: '아직 처리된 재고 데이터가 없습니다'
        }
      });
    }
  } catch (error) {
    logger.error('Inventory status check error:', error);
    res.status(500).json({
      success: false,
      message: '재고 상태 확인 중 오류가 발생했습니다'
    });
  }
});

module.exports = router;