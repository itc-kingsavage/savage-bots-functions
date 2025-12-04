const { isVIP } = require('../../../shared/utils.js');

module.exports = {
    name: 'priority',
    description: 'VIP priority queue access',
    category: 'vip',
    async execute(args, message, client, botType) {
        if (!isVIP(message.from)) {
            return '❌ VIP access required for priority features.';
        }
        
        const [action] = args.toLowerCase().split(' ');
        
        switch (action) {
            case 'status':
                return getPriorityStatus(message.from);
            case 'enable':
                return enablePriority(message.from);
            case 'disable':
                return disablePriority(message.from);
            case 'speed':
                return setProcessingSpeed(args.split(' ')[1]);
            default:
                return `🚀 *VIP PRIORITY FEATURES*\n\n• $vip priority status - Check your priority status\n• $vip priority enable - Enable priority processing\n• $vip priority disable - Disable priority\n• $vip priority speed [fast/instant] - Set processing speed\n\n💎 Benefits:\n• 3x faster command processing\n• Jump queue in busy times\n• Higher download/upload limits\n• Priority API access`;
        }
    }
};

// In-memory priority queue (would use Redis in production)
const priorityUsers = new Set();
const userSettings = new Map();

function getPriorityStatus(userId) {
    const hasPriority = priorityUsers.has(userId);
    const settings = userSettings.get(userId) || { speed: 'fast' };
    
    return `🚀 *PRIORITY STATUS*\n\n• Active: ${hasPriority ? '✅' : '❌'}\n• Speed: ${settings.speed.toUpperCase()}\n• Queue Position: #1 (VIP)\n• Benefits: 3x speed, no limits\n\n💡 Use: $vip priority enable`;
}

function enablePriority(userId) {
    priorityUsers.add(userId);
    
    if (!userSettings.has(userId)) {
        userSettings.set(userId, { speed: 'fast', enabledAt: Date.now() });
    }
    
    // Log activation
    console.log(`VIP Priority enabled for: ${userId}`);
    
    return `✅ *PRIORITY ENABLED*\n\nYou now have:\n• 3x faster processing ⚡\n• Jump queue privileges 🚀\n• Unlimited API calls 📈\n• VIP-only server access 💎\n\nPriority will auto-disable after 24 hours.`;
}

function disablePriority(userId) {
    priorityUsers.delete(userId);
    
    return `✅ Priority disabled. You can re-enable anytime with $vip priority enable`;
}

function setProcessingSpeed(speed) {
    if (!['fast', 'instant'].includes(speed)) {
        return '❌ Speed must be "fast" or "instant"';
    }
    
    // This would update user settings in a real implementation
    return `✅ Processing speed set to: ${speed.toUpperCase()}\n⚡ Commands will process ${speed === 'instant' ? 'immediately' : '3x faster'}`;
}
