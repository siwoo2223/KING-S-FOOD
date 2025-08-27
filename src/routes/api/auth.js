/**
 * 간소화된 인증 시스템 API
 * 이름, 연락처, 주소만으로 간단한 회원가입
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const { Wallet } = require('../../models/Wallet');
const logger = require('../../utils/logger');

const router = express.Router();

/**
 * POST /api/auth/register
 * 간단한 회원가입
 */
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      phone,
      email, // 선택사항
      password,
      address,
      businessInfo = {}
    } = req.body;
    
    // 필수 정보 검증
    if (!name || !phone || !password || !address) {
      return res.status(400).json({
        success: false,
        message: '필수 정보를 모두 입력해주세요',
        required: ['name', 'phone', 'password', 'address']
      });
    }
    
    // 주소 필수 필드 검증
    const requiredAddressFields = ['street', 'barangay', 'city', 'province', 'postalCode'];
    const missingAddressFields = requiredAddressFields.filter(field => !address[field]);
    
    if (missingAddressFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: '주소 정보를 완전히 입력해주세요',
        missing: missingAddressFields
      });
    }
    
    // 전화번호 중복 확인
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '이미 등록된 전화번호입니다'
      });
    }
    
    // 이메일 중복 확인 (이메일이 제공된 경우)
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: '이미 등록된 이메일입니다'
        });
      }
    }
    
    // 사용자 생성
    const newUser = new User({
      name,
      phone,
      email: email || undefined,
      address,
      businessInfo: {
        type: businessInfo.type || 'personal',
        businessName: businessInfo.businessName || '',
        category: businessInfo.category || 'others'
      },
      auth: {
        password
      }
    });
    
    // SMS 인증코드 생성
    const verificationCode = newUser.generatePhoneVerificationCode();
    
    await newUser.save();
    
    // 지갑 생성
    const wallet = new Wallet({ userId: newUser._id });
    await wallet.save();
    
    // SMS 발송 시뮬레이션 (실제로는 SMS API 사용)
    logger.info(`SMS verification code for ${phone}: ${verificationCode}`);
    
    // JWT 토큰 생성 (인증 전이므로 제한된 권한)
    const tempToken = jwt.sign(
      { 
        userId: newUser._id,
        phone: newUser.phone,
        verified: false
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다. SMS로 전송된 인증코드를 입력해주세요.',
      data: {
        userId: newUser._id,
        name: newUser.name,
        phone: newUser.phone,
        status: newUser.status,
        tempToken,
        verificationRequired: true,
        // 개발용 (실제 서비스에서는 제거)
        developmentCode: verificationCode
      }
    });
    
  } catch (error) {
    logger.error('Registration error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: '입력 정보를 확인해주세요',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: '회원가입 중 오류가 발생했습니다',
      error: error.message
    });
  }
});

/**
 * POST /api/auth/verify-phone
 * SMS 인증코드 검증
 */
router.post('/verify-phone', async (req, res) => {
  try {
    const { phone, code } = req.body;
    
    if (!phone || !code) {
      return res.status(400).json({
        success: false,
        message: '전화번호와 인증코드를 입력해주세요'
      });
    }
    
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다'
      });
    }
    
    if (user.auth.phoneVerified) {
      return res.status(400).json({
        success: false,
        message: '이미 인증된 전화번호입니다'
      });
    }
    
    const isValid = user.verifyPhoneCode(code);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: '인증코드가 잘못되었거나 만료되었습니다'
      });
    }
    
    await user.save();
    
    // 정식 JWT 토큰 발급
    const token = jwt.sign(
      {
        userId: user._id,
        phone: user.phone,
        name: user.name,
        customerLevel: user.customerLevel,
        verified: true
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      message: '전화번호 인증이 완료되었습니다',
      data: {
        userId: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        customerLevel: user.customerLevel,
        status: user.status,
        token,
        walletBalance: 0 // 새 계정이므로 0
      }
    });
    
  } catch (error) {
    logger.error('Phone verification error:', error);
    res.status(500).json({
      success: false,
      message: '인증 처리 중 오류가 발생했습니다',
      error: error.message
    });
  }
});

/**
 * POST /api/auth/resend-verification
 * 인증코드 재전송
 */
router.post('/resend-verification', async (req, res) => {
  try {
    const { phone } = req.body;
    
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다'
      });
    }
    
    if (user.auth.phoneVerified) {
      return res.status(400).json({
        success: false,
        message: '이미 인증된 전화번호입니다'
      });
    }
    
    // 새 인증코드 생성
    const verificationCode = user.generatePhoneVerificationCode();
    await user.save();
    
    // SMS 발송 시뮬레이션
    logger.info(`SMS verification code resent for ${phone}: ${verificationCode}`);
    
    res.json({
      success: true,
      message: '인증코드가 다시 전송되었습니다',
      data: {
        // 개발용
        developmentCode: verificationCode
      }
    });
    
  } catch (error) {
    logger.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: '인증코드 재전송 중 오류가 발생했습니다'
    });
  }
});

/**
 * POST /api/auth/login
 * 로그인
 */
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: '전화번호와 비밀번호를 입력해주세요'
      });
    }
    
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '전화번호 또는 비밀번호가 잘못되었습니다'
      });
    }
    
    // 계정 잠김 확인
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: '계정이 일시적으로 잠겼습니다. 30분 후 다시 시도해주세요'
      });
    }
    
    // 비밀번호 검증
    const isValidPassword = await user.validatePassword(password);
    
    // 로그인 시도 기록
    user.handleLoginAttempt(isValidPassword);
    await user.save();
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: '전화번호 또는 비밀번호가 잘못되었습니다',
        attemptsRemaining: Math.max(0, 5 - user.auth.loginAttempts)
      });
    }
    
    // 인증되지 않은 계정 확인
    if (!user.auth.phoneVerified) {
      return res.status(403).json({
        success: false,
        message: '전화번호 인증이 필요합니다',
        requiresVerification: true,
        phone: user.phone
      });
    }
    
    // 지갑 정보 조회
    const wallet = await Wallet.findOne({ userId: user._id });
    
    // JWT 토큰 생성
    const token = jwt.sign(
      {
        userId: user._id,
        phone: user.phone,
        name: user.name,
        customerLevel: user.customerLevel,
        verified: true
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      message: '로그인 성공',
      data: {
        userId: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        customerLevel: user.customerLevel,
        discountRate: user.getDiscountRate(),
        address: user.getFormattedAddress(),
        businessInfo: user.businessInfo,
        preferences: user.preferences,
        purchaseStats: user.purchaseStats,
        walletBalance: wallet?.balance || 0,
        token,
        lastLoginAt: user.auth.lastLoginAt
      }
    });
    
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: '로그인 중 오류가 발생했습니다'
    });
  }
});

/**
 * GET /api/auth/profile
 * 프로필 조회 (인증 필요)
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-auth.password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다'
      });
    }
    
    const wallet = await Wallet.findOne({ userId: user._id });
    
    res.json({
      success: true,
      data: {
        ...user.toObject(),
        walletBalance: wallet?.balance || 0,
        formattedAddress: user.getFormattedAddress(true),
        discountRate: user.getDiscountRate(),
        canOrder: user.canOrder
      }
    });
    
  } catch (error) {
    logger.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: '프로필 조회 중 오류가 발생했습니다'
    });
  }
});

/**
 * PUT /api/auth/profile
 * 프로필 수정
 */
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      email,
      address,
      businessInfo,
      preferences
    } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다'
      });
    }
    
    // 업데이트 가능한 필드들
    if (name) user.name = name;
    if (email !== undefined) user.email = email || undefined;
    if (address) {
      user.address = { ...user.address, ...address };
    }
    if (businessInfo) {
      user.businessInfo = { ...user.businessInfo, ...businessInfo };
    }
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: '프로필이 업데이트되었습니다',
      data: {
        name: user.name,
        email: user.email,
        address: user.address,
        businessInfo: user.businessInfo,
        preferences: user.preferences,
        formattedAddress: user.getFormattedAddress(true)
      }
    });
    
  } catch (error) {
    logger.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: '프로필 수정 중 오류가 발생했습니다',
      error: error.message
    });
  }
});

/**
 * POST /api/auth/change-password
 * 비밀번호 변경
 */
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: '현재 비밀번호와 새 비밀번호를 모두 입력해주세요'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: '새 비밀번호는 6자리 이상이어야 합니다'
      });
    }
    
    const user = await User.findById(req.user.userId);
    
    const isValidCurrentPassword = await user.validatePassword(currentPassword);
    if (!isValidCurrentPassword) {
      return res.status(400).json({
        success: false,
        message: '현재 비밀번호가 잘못되었습니다'
      });
    }
    
    user.auth.password = newPassword;
    await user.save();
    
    res.json({
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다'
    });
    
  } catch (error) {
    logger.error('Password change error:', error);
    res.status(500).json({
      success: false,
      message: '비밀번호 변경 중 오류가 발생했습니다'
    });
  }
});

/**
 * POST /api/auth/logout
 * 로그아웃 (클라이언트에서 토큰 삭제)
 */
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: '로그아웃되었습니다'
  });
});

/**
 * GET /api/auth/delivery-areas
 * 배송 가능 지역 목록
 */
router.get('/delivery-areas', (req, res) => {
  try {
    const deliveryAreas = {
      metro_manila: {
        name: 'Metro Manila',
        provinces: ['NCR'],
        cities: [
          'Manila', 'Quezon City', 'Makati', 'Pasig', 'Taguig', 'Bonifacio Global City',
          'Mandaluyong', 'San Juan', 'Pasay', 'Las Piñas', 'Muntinlupa', 'Parañaque',
          'Caloocan', 'Malabon', 'Navotas', 'Valenzuela', 'Marikina'
        ],
        deliveryTime: '당일 배송',
        shippingFee: 50
      },
      nearby_provinces: {
        name: 'Nearby Provinces',
        provinces: ['Rizal', 'Bulacan', 'Laguna', 'Cavite'],
        cities: [
          'Antipolo', 'Cainta', 'Taytay', 'Meycauayan', 'San Jose del Monte',
          'Santa Rosa', 'Biñan', 'Calamba', 'Bacoor', 'Imus', 'Dasmariñas'
        ],
        deliveryTime: '익일 배송',
        shippingFee: 80
      },
      extended_areas: {
        name: 'Extended Areas',
        provinces: ['Batangas', 'Pampanga', 'Bataan', 'Zambales'],
        cities: ['Batangas City', 'Lipa', 'San Fernando', 'Angeles', 'Olongapo'],
        deliveryTime: '2-3일 배송',
        shippingFee: 120
      }
    };
    
    const popularCities = [
      { city: 'Manila', province: 'NCR', postalCode: '1000-1099' },
      { city: 'Quezon City', province: 'NCR', postalCode: '1100-1199' },
      { city: 'Makati', province: 'NCR', postalCode: '1200-1299' },
      { city: 'Pasig', province: 'NCR', postalCode: '1600-1699' },
      { city: 'Taguig', province: 'NCR', postalCode: '1630-1639' }
    ];
    
    res.json({
      success: true,
      data: {
        deliveryAreas,
        popularCities,
        freeShippingThreshold: 50000, // ₱50,000 이상 무료 배송
        supportedRegions: ['NCR', 'Region IV-A (CALABARZON)', 'Region III (Central Luzon)']
      }
    });
    
  } catch (error) {
    logger.error('Delivery areas error:', error);
    res.status(500).json({
      success: false,
      message: '배송 지역 조회 중 오류가 발생했습니다'
    });
  }
});

// JWT 토큰 인증 미들웨어
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: '인증 토큰이 필요합니다'
    });
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: '유효하지 않은 토큰입니다'
      });
    }
    
    req.user = user;
    next();
  });
}

module.exports = router;