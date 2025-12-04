const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { handleMessage } = require('../../shared/message-handler.js');
const { MediaHandler } = require('../../shared/media-handler.js');
const { 
    isVIP, 
    isAdminUser, 
    getBotPrefix,
    formatTime 
} = require('../../shared/utils.js');

class SavageXConnector {
    constructor(config) {
        this.botType = 'savage-x';
        this.prefix = '$';
        this.config = config;
        this.client = null;
        this.isConnected = false;
        this.userCache = new Map();
        this.lastActivity = Date.now();
        
        // Admin & VIP lists
        this.adminUsers = new Set();
        this.vipUsers = new Set();
        
        // Load initial users
        this.loadUserLists();
    }

    async connect() {
        console.log('🔌 Connecting Savage-X to WhatsApp...');
        
        this.client = new Client({
            authStrategy: new LocalAuth({ 
                clientId: 'savage-x-bot',
                dataPath: './auth/savage-x' 
            }),
            puppeteer: {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ]
            },
            webVersionCache: {
                type: 'remote',
                remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
            }
        });

        // Setup event handlers
        this.setupEventHandlers();

        // Initialize client
        await this.client.initialize();
        
        console.log('✅ Savage-X client initialized.');
    }

    setupEventHandlers() {
        // QR Code Generation
        this.client.on('qr', (qr) => {
            console.log('📱 Savage-X QR Code Generated. Scan with WhatsApp.');
            qrcode.generate(qr, { small: true });
            
            // Save QR to file (optional)
            require('qrcode').toFile('./savage-x-qr.png', qr, (err) => {
                if (!err) console.log('💾 QR saved as savage-x-qr.png');
            });
        });

        // Ready Event
        this.client.on('ready', () => {
            this.isConnected = true;
            this.lastActivity = Date.now();
            
            console.log(`
╔══════════════════════════════════════╗
║      𝕾𝔄𝔙𝔄𝔊𝔈-𝔛 𝕮𝕺𝕹𝕹𝕰𝕮𝕿𝕰𝕯        ║
╠══════════════════════════════════════╣
║  🟢 STATUS: CONNECTED                ║
║  📱 USER: ${this.client.info.pushname}          ║
║  🆔 WID: ${this.client.info.wid.user}           ║
║  ⏰ TIME: ${formatTime()}            ║
╚══════════════════════════════════════╝
            `);
            
            // Set status
            this.client.setStatus('🦅 Savage-X Bot | Admin & VIP Commands | Prefix: $');
        });

        // Message Handler
        this.client.on('message_create', async (message) => {
            this.lastActivity = Date.now();
            
            // Ignore if message is from the bot itself
            if (message.fromMe) return;
            
            try {
                // Process message through shared handler
                const response = await handleMessage(message, this.botType);
                
                if (response) {
                    // Check if it's an emoji reaction
                    if (response.length === 2 && /[\u{1F300}-\u{1F9FF}]/u.test(response)) {
                        await message.react(response);
                    } else {
                        // Send text response
                        await message.reply(response);
                        
                        // Log command usage
                        this.logCommand(message.from, message.body, response);
                    }
                }
            } catch (error) {
                console.error('❌ Error processing message:', error);
                
                // Send error message only if it's a command
                if (message.body.startsWith(this.prefix)) {
                    const errorMsg = `❌ Savage-X Error: ${error.message || 'Unknown error'}`;
                    await message.reply(errorMsg);
                }
            }
        });

        // Auth Failure
        this.client.on('auth_failure', (msg) => {
            console.error('❌ Savage-X Authentication Failed:', msg);
            this.isConnected = false;
        });

        // Disconnected
        this.client.on('disconnected', (reason) => {
            console.log(`⚠️ Savage-X Disconnected: ${reason}`);
            this.isConnected = false;
            
            // Attempt reconnect after 10 seconds
            setTimeout(() => {
                if (!this.isConnected) {
                    console.log('🔄 Attempting to reconnect Savage-X...');
                    this.client.initialize();
                }
            }, 10000);
        });

        // Loading Screen
        this.client.on('loading_screen', (percent, message) => {
            console.log(`🔄 Savage-X Loading: ${percent}% - ${message}`);
        });
    }

    loadUserLists() {
        // Load from environment or config
        const adminList = process.env.ADMIN_USERS?.split(',') || [];
        const vipList = process.env.VIP_USERS?.split(',') || [];
        
        adminList.forEach(user => this.adminUsers.add(user));
        vipList.forEach(user => this.vipUsers.add(user));
        
        console.log(`👑 Loaded ${this.adminUsers.size} admins for Savage-X`);
        console.log(`⭐ Loaded ${this.vipUsers.size} VIPs for Savage-X`);
    }

    logCommand(sender, command, response) {
        const timestamp = formatTime();
        const logEntry = `[${timestamp}] ${sender} -> ${command} -> ${response.substring(0, 50)}...`;
        
        console.log(`📝 ${logEntry}`);
        
        // Save to file (optional)
        const fs = require('fs');
        fs.appendFileSync('./logs/savage-x-commands.log', logEntry + '\n');
    }

    async disconnect() {
        if (this.client) {
            console.log('🔌 Disconnecting Savage-X...');
            await this.client.destroy();
            this.isConnected = false;
            console.log('✅ Savage-X disconnected.');
        }
    }

    async sendMessage(to, message) {
        if (!this.isConnected) {
            throw new Error('Savage-X is not connected');
        }
        
        return await this.client.sendMessage(to, message);
    }

    async broadcast(message, filter = () => true) {
        if (!this.isConnected) return;
        
        const chats = await this.client.getChats();
        const targetChats = chats.filter(filter);
        
        console.log(`📢 Savage-X broadcasting to ${targetChats.length} chats...`);
        
        for (const chat of targetChats) {
            try {
                await this.client.sendMessage(chat.id._serialized, message);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
            } catch (error) {
                console.error(`Failed to send to ${chat.id._serialized}:`, error);
            }
        }
        
        console.log('✅ Broadcast complete.');
    }

    getStats() {
        return {
            botType: this.botType,
            isConnected: this.isConnected,
            uptime: Date.now() - this.lastActivity,
            adminCount: this.adminUsers.size,
            vipCount: this.vipUsers.size,
            prefix: this.prefix
        };
    }
}

module.exports = { SavageXConnector };
