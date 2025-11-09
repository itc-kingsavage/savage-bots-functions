// Utility functions for Savage Boy Bot
export function isVIP(userId) {
    const vipUsers = [
        '1234567890@c.us',
        '0987654321@c.us'
    ];
    return vipUsers.includes(userId);
}

export function formatTime() {
    return new Date().toLocaleString('en-US', {
        timeZone: 'Africa/Lagos',
        hour12: true,
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function validateArgs(args, minLength = 1) {
    return args && args.trim().length >= minLength;
}

export function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

export function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function sanitizeText(text) {
    return text.replace(/[`*_~|>#]/g, '\\$&');
}

export function generateId(length = 8) {
    return Math.random().toString(36).substr(2, length);
}

export function isAdmin(participants, userId) {
    return participants.find(p => p.id === userId)?.isAdmin || false;
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

export function extractUrl(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex);
}

export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

export function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function getTimestamp() {
    return Math.floor(Date.now() / 1000);
}

export function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    } else {
        return `${seconds}s`;
    }
}

export function isGroupMessage(message) {
    return message.from.includes('@g.us');
}

export function getMentionedUsers(message) {
    if (!message.mentionedJidList) return [];
    return message.mentionedJidList.filter(jid => jid !== message.author);
}
