/**
 * 필리핀 배송 지역 및 요금 설정
 * King's Food Philippines 전용
 */

const deliveryZones = {
  // Metro Manila (NCR) - 주요 배송 지역
  metro_manila: {
    name: 'Metro Manila (NCR)',
    code: 'NCR',
    deliveryFee: 150,
    freeDeliveryMinimum: 3000,
    estimatedDelivery: '1-2 days',
    priority: 1,
    active: true,
    cities: [
      'Manila',
      'Quezon City', 
      'Caloocan',
      'Las Piñas',
      'Makati',
      'Malabon',
      'Mandaluyong',
      'Marikina',
      'Muntinlupa',
      'Navotas',
      'Parañaque',
      'Pasay',
      'Pasig',
      'San Juan',
      'Taguig',
      'Valenzuela',
      'Pateros'
    ],
    barangays: {
      'Manila': [
        'Binondo', 'Ermita', 'Intramuros', 'Malate', 'Paco', 'Pandacan',
        'Port Area', 'Quiapo', 'Sampaloc', 'San Andres', 'San Miguel',
        'San Nicolas', 'Santa Ana', 'Santa Cruz', 'Santa Mesa', 'Tondo'
      ],
      'Makati': [
        'Barangay Bel-Air', 'Barangay Forbes Park', 'Barangay San Lorenzo',
        'Barangay Urdaneta', 'Barangay Valenzuela', 'Poblacion'
      ],
      'Quezon City': [
        'Barangay Holy Spirit', 'Barangay Batasan Hills', 'Barangay Commonwealth',
        'Barangay Diliman', 'Barangay Novaliches', 'Barangay Fairview'
      ]
    }
  },

  // Luzon Regions
  luzon_north: {
    name: 'Northern Luzon',
    code: 'NORTH',
    deliveryFee: 300,
    freeDeliveryMinimum: 5000,
    estimatedDelivery: '3-5 days',
    priority: 2,
    active: true,
    regions: [
      {
        name: 'Ilocos Region (Region I)',
        provinces: ['Ilocos Norte', 'Ilocos Sur', 'La Union', 'Pangasinan']
      },
      {
        name: 'Cagayan Valley (Region II)',
        provinces: ['Batanes', 'Cagayan', 'Isabela', 'Nueva Vizcaya', 'Quirino']
      },
      {
        name: 'Cordillera Administrative Region (CAR)',
        provinces: ['Abra', 'Apayao', 'Benguet', 'Ifugao', 'Kalinga', 'Mountain Province']
      }
    ]
  },

  luzon_central: {
    name: 'Central Luzon',
    code: 'CENTRAL',
    deliveryFee: 250,
    freeDeliveryMinimum: 4000,
    estimatedDelivery: '2-3 days',
    priority: 2,
    active: true,
    regions: [
      {
        name: 'Central Luzon (Region III)',
        provinces: ['Aurora', 'Bataan', 'Bulacan', 'Nueva Ecija', 'Pampanga', 'Tarlac', 'Zambales']
      }
    ]
  },

  luzon_south: {
    name: 'Southern Luzon',
    code: 'SOUTH',
    deliveryFee: 300,
    freeDeliveryMinimum: 4500,
    estimatedDelivery: '3-4 days',
    priority: 2,
    active: true,
    regions: [
      {
        name: 'CALABARZON (Region IV-A)',
        provinces: ['Batangas', 'Cavite', 'Laguna', 'Quezon', 'Rizal']
      },
      {
        name: 'MIMAROPA (Region IV-B)',
        provinces: ['Marinduque', 'Occidental Mindoro', 'Oriental Mindoro', 'Palawan', 'Romblon']
      },
      {
        name: 'Bicol Region (Region V)',
        provinces: ['Albay', 'Camarines Norte', 'Camarines Sur', 'Catanduanes', 'Masbate', 'Sorsogon']
      }
    ]
  },

  // Visayas Regions
  visayas_western: {
    name: 'Western Visayas',
    code: 'WESVIS',
    deliveryFee: 400,
    freeDeliveryMinimum: 6000,
    estimatedDelivery: '4-6 days',
    priority: 3,
    active: true,
    regions: [
      {
        name: 'Western Visayas (Region VI)',
        provinces: ['Aklan', 'Antique', 'Capiz', 'Guimaras', 'Iloilo', 'Negros Occidental']
      }
    ],
    majorCities: ['Iloilo City', 'Bacolod', 'Roxas', 'Kalibo']
  },

  visayas_central: {
    name: 'Central Visayas',
    code: 'CENVIS',
    deliveryFee: 400,
    freeDeliveryMinimum: 6000,
    estimatedDelivery: '4-6 days',
    priority: 3,
    active: true,
    regions: [
      {
        name: 'Central Visayas (Region VII)',
        provinces: ['Bohol', 'Cebu', 'Negros Oriental', 'Siquijor']
      }
    ],
    majorCities: ['Cebu City', 'Mandaue', 'Lapu-Lapu', 'Tagbilaran', 'Dumaguete']
  },

  visayas_eastern: {
    name: 'Eastern Visayas',
    code: 'EASVIS',
    deliveryFee: 450,
    freeDeliveryMinimum: 6500,
    estimatedDelivery: '5-7 days',
    priority: 3,
    active: true,
    regions: [
      {
        name: 'Eastern Visayas (Region VIII)',
        provinces: ['Biliran', 'Eastern Samar', 'Leyte', 'Northern Samar', 'Samar', 'Southern Leyte']
      }
    ],
    majorCities: ['Tacloban', 'Ormoc', 'Maasin', 'Calbayog']
  },

  // Mindanao Regions
  mindanao_northern: {
    name: 'Northern Mindanao',
    code: 'NORMIND',
    deliveryFee: 500,
    freeDeliveryMinimum: 7000,
    estimatedDelivery: '5-8 days',
    priority: 4,
    active: true,
    regions: [
      {
        name: 'Northern Mindanao (Region X)',
        provinces: ['Bukidnon', 'Camiguin', 'Lanao del Norte', 'Misamis Occidental', 'Misamis Oriental']
      },
      {
        name: 'Caraga (Region XIII)',
        provinces: ['Agusan del Norte', 'Agusan del Sur', 'Dinagat Islands', 'Surigao del Norte', 'Surigao del Sur']
      }
    ],
    majorCities: ['Cagayan de Oro', 'Iligan', 'Butuan', 'Surigao']
  },

  mindanao_southern: {
    name: 'Southern Mindanao',
    code: 'SOUMIND',
    deliveryFee: 550,
    freeDeliveryMinimum: 7500,
    estimatedDelivery: '6-9 days',
    priority: 4,
    active: true,
    regions: [
      {
        name: 'Davao Region (Region XI)',
        provinces: ['Davao de Oro', 'Davao del Norte', 'Davao del Sur', 'Davao Occidental', 'Davao Oriental']
      },
      {
        name: 'SOCCSKSARGEN (Region XII)',
        provinces: ['Cotabato', 'Sarangani', 'South Cotabato', 'Sultan Kudarat']
      }
    ],
    majorCities: ['Davao City', 'General Santos', 'Koronadal', 'Kidapawan']
  },

  mindanao_western: {
    name: 'Western Mindanao',
    code: 'WESMIND',
    deliveryFee: 600,
    freeDeliveryMinimum: 8000,
    estimatedDelivery: '7-10 days',
    priority: 5,
    active: false, // 보안상 일시 중단
    regions: [
      {
        name: 'Zamboanga Peninsula (Region IX)',
        provinces: ['Zamboanga del Norte', 'Zamboanga del Sur', 'Zamboanga Sibugay']
      }
    ],
    majorCities: ['Zamboanga City', 'Pagadian', 'Dipolog'],
    note: '보안상의 이유로 배송이 일시 중단되었습니다. 문의: 02-1234-5678'
  },

  // BARMM (Autonomous Region)
  barmm: {
    name: 'Bangsamoro Autonomous Region',
    code: 'BARMM',
    deliveryFee: 0,
    freeDeliveryMinimum: 0,
    estimatedDelivery: 'N/A',
    priority: 6,
    active: false,
    regions: [
      {
        name: 'BARMM',
        provinces: ['Basilan', 'Lanao del Sur', 'Maguindanao del Norte', 'Maguindanao del Sur', 'Sulu', 'Tawi-Tawi']
      }
    ],
    note: '현재 배송 서비스를 제공하지 않습니다.'
  }
};

/**
 * 배송비 계산 함수
 */
function calculateDeliveryFee(address, orderAmount = 0) {
  const zone = findDeliveryZone(address);
  
  if (!zone || !zone.active) {
    return {
      success: false,
      message: '해당 지역은 배송 서비스를 제공하지 않습니다.',
      zone: zone?.name || 'Unknown'
    };
  }

  const deliveryFee = orderAmount >= zone.freeDeliveryMinimum ? 0 : zone.deliveryFee;
  
  return {
    success: true,
    zone: zone.name,
    zoneCode: zone.code,
    deliveryFee,
    freeDeliveryMinimum: zone.freeDeliveryMinimum,
    estimatedDelivery: zone.estimatedDelivery,
    priority: zone.priority,
    isFreeDelivery: deliveryFee === 0,
    note: zone.note || null
  };
}

/**
 * 주소로 배송 지역 찾기
 */
function findDeliveryZone(address) {
  const { city, province, region } = address;
  
  // Metro Manila 우선 확인
  if (deliveryZones.metro_manila.cities.includes(city)) {
    return deliveryZones.metro_manila;
  }

  // 다른 지역 확인
  for (const [zoneKey, zone] of Object.entries(deliveryZones)) {
    if (zoneKey === 'metro_manila') continue;
    
    if (zone.regions) {
      for (const regionData of zone.regions) {
        if (regionData.provinces && regionData.provinces.includes(province)) {
          return zone;
        }
      }
    }

    // 주요 도시로 확인
    if (zone.majorCities && zone.majorCities.includes(city)) {
      return zone;
    }
  }

  return null;
}

/**
 * 모든 활성 배송 지역 목록
 */
function getActiveDeliveryZones() {
  return Object.entries(deliveryZones)
    .filter(([key, zone]) => zone.active)
    .map(([key, zone]) => ({
      code: key,
      name: zone.name,
      deliveryFee: zone.deliveryFee,
      freeDeliveryMinimum: zone.freeDeliveryMinimum,
      estimatedDelivery: zone.estimatedDelivery,
      priority: zone.priority
    }))
    .sort((a, b) => a.priority - b.priority);
}

/**
 * 특정 지역의 상세 정보
 */
function getZoneDetails(zoneCode) {
  for (const [key, zone] of Object.entries(deliveryZones)) {
    if (key === zoneCode || zone.code === zoneCode) {
      return zone;
    }
  }
  return null;
}

/**
 * Metro Manila 바랑가이 목록
 */
function getMetroManilaBarangays(city) {
  return deliveryZones.metro_manila.barangays[city] || [];
}

/**
 * 배송 가능 여부 확인
 */
function isDeliveryAvailable(address) {
  const zone = findDeliveryZone(address);
  return zone && zone.active;
}

/**
 * 배송비 할인 계산
 */
function calculateDeliveryDiscount(customerLevel, zone) {
  const discounts = {
    'bronze': 0.05,    // 5% 할인
    'silver': 0.10,    // 10% 할인
    'gold': 0.15,      // 15% 할인
    'platinum': 0.20   // 20% 할인
  };

  if (!zone || !zone.active) return 0;
  
  const discountRate = discounts[customerLevel] || 0;
  return Math.floor(zone.deliveryFee * discountRate);
}

/**
 * 예상 배송 날짜 계산
 */
function calculateEstimatedDelivery(address, orderDate = new Date()) {
  const zone = findDeliveryZone(address);
  if (!zone || !zone.active) return null;

  const estimatedDays = zone.estimatedDelivery.match(/\d+/g);
  if (!estimatedDays) return null;

  const minDays = parseInt(estimatedDays[0]);
  const maxDays = parseInt(estimatedDays[1] || estimatedDays[0]);

  const startDate = new Date(orderDate);
  startDate.setDate(startDate.getDate() + minDays);
  
  const endDate = new Date(orderDate);
  endDate.setDate(endDate.getDate() + maxDays);

  return {
    estimatedStart: startDate.toISOString().split('T')[0],
    estimatedEnd: endDate.toISOString().split('T')[0],
    businessDays: `${minDays}-${maxDays} days`
  };
}

module.exports = {
  deliveryZones,
  calculateDeliveryFee,
  findDeliveryZone,
  getActiveDeliveryZones,
  getZoneDetails,
  getMetroManilaBarangays,
  isDeliveryAvailable,
  calculateDeliveryDiscount,
  calculateEstimatedDelivery
};