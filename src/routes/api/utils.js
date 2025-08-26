/**
 * 유틸리티 API 라우트
 * 지역, 배송, 환율 등 보조 기능
 */

const express = require('express');
const router = express.Router();

// 필리핀 지역 정보 (시/도, 바랑가이 등)
router.get('/regions', (req, res) => {
  res.json({
    success: true,
    message: 'Philippines regions retrieved',
    data: {
      regions: [
        {
          id: 'NCR',
          name: 'National Capital Region (Metro Manila)',
          provinces: [
            {
              id: 'metro-manila',
              name: 'Metro Manila',
              cities: [
                { id: 'manila', name: 'Manila' },
                { id: 'quezon-city', name: 'Quezon City' },
                { id: 'makati', name: 'Makati' },
                { id: 'taguig', name: 'Taguig' },
                { id: 'pasig', name: 'Pasig' }
              ]
            }
          ]
        },
        {
          id: 'CAR',
          name: 'Cordillera Administrative Region',
          provinces: []
        },
        {
          id: 'REGION-I',
          name: 'Ilocos Region',
          provinces: []
        }
      ],
      note: 'Will be implemented with complete Philippines address database'
    }
  });
});

// 특정 도시의 바랑가이 목록
router.get('/regions/:provinceId/cities/:cityId/barangays', (req, res) => {
  const { provinceId, cityId } = req.params;
  res.json({
    success: true,
    message: `Barangays for ${cityId} retrieved`,
    data: {
      province_id: provinceId,
      city_id: cityId,
      barangays: [
        { id: 'barangay-1', name: 'Sample Barangay 1', postal_code: '1000' },
        { id: 'barangay-2', name: 'Sample Barangay 2', postal_code: '1001' }
      ],
      note: 'Will be implemented with complete barangay database'
    }
  });
});

// 배송비 계산
router.post('/shipping/calculate', (req, res) => {
  res.json({
    success: true,
    message: 'Shipping cost calculated',
    data: {
      shipping_options: [
        {
          courier: 'LBC Express',
          service_type: 'standard',
          cost: '₱85.00',
          estimated_delivery: '3-5 business days',
          tracking_included: true
        },
        {
          courier: 'J&T Express',
          service_type: 'standard',
          cost: '₱75.00',
          estimated_delivery: '3-7 business days',
          tracking_included: true
        },
        {
          courier: '2GO Express',
          service_type: 'standard',
          cost: '₱95.00',
          estimated_delivery: '2-4 business days',
          tracking_included: true
        },
        {
          courier: 'LBC Express',
          service_type: 'express',
          cost: '₱150.00',
          estimated_delivery: '1-2 business days',
          tracking_included: true
        }
      ],
      calculation_details: {
        origin: req.body.origin || 'Metro Manila',
        destination: req.body.destination || 'Cebu City',
        weight: req.body.weight || '1.0 kg',
        dimensions: req.body.dimensions || '20x15x10 cm',
        declared_value: req.body.declared_value || '₱1,299.00'
      },
      currency: 'PHP',
      note: 'Will be implemented with courier API integrations'
    }
  });
});

// 환율 정보 (PHP 기준)
router.get('/currency/rates', (req, res) => {
  res.json({
    success: true,
    message: 'Currency exchange rates',
    data: {
      base_currency: 'PHP',
      rates: {
        'USD': 0.018, // 1 PHP = 0.018 USD
        'EUR': 0.016,
        'JPY': 2.65,
        'SGD': 0.024,
        'HKD': 0.14,
        'KRW': 23.8,
        'CNY': 0.129
      },
      last_updated: new Date().toISOString(),
      source: 'Bangko Sentral ng Pilipinas',
      note: 'Will be implemented with real-time exchange rate API'
    }
  });
});

// 통화 포맷 유틸리티
router.post('/currency/format', (req, res) => {
  const amount = parseFloat(req.body.amount) || 0;
  const currency = req.body.currency || 'PHP';
  
  res.json({
    success: true,
    message: 'Currency formatted',
    data: {
      original_amount: amount,
      currency: currency,
      formatted: currency === 'PHP' ? `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : `${amount} ${currency}`,
      locale: 'en-PH',
      note: 'Currency formatting utility'
    }
  });
});

// 시간대 변환 (필리핀 기준)
router.get('/timezone/convert', (req, res) => {
  const utcTime = req.query.utc_time || new Date().toISOString();
  const targetTimezone = req.query.timezone || 'Asia/Manila';
  
  res.json({
    success: true,
    message: 'Timezone conversion completed',
    data: {
      utc_time: utcTime,
      target_timezone: targetTimezone,
      local_time: new Date(utcTime).toLocaleString('en-PH', { 
        timeZone: targetTimezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }),
      philippines_time: new Date(utcTime).toLocaleString('en-PH', { 
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }),
      note: 'Timezone conversion utility'
    }
  });
});

// 우편번호 조회
router.get('/postal-codes', (req, res) => {
  const search = req.query.search || '';
  
  res.json({
    success: true,
    message: 'Postal codes retrieved',
    data: {
      search_query: search,
      postal_codes: [
        { postal_code: '1000', area: 'Manila', city: 'Manila', province: 'Metro Manila' },
        { postal_code: '1100', area: 'Ermita', city: 'Manila', province: 'Metro Manila' },
        { postal_code: '1200', area: 'Makati', city: 'Makati', province: 'Metro Manila' }
      ],
      note: 'Will be implemented with complete postal code database'
    }
  });
});

// 영업시간 확인
router.get('/business-hours', (req, res) => {
  const now = new Date();
  const philippineTime = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(now);

  const currentHour = parseInt(philippineTime.find(part => part.type === 'hour').value);
  const isBusinessHour = currentHour >= 9 && currentHour < 18; // 9 AM to 6 PM
  const weekday = philippineTime.find(part => part.type === 'weekday').value;
  const isWeekend = weekday === 'Saturday' || weekday === 'Sunday';

  res.json({
    success: true,
    message: 'Business hours information',
    data: {
      current_time: {
        philippines_time: now.toLocaleString('en-PH', { timeZone: 'Asia/Manila' }),
        timezone: 'Asia/Manila',
        day_of_week: weekday
      },
      business_hours: {
        monday_friday: '9:00 AM - 6:00 PM',
        saturday: '9:00 AM - 1:00 PM',
        sunday: 'Closed',
        holidays: 'Closed'
      },
      status: {
        is_open: isBusinessHour && !isWeekend,
        is_business_hour: isBusinessHour,
        is_weekend: isWeekend,
        next_open: isWeekend ? 'Monday 9:00 AM' : currentHour >= 18 ? 'Tomorrow 9:00 AM' : 'Currently open'
      },
      support: {
        chat_available: isBusinessHour && !isWeekend,
        email_response_time: '24 hours',
        phone_available: isBusinessHour && !isWeekend
      },
      note: 'Business hours based on Philippines timezone'
    }
  });
});

// 공휴일 확인
router.get('/holidays', (req, res) => {
  const year = req.query.year || new Date().getFullYear();
  
  res.json({
    success: true,
    message: 'Philippines holidays retrieved',
    data: {
      year: year,
      holidays: [
        { date: `${year}-01-01`, name: 'New Year\'s Day', type: 'regular' },
        { date: `${year}-02-25`, name: 'EDSA People Power Revolution Anniversary', type: 'special' },
        { date: `${year}-04-09`, name: 'Araw ng Kagitingan (Day of Valor)', type: 'regular' },
        { date: `${year}-05-01`, name: 'Labor Day', type: 'regular' },
        { date: `${year}-06-12`, name: 'Independence Day', type: 'regular' },
        { date: `${year}-08-21`, name: 'Ninoy Aquino Day', type: 'special' },
        { date: `${year}-08-30`, name: 'National Heroes Day', type: 'regular' },
        { date: `${year}-11-01`, name: 'All Saints\' Day', type: 'special' },
        { date: `${year}-11-30`, name: 'Bonifacio Day', type: 'regular' },
        { date: `${year}-12-25`, name: 'Christmas Day', type: 'regular' },
        { date: `${year}-12-30`, name: 'Rizal Day', type: 'regular' }
      ],
      business_impact: {
        shipping_delays: 'Expected during regular holidays',
        customer_support: 'Limited availability',
        order_processing: 'May be delayed'
      },
      note: 'Philippines national holidays - some dates may vary by year'
    }
  });
});

// 시스템 상태 확인
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'System health check',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      timezone: 'Asia/Manila',
      services: {
        database: 'connected',
        redis: 'connected',
        ecount_api: 'connected',
        payment_gateways: {
          paymongo: 'online',
          xendit: 'online',
          dragonpay: 'online'
        },
        email_service: 'online',
        sms_service: 'online'
      },
      performance: {
        response_time: '45ms',
        cpu_usage: '15%',
        memory_usage: '68%',
        disk_usage: '42%'
      },
      note: 'Will be implemented with actual service health checks'
    }
  });
});

// 버전 정보
router.get('/version', (req, res) => {
  res.json({
    success: true,
    message: 'Application version information',
    data: {
      application: {
        name: 'Philippines E-Commerce Platform',
        version: '1.0.0',
        build: Date.now().toString(),
        environment: process.env.NODE_ENV || 'development'
      },
      api: {
        version: 'v1.0.0',
        last_updated: new Date().toISOString()
      },
      dependencies: {
        node: process.version,
        express: '4.18.x',
        timezone: 'Asia/Manila',
        currency: 'PHP'
      },
      deployment: {
        deployed_at: new Date().toISOString(),
        region: 'Philippines',
        timezone: 'Asia/Manila'
      }
    }
  });
});

module.exports = router;