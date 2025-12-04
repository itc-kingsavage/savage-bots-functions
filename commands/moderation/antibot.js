const { validateArgs } = require('../../../shared/utils.js');

const antibotSettings = new Map();

module.exports = {
    name: 'antibot',
    description: 'Bot protection [on/off/warn/delete/remove]',
    category: 'moderation',
    async execute(args, message, client, botType) {
        if (!message.from.includes('@g.us')) {
            return '❌ This command works only in groups.';
        }
        
        const groupId = message.from;
        const [action, ...params] = args.toLowerCase().split(' ');
        
        // Initialize settings
        if (!antibotSettings.has(groupId)) {
            antibotSettings.set(groupId, {
                enabled: false,
                action: 'warn',
                detectedBots: [],
                lastDetection: null
            });
        }
        
        const settings = antibotSettings.get(groupId);
        
        switch (action) {
            case 'on':
                return enableAntibot(groupId, settings);
            case 'off':
                return disableAntibot(groupId, settings);
            case 'warn':
            case 'delete':
            case 'remove':
                return setAntibotAction(groupId, settings, action);
            case 'list':
                return getBotList(groupId, settings);
            case 'status':
                return getAntibotStatus(groupId, settings);
            default:
                return `🤖 *ANTI-BOT PROTECTION*\n\n• $antibot on - Enable bot detection\n• $antibot off - Disable detection\n• $antibot warn - Warn bot accounts\n• $antibot delete - Delete bot messages\n• $antibot remove - Remove bots from group\n• $antibot list - Show detected bots\n• $antibot status - Current settings`;
        }
    }
};

function enableAntibot(groupId, settings) {
    settings.enabled = true;
    antibotSettings.set(groupId, settings);
    saveAntibotSettings(groupId);
    
    return `✅ Anti-bot protection ENABLED\n🤖 Detecting and handling bot accounts\n🛡️ Action: ${settings.action.toUpperCase()}`;
}

function disableAntibot(groupId, settings) {
    settings.enabled = false;
    antibotSettings.set(groupId, settings);
    saveAntibotSettings(groupId);
    
    return '✅ Anti-bot protection DISABLED\n🤖 Bot detection is now off.';
}

function setAntibotAction(groupId, settings, action) {
    settings.action = action;
    antibotSettings.set(groupId, settings);
    saveAntibotSettings(groupId);
    
    const actions = {
        warn: 'Bot will receive a warning message',
        delete: 'Bot messages will be deleted automatically',
        remove: 'Bot will be removed from the group'
    };
    
    return `✅ Anti-bot action set to: ${action.toUpperCase()}\n📝 ${actions[action] || 'Unknown action'}`;
}

function getBotList(groupId, settings) {
    if (settings.detectedBots.length === 0) {
        return '📭 No bots detected in this group.';
    }
    
    const botList = settings.detectedBots
        .map((bot, index) => `${index + 1}. ${bot.id} - ${bot.detectedAt ? new Date(bot.detectedAt).toLocaleDateString() : 'Unknown'}`)
        .join('\n');
    
    return `🤖 *DETECTED BOTS*\n\n${botList}\n\n💡 Total: ${settings.detectedBots.length} bot(s) detected`;
}

function getAntibotStatus(groupId, settings) {
    const status = settings.enabled ? '✅ ACTIVE' : '❌ INACTIVE';
    const botCount = settings.detectedBots.length;
    
    return `🤖 *ANTI-BOT STATUS*\n\n• Protection: ${status}\n• Action: ${settings.action.toUpperCase()}\n• Bots detected: ${botCount}\n• Last detection: ${settings.lastDetection ? new Date(settings.lastDetection).toLocaleString() : 'Never'}`;
}

function saveAntibotSettings(groupId) {
    console.log(`Saved antibot settings for ${groupId}`);
}
