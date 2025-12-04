// Shared Utility Functions for Savage Bots FX
// Location: shared/utils.js

const fs = require('fs');
const path = require('path');

// ==================== USER MANAGEMENT ====================
const vipUsers = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/vip-users.json'), 'utf8') || '[]');
const adminUsers = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/admin-users.json'), 'utf8') || '[]');

export function isVIP(userId) {
    return vipUsers.includes(userId) || process.env.VIP_USERS?.split(',').includes(userId);
}

export function isAdminUser(userId) {
    return adminUsers.includes(userId) || process.env.ADMIN_USERS?.split(',').includes(userId);
}

export function isGroupAdmin(participants, userId) {
    const participant = participants.find(p => p.id === userId);
    return participant?.isAdmin || false;
}

// ==================== BOT-SPECIFIC CHECKS ====================
export function isSavageXCommand(command, botType = 'savage-x') {
    const savageXExclusive = [
        'admin', 'vip', 'antilink', 'antibot', 'banword', 
        'active', 'online', 'setgp', 'setgn', 'promote', 'demote',
        'tagadm', 'tagall'
    ];
    
    if (botType === 'savage-x') return true;
    return !savageXExclusive.includes(command);
}

export function validateBotAccess(command, userId, botType) {
    // Admin/VIP commands only for Savage-X
    if (command.startsWith('admin') && botType !== 'savage-x') {
        return { allowed: false, reason: 'Admin commands exclusive to Savage-X' };
    }
    
    if (command.startsWith('vip') && botType !== 'savage-x') {
        return { allowed: false, reason: 'VIP commands exclusive to Savage-X' };
    }
    
    // VIP check for VIP commands
    if (command.startsWith('vip') && !isVIP(userId)) {
        return { allowed: false, reason: 'VIP access required' };
    }
    
    // Admin check for admin commands
    if (command.startsWith('admin') && !isAdminUser(userId)) {
        return { allowed: false, reason: 'Admin access required' };
    }
    
    return { allowed: true };
}

// ==================== TIME & FORMATTING ====================
export function formatTime(timezone = 'Africa/Lagos', format = 'full') {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour12: true,
        year: 'numeric',
        month: format === 'short' ? '2-digit' : 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: format === 'full' ? '2-digit' : undefined
    });
    return formatter.format(now);
}

export function getTimestamp() {
    return Math.floor(Date.now() / 1000);
}

export function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}

export function parseTime(timeStr) {
    const match = timeStr.match(/(\d+)\s*(s|m|h|d)/);
    if (!match) return null;
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    const multipliers = {
        's': 1000,
        'm': 60000,
        'h': 3600000,
        'd': 86400000
    };
    
    return value * multipliers[unit];
}

// ==================== VALIDATION ====================
export function validateArgs(args, minLength = 1) {
    return args && args.trim().length >= minLength;
}

export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function extractUrl(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
}

export function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ==================== TEXT PROCESSING ====================
export function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function sanitizeText(text) {
    return text.replace(/[`*_~|>#]/g, '\\$&');
}

export function chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

export function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ==================== RANDOM & HELPERS ====================
export function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

export function generateId(length = 8) {
    return Math.random().toString(36).substr(2, length);
}

export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ==================== MESSAGE HELPERS ====================
export function isGroupMessage(from) {
    return from.includes('@g.us');
}

export function getMentionedUsers(message) {
    if (!message.mentionedJidList) return [];
    return message.mentionedJidList.filter(jid => jid !== message.author);
}

// ==================== MODULE SYSTEM ====================
export function validateModuleCommand(command, moduleCommands) {
    return moduleCommands.includes(command);
}

export function getModulePath(moduleName, botType = 'savage-x') {
    return `../bots/${botType}/modules/${moduleName}.js`;
}

export function formatModuleResponse(response, moduleName) {
    const emoji = {
        'ai': '🤖', 'moderation': '🛡️', 'download': '📥',
        'fun': '🎮', 'tools': '🛠️', 'admin': '👑',
        'vip': '⭐', 'god': '🙏', 'media': '🎵'
    };
    return `${emoji[moduleName] || '🛠️'} ${capitalizeFirst(moduleName)}: ${response}`;
}

export function logModuleExecution(moduleName, command, userId, botType) {
    const timestamp = formatTime('UTC', 'short');
    console.log(`[${timestamp}] ${botType.toUpperCase()} | ${moduleName}.${command} | User: ${userId}`);
}

export function handleModuleError(moduleName, error, botType) {
    console.error(`[ERROR] ${botType} | ${moduleName}:`, error);
    return `❌ ${capitalizeFirst(moduleName)} module error: ${error.message || 'Unknown error'}`;
}

// ==================== COMMAND CATEGORIZATION ====================
export function getCommandCategory(command) {
    const categories = {
        // Savage-X Exclusive
        'admin': ['admin', 'backup', 'restore', 'logs', 'shutdown', 'update'],
        'vip': ['vip', 'priority', 'exclusive', 'ai', 'stealth'],
        'moderation': ['antilink', 'antibot', 'banword', 'promote', 'demote'],
        'analytics': ['active', 'online', 'stats', 'usage'],
        
        // Shared across bots
        'general': ['weather', 'currency', 'calc', 'time', 'remind', 'note', 'todo'],
        'ai': ['gpt', 'aiimg', 'translate', 'summary', 'ocr'],
        'fun': ['truth', 'dare', 'trivia', 'joke', 'meme', 'game'],
        'download': ['yt', 'ig', 'tiktok', 'fb', 'spotify'],
        'god': ['bible', 'prayer', 'devotional', 'sermon'],
        'media': ['tts', 'sticker', 'filter', 'music', 'lyrics'],
        'reaction': ['laugh', 'love', 'angry', 'fire', 'heart']
    };
    
    for (const [category, commands] of Object.entries(categories)) {
        if (commands.some(cmd => command.startsWith(cmd))) {
            return category;
        }
    }
    return 'general';
}

// ==================== BOT CONFIG HELPERS ====================
export function getBotPrefix(botType) {
    const prefixes = {
        'savage-x': '$',
        'de-unknown': '.',
        'queen-rixie': '.'
    };
    return prefixes[botType] || '$';
}

export function getBotConfig(botType) {
    const configs = {
        'savage-x': {
            name: 'Savage-X',
            emoji: '🦅',
            hasAdmin: true,
            hasVIP: true,
            exclusiveCommands: ['admin', 'vip', 'moderation', 'analytics']
        },
        'de-unknown': {
            name: 'De-Unknown',
            emoji: '🔮',
            hasAdmin: false,
            hasVIP: false,
            exclusiveCommands: []
        },
        'queen-rixie': {
            name: 'Queen-Rixie',
            emoji: '👑',
            hasAdmin: false,
            hasVIP: false,
            exclusiveCommands: []
        }
    };
    return configs[botType] || configs['savage-x'];
}

// ==================== EXPORTS ====================
module.exports = {
    // User Management
    isVIP,
    isAdminUser,
    isGroupAdmin,
    
    // Bot Access
    isSavageXCommand,
    validateBotAccess,
    
    // Time & Formatting
    formatTime,
    getTimestamp,
    formatDuration,
    parseTime,
    
    // Validation
    validateArgs,
    validateEmail,
    extractUrl,
    escapeRegex,
    
    // Text Processing
    capitalizeFirst,
    sanitizeText,
    chunkArray,
    formatBytes,
    
    // Random & Helpers
    getRandomItem,
    generateId,
    delay,
    
    // Message Helpers
    isGroupMessage,
    getMentionedUsers,
    
    // Module System
    validateModuleCommand,
    getModulePath,
    formatModuleResponse,
    logModuleExecution,
    handleModuleError,
    
    // Command Categorization
    getCommandCategory,
    
    // Bot Config
    getBotPrefix,
    getBotConfig
};
