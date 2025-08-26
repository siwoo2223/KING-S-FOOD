/**
 * 필리핀 전자상거래 플랫폼 메인 애플리케이션
 * Laravel-style Node.js/Express 아키텍처
 * 
 * @author Philippines E-Commerce Team
 * @version 1.0.0
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');

// Import configuration and utilities
const config = require('./config/app');
const logger = require('./utils/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Import routes
const webRoutes = require('./routes/web');
const apiRoutes = require('./routes/api');

class PhilippinesECommerceApp {
  constructor() {
    this.app = express();
    this.port = config.app.port;
    this.environment = config.app.env;
    
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Initialize middleware stack
   */
  initializeMiddleware() {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com", "https://cdn.tailwindcss.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
          imgSrc: ["'self'", "data:", "https:", "blob:"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.tailwindcss.com", "https://cdnjs.cloudflare.com"],
          connectSrc: ["'self'", "https:"],
        },
      },
    }));

    // CORS configuration for Philippines timezone
    this.app.use(cors({
      origin: config.cors.origin,
      credentials: config.cors.credentials,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'X-Philippines-Timezone',
        'X-Currency-PHP'
      ]
    }));

    // Request compression
    this.app.use(compression());

    // Request logging
    this.app.use(morgan('combined', {
      stream: {
        write: (message) => logger.info(message.trim())
      }
    }));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Static files
    this.app.use(express.static(path.join(__dirname, '../public')));

    // Philippines timezone middleware
    this.app.use((req, res, next) => {
      req.timezone = 'Asia/Manila';
      res.setHeader('X-Timezone', 'Asia/Manila');
      res.setHeader('X-Currency', 'PHP');
      res.setHeader('X-Locale', 'en-PH');
      next();
    });

    // Request ID middleware for tracking
    this.app.use((req, res, next) => {
      req.id = require('crypto').randomUUID();
      res.setHeader('X-Request-ID', req.id);
      next();
    });
  }

  /**
   * Initialize application routes
   */
  initializeRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        timezone: 'Asia/Manila',
        environment: this.environment,
        version: '1.0.0',
        services: {
          database: 'connected', // Will be updated when DB is connected
          redis: 'connected',     // Will be updated when Redis is connected
          ecount_api: 'configured'
        }
      });
    });

    // API routes
    this.app.use('/api/v1', apiRoutes);
    
    // Web routes (for admin panel and customer frontend)
    this.app.use('/', webRoutes);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        message: 'Philippines E-Commerce Platform API',
        version: '1.0.0',
        timezone: 'Asia/Manila',
        currency: 'PHP (₱)',
        documentation: '/api/docs',
        health: '/health'
      });
    });
  }

  /**
   * Initialize error handling
   */
  initializeErrorHandling() {
    // 404 handler
    this.app.use(notFound);
    
    // Global error handler
    this.app.use(errorHandler);
  }

  /**
   * Start the server
   */
  start() {
    try {
      this.server = this.app.listen(this.port, '0.0.0.0', () => {
        logger.info(`🇵🇭 Philippines E-Commerce Platform started!`);
        logger.info(`🚀 Server running on port ${this.port}`);
        logger.info(`🌍 Environment: ${this.environment}`);
        logger.info(`⏰ Timezone: Asia/Manila`);
        logger.info(`💱 Currency: PHP (₱)`);
        logger.info(`📍 Health check: http://localhost:${this.port}/health`);
        logger.info(`📚 API docs: http://localhost:${this.port}/api/docs`);
      });

      // Graceful shutdown
      process.on('SIGTERM', () => this.gracefulShutdown('SIGTERM'));
      process.on('SIGINT', () => this.gracefulShutdown('SIGINT'));
      
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  /**
   * Graceful shutdown handler
   */
  gracefulShutdown(signal) {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);
    
    this.server.close((error) => {
      if (error) {
        logger.error('Error during server shutdown:', error);
        process.exit(1);
      }
      
      logger.info('Server closed successfully');
      process.exit(0);
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      logger.error('Forcing shutdown due to timeout');
      process.exit(1);
    }, 30000);
  }
}

// Start the application
if (require.main === module) {
  const app = new PhilippinesECommerceApp();
  app.start();
}

module.exports = PhilippinesECommerceApp;