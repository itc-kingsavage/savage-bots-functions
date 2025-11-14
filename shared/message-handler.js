import { processCommand } from '../bots/savage-x/command-router.js';
import { processVIPCommand } from '../bots/savage-x/vip-commands.js';
import { isVIP } from './utils.js';

export async function handleMessage(message, botType) {
    const text = message.body?.trim() || '';
    
    if (!text.startsWith('$')) return null;
    
    const command = text.slice(1).split(' ')[0].toLowerCase();
    const args = text.slice(command.length + 2).trim();
    
    console.log(`📨 ${botType} | Command: ${command} | User: ${message.from}`);
    
    if (command.startsWith('vip')) {
        if (!isVIP(message.from)) {
            return '❌ VIP feature! Use $vip to upgrade';
        }
        return await processVIPCommand(command, args, message, botType);
    }
    
    return await processCommand(command, args, message, botType);
}

export function routeGroupCommand(command, args, message) {
    if (!message.from.includes('@g.us')) {
        return '❌ This command works only in groups';
    }
    
    const groupCommands = ['antilink', 'welcome', 'rules', 'promote', 'demote', 'banword'];
    return groupCommands.includes(command);
}

export function validateCommandAccess(command, user, isGroup = false) {
    const adminCommands = ['promote', 'demote', 'ban', 'unban', 'setwelcome'];
    const ownerCommands = ['backup', 'restore', 'maintenance'];
    
    if (adminCommands.includes(command) && !user.isAdmin) {
        return '❌ Admin privileges required';
    }
    
    if (ownerCommands.includes(command) && !user.isOwner) {
        return '❌ Bot owner privileges required';
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
    return true;
}

export function getCommandCategory(command) {
    const categories = {
        general: ['weather', 'currency', 'calc', 'time', 'reminder', 'notes', 'qr'],
        ai: ['chatgpt', 'imageai', 'summarize', 'translate', 'code', 'ocr'],
        fun: ['truth', 'dare', 'trivia', 'wordgame', 'card', 'joke', 'meme'],
        bot: ['autoreply', 'stats', 'backup', 'schedule', 'trigger'],
        group: ['antilink', 'welcome', 'rules', 'promote', 'demote', 'banword'],
        download: ['yt', 'ig', 'tiktok', 'fb', 'spotify', 'convert'],
        vip: ['vipsports', 'vipcharts', 'vipmusic', 'vipassistant', 'vipprivacy', 'vipmedia', 'vipstock', 'vipnews', 'vipgame', 'vipscan', 'vipedit', 'vipconvert', 'vipanalyze', 'vipbackup', 'vipsession', 'vipstatus', 'vipunlock', 'viprequest', 'viphelp'],
        god: ['bible', 'prayer', 'sermon', 'devotional', 'church'],
        extra: ['tts', 'imageedit', 'music', 'encrypt', 'virusscan'],
        reaction: ['laugh', 'cry', 'angry', 'love', 'fire', 'poop', 'clown', 'ghost', 'alien', 'robot', 'thumbsup', 'hearteyes', 'thinking', 'party', 'cool', 'sick', 'rich', 'shush', 'wave', 'flex']
    };
    
    for (const [category, commands] of Object.entries(categories)) {
        if (commands.includes(command)) return category;
    }
    return 'unknown';
}

const emojiReactions = {
    laugh: '😂',
    cry: '😢',
    angry: '😠',
    love: '❤️',
    fire: '🔥',
    poop: '💩',
    clown: '🤡',
    ghost: '👻',
    alien: '👽',
    robot: '🤖',
    thumbsup: '👍',
    hearteyes: '😍',
    thinking: '🤔',
    party: '🎉',
    cool: '😎',
    sick: '🤒',
    rich: '🤑',
    shush: '🤫',
    wave: '👋',
    flex: '💪'
};

export function getReactionEmoji(reaction) {
    return emojiReactions[reaction.toLowerCase()] || '❓';
}
