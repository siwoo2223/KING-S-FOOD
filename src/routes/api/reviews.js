/**
 * 리뷰 및 평점 API 라우트
 * King's Food Philippines
 */

const express = require('express');
const router = express.Router();
const Review = require('../../models/Review');
const User = require('../../models/User');
const BoxProduct = require('../../models/BoxProduct');
const Wallet = require('../../models/Wallet');
const auth = require('../../middleware/auth');
const NotificationService = require('../../services/NotificationService');

// 상품별 리뷰 목록 조회
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      sort = 'recent',
      rating = null,
      hasPhotos = null,
      verified = null,
      language = null
    } = req.query;

    const skip = (page - 1) * limit;
    const query = { 
      productId,
      status: 'approved'
    };

    // 필터 적용
    if (rating) query['rating.overall'] = parseInt(rating);
    if (hasPhotos === 'true') query['media.photos.0'] = { $exists: true };
    if (verified === 'true') query.verifiedPurchase = true;
    if (language) query['review.language'] = language;

    // 정렬 옵션
    let sortOption = {};
    switch (sort) {
      case 'recent':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'rating_high':
        sortOption = { 'rating.overall': -1, createdAt: -1 };
        break;
      case 'rating_low':
        sortOption = { 'rating.overall': 1, createdAt: -1 };
        break;
      case 'helpful':
        sortOption = { 'helpfulness.helpfulCount': -1, createdAt: -1 };
        break;
    }

    const reviews = await Review.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'name customerLevel')
      .lean();

    const totalReviews = await Review.countDocuments(query);
    
    // 상품 평점 통계
    const ratingStats = await Review.calculateProductRating(productId);

    res.json({
      success: true,
      reviews: reviews.map(review => ({
        ...review,
        customerInfo: {
          name: review.userId?.name || 'Anonymous',
          customerLevel: review.userId?.customerLevel || 'retail',
          isVerifiedPurchase: review.verifiedPurchase
        }
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalReviews / limit),
        totalReviews,
        hasNextPage: page * limit < totalReviews,
        hasPrevPage: page > 1
      },
      ratingStats
    });
  } catch (error) {
    console.error('상품 리뷰 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '리뷰를 불러오는 중 오류가 발생했습니다.' 
    });
  }
});

// 특정 리뷰 상세 조회
router.get('/:reviewId', async (req, res) => {
  try {
    const { reviewId } = req.params;
    
    const review = await Review.findOne({ 
      reviewId,
      status: 'approved'
    })
    .populate('userId', 'name customerLevel')
    .populate('productId', 'name category');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: '리뷰를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      review
    });
  } catch (error) {
    console.error('리뷰 상세 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '리뷰를 불러오는 중 오류가 발생했습니다.'
    });
  }
});

// 리뷰 작성
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      productId,
      orderId,
      rating,
      review,
      tags = [],
      media = { photos: [], videos: [] }
    } = req.body;

    // 필수 필드 검증
    if (!productId || !orderId || !rating?.overall || !review?.content) {
      return res.status(400).json({
        success: false,
        message: '필수 정보가 누락되었습니다.'
      });
    }

    // 이미 리뷰를 작성했는지 확인
    const existingReview = await Review.findOne({
      userId,
      productId,
      orderId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: '이미 해당 상품에 대한 리뷰를 작성하셨습니다.'
      });
    }

    // 실제 주문 확인 (향후 Order 모델 연동)
    const verifiedPurchase = true; // 임시로 true 설정

    // 사용자 정보 조회
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    // 리뷰 생성
    const newReview = new Review({
      userId,
      productId,
      orderId,
      rating,
      review,
      tags,
      media,
      verifiedPurchase,
      customerInfo: {
        customerLevel: user.customerLevel,
        totalOrders: user.orderHistory.length,
        reviewCount: await Review.countDocuments({ userId })
      },
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        deviceType: req.get('User-Agent')?.includes('Mobile') ? 'mobile' : 'desktop',
        reviewSource: 'web'
      }
    });

    await newReview.save();

    // 리뷰 리워드 계산 및 지급
    const hasPhotos = media.photos && media.photos.length > 0;
    const hasDetailed = rating.taste || rating.quality || rating.packaging || rating.delivery;
    const rewardAmount = Review.calculateReviewReward(rating.overall, hasPhotos, hasDetailed);

    if (rewardAmount > 0) {
      try {
        await Wallet.findOneAndUpdate(
          { userId },
          {
            $inc: { balance: rewardAmount },
            $push: {
              transactions: {
                type: 'credit',
                amount: rewardAmount,
                description: `리뷰 작성 리워드 - ${newReview.reviewId}`,
                relatedId: newReview._id,
                balanceAfter: user.wallet?.balance + rewardAmount || rewardAmount
              }
            }
          },
          { upsert: true }
        );

        newReview.rewardGiven = true;
        newReview.rewardAmount = rewardAmount;
        await newReview.save();

        // 리워드 알림 전송
        await NotificationService.sendNotification(userId, 'CREDIT_CHARGED', {
          amount: rewardAmount,
          bonus: 0,
          balance: (user.wallet?.balance || 0) + rewardAmount,
          reason: '리뷰 작성 리워드'
        });
      } catch (rewardError) {
        console.error('리뷰 리워드 지급 오류:', rewardError);
      }
    }

    res.status(201).json({
      success: true,
      message: '리뷰가 성공적으로 작성되었습니다.',
      review: newReview,
      reward: {
        amount: rewardAmount,
        message: rewardAmount > 0 ? `₱${rewardAmount} 크레딧이 지급되었습니다!` : null
      }
    });
  } catch (error) {
    console.error('리뷰 작성 오류:', error);
    res.status(500).json({
      success: false,
      message: '리뷰 작성 중 오류가 발생했습니다.'
    });
  }
});

// 리뷰 수정
router.put('/:reviewId', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { reviewId } = req.params;
    const { rating, review, tags, media } = req.body;

    const existingReview = await Review.findOne({
      reviewId,
      userId
    });

    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: '수정할 리뷰를 찾을 수 없습니다.'
      });
    }

    // 승인된 리뷰는 수정 제한
    if (existingReview.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: '승인된 리뷰는 수정할 수 없습니다.'
      });
    }

    // 리뷰 업데이트
    if (rating) existingReview.rating = { ...existingReview.rating, ...rating };
    if (review) existingReview.review = { ...existingReview.review, ...review };
    if (tags) existingReview.tags = tags;
    if (media) existingReview.media = { ...existingReview.media, ...media };
    
    existingReview.status = 'pending'; // 재검토 필요
    await existingReview.save();

    res.json({
      success: true,
      message: '리뷰가 수정되었습니다.',
      review: existingReview
    });
  } catch (error) {
    console.error('리뷰 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '리뷰 수정 중 오류가 발생했습니다.'
    });
  }
});

// 리뷰 삭제
router.delete('/:reviewId', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { reviewId } = req.params;

    const review = await Review.findOne({
      reviewId,
      userId
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: '삭제할 리뷰를 찾을 수 없습니다.'
      });
    }

    await Review.deleteOne({ _id: review._id });

    // 리워드를 받은 경우 차감 (선택사항)
    if (review.rewardGiven && review.rewardAmount > 0) {
      try {
        await Wallet.findOneAndUpdate(
          { userId },
          {
            $inc: { balance: -review.rewardAmount },
            $push: {
              transactions: {
                type: 'debit',
                amount: review.rewardAmount,
                description: `리뷰 삭제로 인한 리워드 차감 - ${reviewId}`,
                relatedId: review._id
              }
            }
          }
        );
      } catch (rewardError) {
        console.error('리워드 차감 오류:', rewardError);
      }
    }

    res.json({
      success: true,
      message: '리뷰가 삭제되었습니다.'
    });
  } catch (error) {
    console.error('리뷰 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '리뷰 삭제 중 오류가 발생했습니다.'
    });
  }
});

// 리뷰 유용함 표시
router.post('/:reviewId/helpful', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { reviewId } = req.params;
    const { helpful } = req.body; // true: 유용함, false: 유용하지 않음

    const review = await Review.findOne({ reviewId });
    if (!review) {
      return res.status(404).json({
        success: false,
        message: '리뷰를 찾을 수 없습니다.'
      });
    }

    // 자신의 리뷰에는 유용함 표시 불가
    if (review.userId.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: '자신의 리뷰에는 유용함을 표시할 수 없습니다.'
      });
    }

    if (helpful) {
      await review.markHelpful(userId);
    } else {
      await review.markNotHelpful(userId);
    }

    res.json({
      success: true,
      message: helpful ? '유용함으로 표시되었습니다.' : '유용하지 않음으로 표시되었습니다.',
      helpfulness: {
        helpfulCount: review.helpfulness.helpfulCount,
        notHelpfulCount: review.helpfulness.notHelpfulCount,
        helpfulnessScore: review.helpfulnessScore
      }
    });
  } catch (error) {
    console.error('리뷰 유용함 표시 오류:', error);
    res.status(500).json({
      success: false,
      message: '처리 중 오류가 발생했습니다.'
    });
  }
});

// 내 리뷰 목록 조회
router.get('/my/reviews', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, status = null } = req.query;

    const skip = (page - 1) * limit;
    const query = { userId };
    
    if (status) query.status = status;

    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('productId', 'name category images pricing');

    const totalReviews = await Review.countDocuments(query);
    const userStats = await Review.getUserReviewStats(userId);

    res.json({
      success: true,
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalReviews / limit),
        totalReviews,
        hasNextPage: page * limit < totalReviews,
        hasPrevPage: page > 1
      },
      userStats
    });
  } catch (error) {
    console.error('내 리뷰 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '리뷰를 불러오는 중 오류가 발생했습니다.'
    });
  }
});

// 상품별 평점 통계 조회
router.get('/stats/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    const stats = await Review.calculateProductRating(productId);
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('상품 평점 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '통계를 불러오는 중 오류가 발생했습니다.'
    });
  }
});

// 관리자 전용 - 리뷰 승인/거절 (향후 관리자 인증 미들웨어 추가 필요)
router.put('/:reviewId/moderate', auth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { action, note } = req.body; // action: 'approve' | 'reject'

    const review = await Review.findOne({ reviewId });
    if (!review) {
      return res.status(404).json({
        success: false,
        message: '리뷰를 찾을 수 없습니다.'
      });
    }

    if (action === 'approve') {
      await review.approve(note);
    } else if (action === 'reject') {
      await review.reject(note);
    } else {
      return res.status(400).json({
        success: false,
        message: '올바르지 않은 액션입니다.'
      });
    }

    res.json({
      success: true,
      message: action === 'approve' ? '리뷰가 승인되었습니다.' : '리뷰가 거절되었습니다.',
      review
    });
  } catch (error) {
    console.error('리뷰 검토 오류:', error);
    res.status(500).json({
      success: false,
      message: '검토 처리 중 오류가 발생했습니다.'
    });
  }
});

// 업체 답변 작성 (관리자 전용)
router.post('/:reviewId/reply', auth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { replyContent } = req.body;
    const repliedBy = req.user.userId;

    if (!replyContent || replyContent.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '답변 내용을 입력해주세요.'
      });
    }

    const review = await Review.findOne({ reviewId });
    if (!review) {
      return res.status(404).json({
        success: false,
        message: '리뷰를 찾을 수 없습니다.'
      });
    }

    await review.addMerchantReply(replyContent, repliedBy);

    res.json({
      success: true,
      message: '업체 답변이 등록되었습니다.',
      review
    });
  } catch (error) {
    console.error('업체 답변 등록 오류:', error);
    res.status(500).json({
      success: false,
      message: '답변 등록 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router;