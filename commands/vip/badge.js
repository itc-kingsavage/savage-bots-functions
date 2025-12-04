const { isVIP } = require('../../../shared/utils.js');

const vipBadges = new Map();

module.exports = {
    name: 'badge',
    description: 'Display VIP badge and status',
    category: 'vip',
    async execute(args, message, client, botType) {
        if (!isVIP(message.from)) {
            return '❌ VIP access required for badges.';
        }
        
        const [action, ...params] = args.toLowerCase().split(' ');
        const userId = message.from;
        
        switch (action) {
            case 'show':
                return showBadge(userId, message);
            case 'set':
                return setBadge(userId, params.join(' '));
            case 'list':
                return listBadges();
            case 'color':
                return setBadgeColor(userId, params[0]);
            case 'status':
                return getBadgeStatus(userId);
            default:
                return `⭐ *VIP BADGE SYSTEM*\n\n• $vip badge show - Display your badge\n• $vip badge set <text> - Set custom badge text\n• $vip badge color <color> - Set badge color\n• $vip badge list - Available badge styles\n• $vip badge status - Your badge info\n\n💎 Customize your VIP presence!`;
        }
    }
};

function showBadge(userId, message) {
    const badge = vipBadges.get(userId) || {
        text: 'VIP MEMBER',
        color: 'gold',
        style: 'standard',
        created: Date.now()
    };
    
    const badgeArt = createBadgeArt(badge);
    
    return `⭐ *YOUR VIP BADGE*\n\n${badgeArt}\n\n📝 ${badge.text}\n🎨 Color: ${badge.color}\n🛡️ Style: ${badge.style}`;
}

function setBadge(userId, text) {
    if (!text || text.length > 20) {
        return '❌ Badge text must be 1-20 characters.';
    }
    
    const badge = vipBadges.get(userId) || {
        color: 'gold',
        style: 'standard',
        created: Date.now()
    };
    
    badge.text = text.toUpperCase();
    badge.updated = Date.now();
    vipBadges.set(userId, badge);
    
    return `✅ VIP badge updated: "${badge.text}"`;
}

function listBadges() {
    const badges = [
        '⭐ STANDARD - Classic VIP look',
        '💎 DIAMOND - Premium style',
        '👑 ROYAL - Royal treatment',
        '⚡ FLASH - Animated effect',
        '🛡️ GUARD - Protective style',
        '🎯 ELITE - Exclusive design'
    ];
    
    return `🛡️ *AVAILABLE BADGE STYLES*\n\n${badges.join('\n')}\n\n💡 Use: $vip badge set <text> then contact admin for style change.`;
}

function setBadgeColor(userId, color) {
    const validColors = ['gold', 'silver', 'diamond', 'ruby', 'sapphire', 'emerald'];
    
    if (!color || !validColors.includes(color.toLowerCase())) {
        return `❌ Valid colors: ${validColors.join(', ')}`;
    }
    
    const badge = vipBadges.get(userId) || {
        text: 'VIP MEMBER',
        style: 'standard',
        created: Date.now()
    };
    
    badge.color = color.toLowerCase();
    badge.updated = Date.now();
    vipBadges.set(userId, badge);
    
    return `✅ Badge color set to: ${color.toUpperCase()}`;
}

function getBadgeStatus(userId) {
    const badge = vipBadges.get(userId);
    
    if (!badge) {
        return '⭐ No custom badge set. Use: $vip badge set <text>';
    }
    
    const age = Date.now() - badge.created;
    const days = Math.floor(age / (1000 * 60 * 60 * 24));
    
    return `⭐ *BADGE STATUS*\n\n📝 Text: ${badge.text}\n🎨 Color: ${badge.color}\n🛡️ Style: ${badge.style}\n📅 Created: ${days} days ago\n🔄 Updated: ${badge.updated ? Math.floor((Date.now() - badge.updated) / (1000 * 60 * 60 * 24)) + ' days ago' : 'Never'}`;
}

function createBadgeArt(badge) {
    const colors = {
        gold: '🟡',
        silver: '⚪',
        diamond: '🔷',
        ruby: '🔴',
        sapphire: '🔵',
        emerald: '🟢'
    };
    
    const colorEmoji = colors[badge.color] || '⭐';
    
    return `${colorEmoji}═[ ${badge.text} ]═${colorEmoji}`;
}
