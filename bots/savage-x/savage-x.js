#!/usr/bin/env node

// Savage-X Bot Launcher
// Entry point for the Admin Bot

require('dotenv').config();
const { SavageXConnector } = require('./connector.js');
const { getBotConfig } = require('../../shared/utils.js');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

class SavageXLauncher {
    constructor() {
        this.botType = 'savage-x';
        this.config = getBotConfig(this.botType);
        this.connector = null;
        this.isClusterMode = process.env.CLUSTER_MODE === 'true';
    }

    async start() {
        console.log(`
╔══════════════════════════════════════╗
║         𝕾𝔄𝔙𝔄𝔊𝔈-𝔛 𝕭𝔒𝔗            ║
╠══════════════════════════════════════╣
║  🦅 Type: Admin Bot                  ║
║  ⚡ Prefix: ${this.config.emoji} $                ║
║  🔐 Features: Admin + VIP            ║
║  🚀 Status: INITIALIZING...          ║
╚══════════════════════════════════════╝
        `);

        // Cluster mode for production
        if (this.isClusterMode && cluster.isMaster) {
            console.log(`🔄 Starting ${numCPUs} Savage-X instances...`);
            
            for (let i = 0; i < numCPUs; i++) {
                cluster.fork();
            }

            cluster.on('exit', (worker) => {
                console.log(`⚠️ Worker ${worker.process.pid} died. Restarting...`);
                cluster.fork();
            });
            
            return;
        }

        // Single instance mode
        await this.launchBot();
    }

    async launchBot() {
        try {
            this.connector = new SavageXConnector(this.config);
            
            // Start connection
            await this.connector.connect();
            
            // Setup graceful shutdown
            this.setupShutdownHandlers();
            
            console.log(`
╔══════════════════════════════════════╗
║         𝕾𝔄𝔙𝔄𝔊𝔈-𝔛 𝕭𝔒𝔗            ║
╠══════════════════════════════════════╣
║  🟢 STATUS: ONLINE                   ║
║  👤 OPERATOR: 𝕾𝖆𝖛𝖆𝖌𝖾 𝕭𝖔𝖞          ║
║  ⚡ PREFIX: $                        ║
║  💠 MODE: 𝙿𝚁𝙸𝚅𝙰𝚃𝙴                ║
║  🖥️ WORKER: ${cluster.worker?.id || 'MASTER'}                    ║
╚══════════════════════════════════════╝
            `);
            
        } catch (error) {
            console.error('❌ Failed to launch Savage-X:', error);
            process.exit(1);
        }
    }

    setupShutdownHandlers() {
        const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
        
        signals.forEach(signal => {
            process.on(signal, async () => {
                console.log(`\n⚠️ ${signal} received. Shutting down Savage-X gracefully...`);
                
                if (this.connector) {
                    await this.connector.disconnect();
                }
                
                console.log('👋 Savage-X shutdown complete.');
                process.exit(0);
            });
        });

        // Handle uncaught errors
        process.on('uncaughtException', (error) => {
            console.error('💀 Uncaught Exception:', error);
            // Don't exit, keep running
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error('⚠️ Unhandled Rejection at:', promise, 'reason:', reason);
        });
    }

    async restart() {
        console.log('🔄 Restarting Savage-X...');
        if (this.connector) {
            await this.connector.disconnect();
        }
        await this.launchBot();
    }
}

// Start bot if run directly
if (require.main === module) {
    const launcher = new SavageXLauncher();
    launcher.start().catch(console.error);
}

module.exports = { SavageXLauncher };
