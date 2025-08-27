/**
 * MongoDB 데이터베이스 연결 설정
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDatabase = async () => {
  try {
    // MongoDB 연결 옵션
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // 커넥션 풀 크기
      serverSelectionTimeoutMS: 5000, // 서버 선택 타임아웃
      socketTimeoutMS: 45000, // 소켓 타임아웃
      family: 4, // IPv4 사용
    };
    
    // MongoDB URI (환경변수에서 읽기, 없으면 기본값)
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kings_food_ph';
    
    // 연결 시도
    await mongoose.connect(mongoUri, options);
    
    logger.info(`🍃 MongoDB Connected: ${mongoose.connection.host}`);
    logger.info(`📊 Database: ${mongoose.connection.name}`);
    
    // 연결 이벤트 리스너
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });
    
    // 프로세스 종료 시 연결 해제
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (error) {
        logger.error('Error closing MongoDB connection:', error);
        process.exit(1);
      }
    });
    
  } catch (error) {
    logger.error('Database connection failed:', error);
    
    // 개발 환경에서는 메모리 DB 시뮬레이션 사용
    if (process.env.NODE_ENV === 'development') {
      logger.info('🔧 Using development mode - some features may use mock data');
      return;
    }
    
    // 프로덕션 환경에서는 종료
    process.exit(1);
  }
};

// 데이터베이스 상태 확인
const checkDatabaseHealth = () => {
  const state = mongoose.connection.readyState;
  
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  return {
    status: states[state] || 'unknown',
    host: mongoose.connection.host,
    name: mongoose.connection.name,
    collections: mongoose.connection.collections ? Object.keys(mongoose.connection.collections).length : 0
  };
};

// 컬렉션 생성 및 인덱스 설정
const setupCollections = async () => {
  try {
    const db = mongoose.connection.db;
    
    // 필요한 컬렉션들 생성
    const collections = [
      'users',
      'wallets', 
      'wallettransactions',
      'chargerequests',
      'boxproducts',
      'orders',
      'orderitems'
    ];
    
    for (const collectionName of collections) {
      try {
        await db.createCollection(collectionName);
        logger.info(`✅ Collection created: ${collectionName}`);
      } catch (error) {
        // 컬렉션이 이미 존재하는 경우 무시
        if (error.code !== 48) { // NamespaceExists 에러가 아닌 경우만 로그
          logger.warn(`Collection setup warning for ${collectionName}:`, error.message);
        }
      }
    }
    
    // 기본 데이터 시드
    await seedBasicData();
    
  } catch (error) {
    logger.error('Collection setup error:', error);
  }
};

// 기본 데이터 시드
const seedBasicData = async () => {
  try {
    const BoxProduct = require('../models/BoxProduct');
    
    // 기본 상품이 없으면 샘플 상품 생성
    const productCount = await BoxProduct.countDocuments();
    
    if (productCount === 0) {
      logger.info('🌱 Creating sample box products...');
      
      const sampleProducts = [
        {
          productId: 'kimchi-5kg-box',
          name: '맛있는 배추김치 5kg',
          nameEn: 'Delicious Cabbage Kimchi 5kg',
          category: 'kimchi',
          brand: "King's Food",
          boxInfo: {
            itemsPerBox: 1,
            boxWeight: 5.5,
            unitType: 'kg'
          },
          pricing: {
            basePrice: 899,
            bulkDiscounts: [
              { minBoxes: 5, discountPercent: 5 },
              { minBoxes: 10, discountPercent: 10 },
              { minBoxes: 20, discountPercent: 15 }
            ]
          },
          inventory: {
            totalBoxes: 100,
            reservedBoxes: 0
          },
          shipping: {
            refrigerated: true,
            shippingFeePerBox: 30
          }
        },
        {
          productId: 'shin-ramen-20pack',
          name: '농심 신라면 20개들이',
          nameEn: 'Nongshim Shin Ramyun 20 Pack',
          category: 'noodles',
          brand: 'Nongshim',
          boxInfo: {
            itemsPerBox: 20,
            boxWeight: 2.4,
            unitType: 'piece'
          },
          pricing: {
            basePrice: 1299,
            bulkDiscounts: [
              { minBoxes: 5, discountPercent: 3 },
              { minBoxes: 10, discountPercent: 7 },
              { minBoxes: 20, discountPercent: 12 }
            ]
          },
          inventory: {
            totalBoxes: 200,
            reservedBoxes: 0
          }
        },
        {
          productId: 'gochujang-6pack',
          name: '순창 고추장 500g 6개입',
          nameEn: 'Sunchang Gochujang 500g 6-pack',
          category: 'sauces',
          brand: 'Sunchang',
          boxInfo: {
            itemsPerBox: 6,
            boxWeight: 3.5,
            unitType: 'piece'
          },
          pricing: {
            basePrice: 2199,
            bulkDiscounts: [
              { minBoxes: 3, discountPercent: 5 },
              { minBoxes: 6, discountPercent: 10 },
              { minBoxes: 12, discountPercent: 18 }
            ]
          },
          inventory: {
            totalBoxes: 80,
            reservedBoxes: 0
          }
        }
      ];
      
      await BoxProduct.insertMany(sampleProducts);
      logger.info(`✅ Created ${sampleProducts.length} sample products`);
    }
    
  } catch (error) {
    logger.error('Seed data error:', error);
  }
};

module.exports = {
  connectDatabase,
  checkDatabaseHealth,
  setupCollections
};