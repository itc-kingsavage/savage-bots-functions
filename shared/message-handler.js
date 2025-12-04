// Updated Message Handler for Savage Bots FX
// Location: shared/message-handler.js

import { processCommand } from '../bots/savage-x/command-router.js';
import { processVIPCommand } from '../bots/savage-x/vip-commands.js';
import { processAdminCommand } from '../bots/savage-x/admin-commands.js';
import { 
    isVIP, 
    isAdminUser, 
    isSavageXCommand, 
    validateBotAccess,
    getBotPrefix,
    getBotConfig,
    isGroupMessage,
    getCommandCategory,
    getReactionEmoji,
    getMentionedUsers,
    shouldProcessMessage as validateMessage
} from './utils.js';

// Reaction mappings
const emojiReactions = {
    laugh: '😂', cry: '😢', angry: '😠', love: '❤️', fire: '🔥',
    poop: '💩', clown: '🤡', ghost: '👻', alien: '👽', robot: '🤖',
    thumbsup: '👍', hearteyes: '😍', thinking: '🤔', party: '🎉',
    cool: '😎', sick: '🤒', rich: '🤑', shush: '🤫', wave: '👋',
    flex: '💪'
};

export async function handleMessage(message, botType = 'savage-x') {
    // Message validation
    if (!validateMessage(message)) return null;
    
    const text = message.body?.trim() || '';
    const prefix = getBotPrefix(botType);
    const botConfig = getBotConfig(botType);
    
    // Check if message starts with correct prefix
    if (!text.startsWith(prefix)) return null;
    
    // Extract command and args
    const command = text.slice(prefix.length).split(' ')[0].toLowerCase();
    const args = text.slice(prefix.length + command.length + 1).trim();
    
    console.log(`📨 ${botConfig.name} | Command: ${command} | From: ${message.from}`);
    
    // Validate bot access for this command
    const access = validateBotAccess(command, message.from, botType);
    if (!access.allowed) {
        return `❌ ${access.reason}`;
    }
    
    // Check if command is allowed for this bot type
    if (!isSavageXCommand(command, botType)) {
        return `❌ Command "${command}" is exclusive to Savage-X bot`;
    }
    
    // Route to appropriate handler
    if (command.startsWith('admin')) {
        if (!isAdminUser(message.from)) {
            return '❌ Admin access required. Contact bot owner.';
        }
        return await processAdminCommand(command, args, message, botType);
    }
    
    if (command.startsWith('vip')) {
        if (!isVIP(message.from)) {
            return '❌ VIP access required. Use $viphelp for more info.';
        }
        return await processVIPCommand(command, args, message, botType);
    }
    
    // Check if it's a reaction command
    if (emojiReactions[command]) {
        return getReactionEmoji(command);
    }
    
    // Process regular command
    return await processCommand(command, args, message, botType);
}

export function routeGroupCommand(command, args, message, botType) {
    if (!isGroupMessage(message.from)) {
        return '❌ This command works only in groups';
    }
    
    const groupCommands = ['antilink', 'welcome', 'rules', 'promote', 'demote', 'banword'];
    
    // Savage-X exclusive group commands
    if (!botType === 'savage-x' && groupCommands.includes(command)) {
        return `❌ "${command}" is a Savage-X exclusive group command`;
    }
    
    return groupCommands.includes(command);
}

export function validateCommandAccess(command, user, botType, isGroup = false) {
    const adminCommands = ['promote', 'demote', 'ban', 'unban', 'setwelcome'];
    const ownerCommands = ['backup', 'restore', 'maintenance'];
    const savageXExclusive = ['admin', 'vip', 'antilink', 'antibot', 'active', 'online'];
    
    // Check if command is allowed for this bot
    if (!botType === 'savage-x' && savageXExclusive.includes(command)) {
        return `❌ "${command}" is exclusive to Savage-X bot`;
    }
    
    // Admin checks (only for Savage-X)
    if (adminCommands.includes(command)) {
        if (!user.isAdmin) return '❌ Admin privileges required';
        if (botType !== 'savage-x') return '❌ Admin commands only work in Savage-X';
    }
    
    // Owner checks (only for Savage-X)
    if (ownerCommands.includes(command)) {
        if (!user.isOwner) return '❌ Bot owner privileges required';
        if (botType !== 'savage-x') return '❌ Owner commands only work in Savage-X';
    }
    
    return true;
}

export function parseMentions(message) {
    const mentions = [];
    if (message.mentionedJidList) {
        mentions.push(...message.mentionedJidList);
    }
    return mentions;
}

export function shouldProcessMessage(message) {
    if (message.isGroupMsg && message.author === 'status@broadcast') return false;
    if (message.type === 'protocol') return false;
    if (message.isNotification) return false;
    if (message.isEphemeral) return false;
    
    // Ignore messages from bots
    if (message.from.includes('@broadcast')) return false;
    
    return true;
}

export function getCommandCategory(command, botType = 'savage-x') {
    const categories = {
        // Savage-X Exclusive Categories
        admin: ['admin', 'backup', 'restore', 'logs', 'shutdown', 'update'],
        vip: ['vip', 'priority', 'exclusive', 'ai', 'stealth'],
        moderation: ['antilink', 'antibot', 'banword', 'promote', 'demote'],
        analytics: ['active', 'online', 'stats', 'usage'],
        
        // Shared Categories
        general: ['weather', 'currency', 'calc', 'time', 'remind', 'note', 'todo'],
        ai: ['gpt', 'aiimg', 'translate', 'summary', 'ocr'],
        fun: ['truth', 'dare', 'trivia', 'joke', 'meme', 'game'],
        download: ['yt', 'ig', 'tiktok', 'fb', 'spotify'],
        god: ['bible', 'prayer', 'devotional', 'sermon'],
        media: ['tts', 'sticker', 'filter', 'music', 'lyrics'],
        reaction: Object.keys(emojiReactions)
    };
    
    for (const [category, commands] of Object.entries(categories)) {
        if (commands.includes(command)) {
            // Check if this category is allowed for the bot
            if (botType !== 'savage-x' && ['admin', 'vip', 'moderation', 'analytics'].includes(category)) {
                return 'restricted'; // Mark as restricted for other bots
            }
            return category;
        }
    }
    return 'unknown';
}

export function getReactionEmoji(reaction) {
    return emojiReactions[reaction.toLowerCase()] || '❓';
}

export function formatBotResponse(response, command, botType) {
    const botConfig = getBotConfig(botType);
    const category = getCommandCategory(command, botType);
    
    const categoryIcons = {
        admin: '👑', vip: '⭐', moderation: '🛡️', analytics: '📊',
        general: '📱', ai: '🤖', fun: '🎮', download: '📥',
        god: '🙏', media: '🎵', reaction: '😂'
    };
    
    const icon = categoryIcons[category] || botConfig.emoji;
    
    return `${icon} ${botConfig.name}: ${response}`;
}

export function handleError(error, command, botType) {
    console.error(`❌ ${botType} Error in ${command}:`, error);
    
    const errorMessages = {
        'savage-x': '🦅 Savage-X encountered an error. Try again or contact admin.',
        'de-unknown': '🔮 De-Unknown is confused. Please try a different command.',
        'queen-rixie': '👑 Queen-Rixie is having royal issues. Please try again.'
    };
    
    return errorMessages[botType] || '❌ Bot error occurred. Please try again.';
}
