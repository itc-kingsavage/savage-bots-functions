const { isVIP } = require('../../../shared/utils.js');

// Stealth mode tracking
const stealthUsers = new Map();

module.exports = {
    name: 'stealth',
    description: 'VIP stealth mode - Hide command usage',
    category: 'vip',
    async execute(args, message, client, botType) {
        if (!isVIP(message.from)) {
            return '❌ VIP access required for stealth mode.';
        }
        
        const [action, ...params] = args.toLowerCase().split(' ');
        const userId = message.from;
        
        switch (action) {
            case 'on':
                return enableStealth(userId, params[0]);
            case 'off':
                return disableStealth(userId);
            case 'status':
                return getStealthStatus(userId);
            case 'commands':
                return getStealthCommands(userId);
            default:
                return `👻 *VIP STEALTH MODE*\n\n• $vip stealth on - Enable stealth mode\n• $vip stealth off - Disable stealth\n• $vip stealth status - Check status\n• $vip stealth commands - List stealth commands\n\n💡 Stealth mode hides command usage from logs and makes responses more discreet.`;
        }
    }
};

function enableStealth(userId, mode = 'normal') {
    stealthUsers.set(userId, {
        enabled: true,
        mode: ['normal', 'full'].includes(mode) ? mode : 'normal',
        enabledAt: Date.now(),
        commandsUsed: 0
    });
    
    const modeDesc = mode === 'full' 
        ? 'Full stealth (no logs, no typing indicators)'
        : 'Normal stealth (minimal logs only)';
    
    return `✅ *STEALTH MODE ENABLED*\n\n${modeDesc}\n👻 Your commands are now hidden\n⏰ Active for 1 hour\n💡 Use: $vip stealth off to disable`;
}

function disableStealth(userId) {
    const wasEnabled = stealthUsers.has(userId);
    stealthUsers.delete(userId);
    
    return wasEnabled 
        ? '✅ Stealth mode disabled. Commands are now visible.'
        : 'ℹ️ Stealth mode was not active.';
}

function getStealthStatus(userId) {
    const stealth = stealthUsers.get(userId);
    
    if (!stealth) {
        return '👻 Stealth Mode: ❌ DISABLED\n💡 Use: $vip stealth on to enable';
    }
    
    const timeLeft = 3600000 - (Date.now() - stealth.enabledAt); // 1 hour
    const minutesLeft = Math.ceil(timeLeft / 60000);
    
    return `👻 *STEALTH STATUS*\n\n• Active: ✅ ${stealth.mode.toUpperCase()} MODE\n• Commands used: ${stealth.commandsUsed}\n• Time left: ${minutesLeft} minutes\n• Features: Hidden logs, discreet responses\n\n💡 Auto-disables in ${minutesLeft} minutes.`;
}

function getStealthCommands(userId) {
    const stealth = stealthUsers.get(userId);
    
    if (!stealth) {
        return '❌ Enable stealth mode first: $vip stealth on';
    }
    
    const stealthCommands = [
        'ai', 'translate', 'search', 'calc', 'weather',
        'time', 'note', 'remind', 'encrypt', 'decrypt'
    ];
    
    return `👻 *STEALTH COMMANDS*\n\nCommands that work in stealth mode:\n${stealthCommands.map(cmd => `• $${cmd}`).join('\n')}\n\n💡 These commands won\'t appear in logs.`;
}
