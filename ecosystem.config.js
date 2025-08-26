/**
 * PM2 Ecosystem Configuration
 * 필리핀 전자상거래 플랫폼 프로세스 관리
 */

module.exports = {
  apps: [
    {
      name: 'philippines-ecommerce',
      script: 'src/app.js',
      instances: 1,
      exec_mode: 'cluster',
      
      // 환경 설정
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        TZ: 'Asia/Manila'
      },
      
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        TZ: 'Asia/Manila'
      },
      
      // 로그 설정
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // 재시작 정책
      autorestart: true,
      watch: false, // 프로덕션에서는 false
      max_memory_restart: '512M',
      
      // 개발 환경에서만 파일 감시
      ignore_watch: [
        'node_modules',
        'logs',
        'public/uploads',
        '.git',
        '*.log'
      ],
      
      // 시작 지연
      wait_ready: true,
      listen_timeout: 10000,
      kill_timeout: 5000,
      
      // 인스턴스 설정
      min_uptime: '10s',
      max_restarts: 10,
      
      // cron 재시작 (매일 새벽 3시 - 필리핀 시간)
      cron_restart: '0 3 * * *',
      
      // 메타데이터
      instance_var: 'INSTANCE_ID',
      
      // 추가 옵션
      merge_logs: true,
      time: true
    },
    
    // ECOUNT 동기화 워커 (별도 프로세스)
    {
      name: 'ecount-sync-worker',
      script: 'src/workers/ecount-sync.js',
      instances: 1,
      exec_mode: 'fork',
      
      env: {
        NODE_ENV: 'development',
        WORKER_TYPE: 'ecount-sync',
        TZ: 'Asia/Manila'
      },
      
      env_production: {
        NODE_ENV: 'production',
        WORKER_TYPE: 'ecount-sync',
        TZ: 'Asia/Manila'
      },
      
      log_file: './logs/ecount-worker.log',
      out_file: './logs/ecount-worker-out.log',
      error_file: './logs/ecount-worker-error.log',
      
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      
      // ECOUNT 동기화는 5분마다 실행
      cron_restart: '*/5 * * * *',
      
      min_uptime: '10s',
      max_restarts: 5
    },
    
    // 결제 웹훅 처리 워커
    {
      name: 'payment-webhook-worker',
      script: 'src/workers/payment-webhook.js',
      instances: 1,
      exec_mode: 'fork',
      
      env: {
        NODE_ENV: 'development',
        WORKER_TYPE: 'payment-webhook',
        TZ: 'Asia/Manila'
      },
      
      env_production: {
        NODE_ENV: 'production',
        WORKER_TYPE: 'payment-webhook',
        TZ: 'Asia/Manila'
      },
      
      log_file: './logs/webhook-worker.log',
      out_file: './logs/webhook-worker-out.log',
      error_file: './logs/webhook-worker-error.log',
      
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      
      min_uptime: '10s',
      max_restarts: 10
    }
  ],

  // 배포 설정 (추후 사용)
  deploy: {
    production: {
      user: 'deploy',
      host: 'your-production-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:your-repo/philippines-ecommerce.git',
      path: '/var/www/philippines-ecommerce',
      
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      
      env: {
        NODE_ENV: 'production',
        TZ: 'Asia/Manila'
      }
    },
    
    staging: {
      user: 'deploy',
      host: 'your-staging-server.com',
      ref: 'origin/develop',
      repo: 'git@github.com:your-repo/philippines-ecommerce.git',
      path: '/var/www/philippines-ecommerce-staging',
      
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env staging',
      
      env: {
        NODE_ENV: 'staging',
        TZ: 'Asia/Manila'
      }
    }
  }
};