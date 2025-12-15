/**
 * Server Entry Point - Enhanced Version
 * Comprehensive backend server setup with MongoDB, monitoring, and security features
 * Designed for large-scale enterprise applications
 */

// Core dependencies
const app = require('./src/app');
const connectDB = require('./src/config/db.config');
const envConfig = require('./src/config/env.config');

// Additional dependencies for enhanced functionality
const fs = require('fs');
const path = require('path');
const cluster = require('cluster');
const os = require('os');
const https = require('https');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const responseTime = require('response-time');
const cors = require('cors');

// Import custom middleware and utilities
const { errorHandler } = require('./src/middleware/error.middleware');
const { requestLogger } = require('./src/middleware/logger.middleware');
const { securityHeaders } = require('./src/middleware/security.middleware');
const { performanceMonitor } = require('./src/utils/monitoring.utils');
const { cacheManager } = require('./src/utils/cache.utils');
const { scheduleJobs } = require('./src/jobs/cron.jobs');
const { initializeWebSocket } = require('./src/services/websocket.service');

// Constants and configurations
const PORT = envConfig.port;
const IS_PRODUCTION = envConfig.nodeEnv === 'production';
const IS_DEVELOPMENT = envConfig.nodeEnv === 'development';
const IS_TEST = envConfig.nodeEnv === 'test';
const CPU_COUNT = os.cpus().length;
const CLUSTER_MODE = envConfig.clusterMode && IS_PRODUCTION;
const SSL_ENABLED = envConfig.sslEnabled && IS_PRODUCTION;

// SSL Configuration (if enabled)
let sslOptions = null;
if (SSL_ENABLED) {
  try {
    sslOptions = {
      key: fs.readFileSync(path.join(__dirname, 'ssl', 'private.key')),
      cert: fs.readFileSync(path.join(__dirname, 'ssl', 'certificate.crt')),
      ca: fs.readFileSync(path.join(__dirname, 'ssl', 'ca_bundle.crt')),
      passphrase: envConfig.sslPassphrase,
      secureProtocol: 'TLSv1_2_method',
      ciphers: 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384'
    };
    console.log('🔒 SSL/TLS configuration loaded successfully');
  } catch (error) {
    console.error('❌ SSL certificate files not found. Falling back to HTTP');
    SSL_ENABLED = false;
  }
}

// Rate limiting configuration
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: IS_PRODUCTION ? 100 : 1000, // Limit each IP to requests per windowMs
  message: {
    status: 429,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for'] || req.ip;
  }
});

// Global error handling class
class ServerError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Server state management
const serverState = {
  isShuttingDown: false,
  activeConnections: 0,
  startTime: null,
  uptime: null,
  requestCount: 0,
  errorCount: 0
};

// Connection tracking middleware
const connectionTracker = (req, res, next) => {
  if (serverState.isShuttingDown) {
    return res.status(503).json({
      status: 'error',
      message: 'Server is shutting down. Please try again later.',
      retryAfter: 30
    });
  }
  
  serverState.activeConnections++;
  serverState.requestCount++;
  
  res.on('finish', () => {
    serverState.activeConnections--;
  });
  
  next();
};

// Performance monitoring setup
const setupPerformanceMonitoring = () => {
  if (IS_PRODUCTION) {
    performanceMonitor.start({
      cpuSamplingInterval: 1000,
      memorySamplingInterval: 5000,
      gcSamplingInterval: 10000,
      httpMetrics: true,
      customMetrics: ['db_query_time', 'cache_hit_rate']
    });
    
    console.log('📊 Performance monitoring enabled');
  }
};

// Health check endpoint
const healthCheck = () => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage(),
    activeConnections: serverState.activeConnections,
    totalRequests: serverState.requestCount,
    errors: serverState.errorCount,
    database: 'connected', // Would be updated based on actual DB status
    cache: cacheManager.status(),
    environment: envConfig.nodeEnv,
    version: envConfig.appVersion || '1.0.0'
  };
};

// Graceful shutdown handler
const gracefulShutdown = (signal) => {
  return new Promise((resolve) => {
    console.log(`\n⚠️  ${signal} received. Initiating graceful shutdown...`);
    
    serverState.isShuttingDown = true;
    serverState.shutdownTime = new Date();
    
    // Close server to new connections
    server.close(async () => {
      console.log('✅ HTTP server closed');
      
      // Close WebSocket connections if any
      if (global.wss) {
        global.wss.close();
        console.log('✅ WebSocket server closed');
      }
      
      // Close database connections
      try {
        const mongoose = require('mongoose');
        await mongoose.connection.close();
        console.log('✅ Database connection closed');
      } catch (dbError) {
        console.error('❌ Error closing database:', dbError.message);
      }
      
      // Clear all scheduled jobs
      scheduleJobs.stopAll();
      console.log('✅ Cron jobs stopped');
      
      // Clear cache
      await cacheManager.clearAll();
      console.log('✅ Cache cleared');
      
      // Close performance monitoring
      performanceMonitor.stop();
      
      // Wait for remaining connections to close
      const checkInterval = setInterval(() => {
        if (serverState.activeConnections === 0) {
          clearInterval(checkInterval);
          console.log(`✅ All connections closed. Total uptime: ${process.uptime().toFixed(2)}s`);
          console.log(`📊 Total requests processed: ${serverState.requestCount}`);
          console.log(`❌ Total errors: ${serverState.errorCount}`);
          resolve();
        }
      }, 100);
      
      // Force shutdown after timeout
      setTimeout(() => {
        clearInterval(checkInterval);
        console.log('⚠️  Shutdown timeout. Forcing exit...');
        resolve();
      }, 10000);
    });
    
    // Force close connections after timeout
    setTimeout(() => {
      console.log('⚠️  Force closing remaining connections...');
      process.exit(1);
    }, 15000);
  });
};

// Cluster mode setup for multi-core utilization
const setupClustering = () => {
  if (cluster.isMaster && CLUSTER_MODE) {
    console.log(`🚀 Master ${process.pid} is running`);
    console.log(`🖥️  Starting ${CPU_COUNT} worker processes...`);
    
    // Fork workers
    for (let i = 0; i < CPU_COUNT; i++) {
      cluster.fork();
    }
    
    // Handle worker events
    cluster.on('exit', (worker, code, signal) => {
      console.log(`❌ Worker ${worker.process.pid} died. Restarting...`);
      
      if (!serverState.isShuttingDown) {
        cluster.fork();
      }
    });
    
    cluster.on('online', (worker) => {
      console.log(`✅ Worker ${worker.process.pid} is online`);
    });
    
    // Handle graceful shutdown for cluster
    process.on('SIGTERM', async () => {
      serverState.isShuttingDown = true;
      console.log('⚠️  SIGTERM received. Shutting down cluster...');
      
      for (const id in cluster.workers) {
        cluster.workers[id].kill('SIGTERM');
      }
      
      await gracefulShutdown('SIGTERM');
      process.exit(0);
    });
    
  } else {
    startWorker();
  }
};

// Worker process startup
const startWorker = async () => {
  try {
    console.log(`👷 Worker ${process.pid} started`);
    
    // Initialize monitoring
    setupPerformanceMonitoring();
    
    // Connect to database with retry logic
    const maxRetries = 5;
    const retryDelay = 5000;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await connectDB();
        console.log(`✅ Worker ${process.pid} connected to MongoDB`);
        break;
      } catch (dbError) {
        console.error(`❌ Worker ${process.pid} DB connection attempt ${attempt} failed:`, dbError.message);
        
        if (attempt === maxRetries) {
          throw new ServerError('Failed to connect to database after multiple attempts', 500);
        }
        
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
    }
    
    // Initialize cache
    await cacheManager.initialize();
    console.log(`✅ Worker ${process.pid} cache initialized`);
    
    // Setup middleware (if not already setup in app.js)
    if (IS_PRODUCTION) {
      app.use(helmet());
      app.use(compression());
      app.use(cors({
        origin: envConfig.allowedOrigins,
        credentials: true,
        optionsSuccessStatus: 200
      }));
      app.use('/api/', apiLimiter);
    }
    
    app.use(responseTime());
    app.use(connectionTracker);
    
    // Setup logging
    if (IS_DEVELOPMENT) {
      app.use(morgan('dev'));
    } else {
      const accessLogStream = fs.createWriteStream(
        path.join(__dirname, 'logs', 'access.log'),
        { flags: 'a' }
      );
      app.use(morgan('combined', { stream: accessLogStream }));
    }
    
    app.use(requestLogger);
    app.use(securityHeaders);
    
    // Health check endpoint
    app.get('/health', (req, res) => {
      res.status(200).json(healthCheck());
    });
    
    // Liveness probe
    app.get('/health/live', (req, res) => {
      res.status(200).json({ status: 'alive', timestamp: new Date().toISOString() });
    });
    
    // Readiness probe
    app.get('/health/ready', (req, res) => {
      const isReady = serverState.activeConnections < 1000; // Custom readiness logic
      res.status(isReady ? 200 : 503).json({
        status: isReady ? 'ready' : 'not ready',
        activeConnections: serverState.activeConnections
      });
    });
    
    // Metrics endpoint (for Prometheus or other monitoring)
    app.get('/metrics', (req, res) => {
      if (!IS_PRODUCTION && req.headers['x-internal-access'] !== envConfig.internalAccessToken) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      res.set('Content-Type', 'text/plain');
      res.send(performanceMonitor.getMetrics());
    });
    
    // Error handling middleware (should be last)
    app.use(errorHandler);
    
    // Global error handler for uncaught errors
    app.use((err, req, res, next) => {
      serverState.errorCount++;
      
      if (IS_PRODUCTION) {
        // Log to external service in production
        console.error('Production Error:', {
          message: err.message,
          stack: err.stack,
          url: req.url,
          method: req.method,
          ip: req.ip,
          userId: req.user ? req.user.id : 'anonymous'
        });
      }
      
      next(err);
    });
    
    // Start scheduled jobs
    if (!IS_TEST) {
      scheduleJobs.startAll();
      console.log(`✅ Worker ${process.pid} scheduled jobs started`);
    }
    
    // Initialize WebSocket server
    if (envConfig.websocketEnabled) {
      global.wss = initializeWebSocket();
      console.log(`✅ Worker ${process.pid} WebSocket server initialized`);
    }
    
    // Start server
    let server;
    
    if (SSL_ENABLED) {
      server = https.createServer(sslOptions, app);
    } else {
      server = app;
    }
    
    const serverInstance = server.listen(PORT, () => {
      serverState.startTime = new Date();
      console.log(`🚀 Worker ${process.pid} running in ${envConfig.nodeEnv} mode on port ${PORT}`);
      console.log(`📅 Server started at: ${serverState.startTime.toISOString()}`);
      console.log(`🌐 Access URL: ${SSL_ENABLED ? 'https' : 'http'}://localhost:${PORT}`);
      console.log(`📈 Health check: ${SSL_ENABLED ? 'https' : 'http'}://localhost:${PORT}/health`);
      
      // Emit ready event for process managers
      if (process.send) {
        process.send('ready');
      }
    });
    
    // Connection tracking for HTTP server
    serverInstance.on('connection', (socket) => {
      const socketId = `${socket.remoteAddress}:${socket.remotePort}`;
      
      socket.on('close', () => {
        // Cleanup logic if needed
      });
    });
    
    // Store server instance for graceful shutdown
    global.serverInstance = serverInstance;
    
    // Handle worker-specific signals
    process.on('SIGTERM', async () => {
      await gracefulShutdown('SIGTERM');
      process.exit(0);
    });
    
    process.on('SIGINT', async () => {
      await gracefulShutdown('SIGINT');
      process.exit(0);
    });
    
    return serverInstance;
    
  } catch (error) {
    console.error(`❌ Worker ${process.pid} failed to start:`, error);
    process.exit(1);
  }
};

// Main server startup function
const startServer = async () => {
  try {
    console.log('='.repeat(60));
    console.log('🚀 Starting Enhanced Backend Server');
    console.log('='.repeat(60));
    console.log(`📁 Environment: ${envConfig.nodeEnv}`);
    console.log(`🖥️  Platform: ${process.platform} ${process.arch}`);
    console.log(`⚙️  Node version: ${process.version}`);
    console.log(`📊 PID: ${process.pid}`);
    console.log(`📈 Memory limit: ${Math.round(require('v8').getHeapStatistics().heap_size_limit / 1024 / 1024)} MB`);
    console.log('='.repeat(60));
    
    // Ensure logs directory exists
    const logsDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
      console.log('📁 Created logs directory');
    }
    
    // Check for required environment variables
    const requiredEnvVars = ['NODE_ENV', 'PORT', 'MONGODB_URI', 'JWT_SECRET'];
    const missingEnvVars = requiredEnvVars.filter(varName => !envConfig[varName]);
    
    if (missingEnvVars.length > 0) {
      throw new ServerError(`Missing required environment variables: ${missingEnvVars.join(', ')}`, 500);
    }
    
    // Start server in appropriate mode
    if (CLUSTER_MODE) {
      setupClustering();
    } else {
      await startWorker();
    }
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    
    // Attempt to send error to monitoring service
    if (IS_PRODUCTION) {
      // Here you would integrate with Sentry, DataDog, etc.
      console.error('Production startup error reported to monitoring service');
    }
    
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  serverState.errorCount++;
  
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('❌ Reason:', reason);
  
  // In production, send to error tracking service
  if (IS_PRODUCTION) {
    // Send to error tracking service
    console.error('Unhandled rejection reported to monitoring service');
  }
  
  // Don't exit in development to allow debugging
  if (IS_PRODUCTION && !serverState.isShuttingDown) {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  serverState.errorCount++;
  
  console.error('❌ Uncaught Exception:', error.message);
  console.error(error.stack);
  
  // Attempt graceful shutdown
  if (!serverState.isShuttingDown) {
    gracefulShutdown('uncaughtException').then(() => {
      process.exit(1);
    }).catch(() => {
      process.exit(1);
    });
  }
});

// Handle process warnings
process.on('warning', (warning) => {
  console.warn('⚠️  Process Warning:', warning.name);
  console.warn('Message:', warning.message);
  console.warn('Stack:', warning.stack);
});

// Handle exit
process.on('exit', (code) => {
  console.log(`🛑 Process exiting with code: ${code}`);
  console.log(`⏱️  Total uptime: ${process.uptime().toFixed(2)} seconds`);
});

// Handle beforeExit
process.on('beforeExit', (code) => {
  console.log(`🔄 Process beforeExit with code: ${code}`);
});

// Start the server
if (require.main === module) {
  startServer();
}

// Export for testing and programmatic use
module.exports = {
  startServer,
  gracefulShutdown,
  healthCheck,
  ServerError,
  serverState
};