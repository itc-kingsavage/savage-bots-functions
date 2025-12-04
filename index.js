// ============================================
// 🦅 SAVAGE BOTS FX - POWER CORE
// ============================================

import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import pino from 'pino';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import redis from 'redis';
import cluster from 'cluster';
import os from 'os';

// ========== CONFIGURATION ==========
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';
const CPU_COUNT = os.cpus().length;

// ========== LOGGER (ULTRA FAST) ==========
const logger = pino({
  level: IS_PRODUCTION ? 'info' : 'debug',
  transport: IS_PRODUCTION ? undefined : {
    target: 'pino-pretty',
    options: { colorize: true }
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent']
    }),
    err: pino.stdSerializers.err
  }
});

// ========== RATE LIMITING ==========
const rateLimiter = new RateLimiterMemory({
  points: 100, // requests
  duration: 60, // per minute
  blockDuration: 300 // block for 5 minutes if exceeded
});

// ========== REDIS CACHE ==========
let redisClient;
try {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });
  redisClient.on('error', (err) => logger.warn(`Redis: ${err.message}`));
  redisClient.connect();
  logger.info('✅ Redis cache connected');
} catch (err) {
  logger.warn('⚠️ Redis not available, using memory cache');
  redisClient = null;
}

// ========== CLUSTER MODE ==========
if (cluster.isPrimary && IS_PRODUCTION) {
  logger.info(`🔄 Starting ${CPU_COUNT} worker processes`);
  
  for (let i = 0; i < CPU_COUNT; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker, code, signal) => {
    logger.error(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
  
  // Master process only - no bot initialization
  process.exit(0);
}

// ========== BOT IMPORTS ==========
import savageXConnector from './bots/savage-x/connector.js';
import deUnknownConnector from './bots/de-unknown/connector.js';
import queenRixieConnector from './bots/queen-rixie/connector.js';

// ========== EXPRESS APP ==========
const app = express();
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ========== RATE LIMIT MIDDLEWARE ==========
app.use(async (req, res, next) => {
  try {
    const clientIP = req.ip || req.connection.remoteAddress;
    await rateLimiter.consume(clientIP);
    next();
  } catch (rateLimiterRes) {
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.ceil(rateLimiterRes.msBeforeNext / 1000)
    });
  }
});

// ========== HEALTH CHECK ==========
app.get('/health', async (req, res) => {
  const health = {
    status: '🟢 ONLINE',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    botCount: botManager?.activeBots?.size || 0,
    worker: cluster.worker?.id || 'single'
  };
  
  res.json(health);
});

// ========== BOT STATUS API ==========
app.get('/api/bots', (req, res) => {
  const bots = Array.from(botManager.activeBots).map(botName => ({
    name: botName,
    status: 'online',
    prefix: botName === 'savage-x' ? '$' : '.',
    commands: botManager.getBot(botName)?.commandCount || 0
  }));
  
  res.json({ bots, total: bots.length });
});

// ========== BOT MANAGER ==========
export class BotManager {
  constructor() {
    this.bots = new Map();
    this.activeBots = new Set();
    this.stats = {
      totalCommands: 0,
      totalUsers: 0,
      startTime: Date.now()
    };
  }
  
  async registerBot(name, connector, config = {}) {
    try {
      const botInstance = await connector(config);
      this.bots.set(name, botInstance);
      this.activeBots.add(name);
      
      logger.info(`🤖 ${name.toUpperCase()} activated (Prefix: ${config.prefix || '$'})`);
      
      // Track bot stats
      botInstance.on('command', () => {
        this.stats.totalCommands++;
      });
      
      return botInstance;
    } catch (error) {
      logger.error(`Failed to register ${name}: ${error.message}`);
      throw error;
    }
  }
  
  getBot(name) {
    return this.bots.get(name);
  }
  
  getAllBots() {
    return Array.from(this.bots.values());
  }
  
  async restartBot(name) {
    const bot = this.bots.get(name);
    if (bot && bot.restart) {
      await bot.restart();
      logger.info(`🔄 ${name} restarted`);
    }
  }
  
  getStats() {
    return {
      ...this.stats,
      uptime: Date.now() - this.stats.startTime,
      activeBots: this.activeBots.size
    };
  }
}

// ========== GLOBAL INSTANCE ==========
const botManager = new BotManager();

// ========== BOT CONFIGURATIONS ==========
const BOT_CONFIGS = {
  'savage-x': { prefix: '$', mode: 'hyper', admin: true },
  'de-unknown': { prefix: '.', mode: 'mystery', theme: 'dark' },
  'queen-rixie': { prefix: '.', mode: 'royal', theme: 'gold' }
};

// ========== INITIALIZE BOTS ==========
async function initializeBots() {
  logger.info('🦅 SAVAGE BOTS FX - Initializing Power Core...');
  
  try {
    // Initialize each bot with its config
    await botManager.registerBot('savage-x', savageXConnector, BOT_CONFIGS['savage-x']);
    await botManager.registerBot('de-unknown', deUnknownConnector, BOT_CONFIGS['de-unknown']);
    await botManager.registerBot('queen-rixie', queenRixieConnector, BOT_CONFIGS['queen-rixie']);
    
    logger.info('✅ All bots activated successfully');
    logger.info(`📊 Prefix Configuration:`);
    logger.info(`   Savage-X: ${BOT_CONFIGS['savage-x'].prefix}`);
    logger.info(`   De-Unknown: ${BOT_CONFIGS['de-unknown'].prefix}`);
    logger.info(`   Queen-Rixie: ${BOT_CONFIGS['queen-rixie'].prefix}`);
    
    return botManager;
  } catch (error) {
    logger.error(`❌ Bot initialization failed: ${error.message}`);
    process.exit(1);
  }
}

// ========== SOCKET.IO FOR REAL-TIME ==========
const httpServer = createServer(app);
const io = new SocketServer(httpServer, {
  cors: { origin: '*' },
  transports: ['websocket', 'polling']
});

io.on('connection', (socket) => {
  logger.debug(`Socket connected: ${socket.id}`);
  
  socket.on('bot:command', (data) => {
    // Handle real-time commands
    io.emit('command:executed', { ...data, timestamp: Date.now() });
  });
  
  socket.on('disconnect', () => {
    logger.debug(`Socket disconnected: ${socket.id}`);
  });
});

// ========== ERROR HANDLING ==========
process.on('uncaughtException', (error) => {
  logger.error(`UNCAUGHT EXCEPTION: ${error.message}`);
  logger.error(error.stack);
  // Don't exit in production, try to recover
  if (!IS_PRODUCTION) process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`UNHANDLED REJECTION at: ${promise}, reason: ${reason}`);
});

// ========== GRACEFUL SHUTDOWN ==========
const gracefulShutdown = async () => {
  logger.info('🛑 Received shutdown signal, cleaning up...');
  
  // Disconnect all bots
  for (const [name, bot] of botManager.bots) {
    if (bot.disconnect) {
      await bot.disconnect();
      logger.info(`📴 ${name} disconnected`);
    }
  }
  
  // Close Redis
  if (redisClient) {
    await redisClient.quit();
    logger.info('🔒 Redis disconnected');
  }
  
  // Close server
  httpServer.close(() => {
    logger.info('🚪 HTTP server closed');
    process.exit(0);
  });
  
  // Force exit after 10 seconds
  setTimeout(() => {
    logger.error('⚠️ Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// ========== START SERVER ==========
async function startServer() {
  try {
    // Initialize bots
    await initializeBots();
    
    // Start HTTP server
    httpServer.listen(PORT, () => {
      logger.info(`
      ============================================
      🦅 SAVAGE BOTS FX - POWER CORE ONLINE
      ============================================
      🚀 Port: ${PORT}
      📍 Environment: ${NODE_ENV}
      👷 Worker: ${cluster.worker?.id || 'single'}
      🤖 Active Bots: ${botManager.activeBots.size}
      ⏱️  Started: ${new Date().toLocaleTimeString()}
      ============================================
      `);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

// ========== EXPORTS ==========
export {
  savageXConnector,
  deUnknownConnector,
  queenRixieConnector,
  botManager,
  initializeBots,
  logger,
  redisClient
};

// ========== START EVERYTHING ==========
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

export default botManager;
