const { validateArgs } = require('../../../shared/utils.js');

// Store group settings
const groupSettings = new Map();

module.exports = {
    name: 'antilink',
    description: 'Link protection [on/off/warn/delete/remove]',
    category: 'moderation',
    async execute(args, message, client, botType) {
        if (!message.from.includes('@g.us')) {
            return '❌ This command works only in groups.';
        }
        
        const groupId = message.from;
        const [action, ...params] = args.toLowerCase().split(' ');
        
        // Initialize group settings if not exists
        if (!groupSettings.has(groupId)) {
            groupSettings.set(groupId, {
                enabled: false,
                action: 'warn',
                whitelist: [],
                lastAction: null
            });
        }
        
        const settings = groupSettings.get(groupId);
        
        switch (action) {
            case 'on':
                return enableAntilink(groupId, settings);
            case 'off':
                return disableAntilink(groupId, settings);
            case 'warn':
            case 'delete':
            case 'remove':
                return setAntilinkAction(groupId, settings, action);
            case 'whitelist':
                return manageWhitelist(groupId, settings, params, message);
            case 'status':
                return getAntilinkStatus(groupId, settings);
            default:
                return `🛡️ *ANTI-LINK PROTECTION*\n\n• $antilink on - Enable protection\n• $antilink off - Disable protection\n• $antilink warn - Warn users (default)\n• $antilink delete - Delete link messages\n• $antilink remove - Remove users who send links\n• $antilink whitelist add <domain> - Whitelist domain\n• $antilink status - Current settings`;
        }
    }
};

function enableAntilink(groupId, settings) {
    settings.enabled = true;
    settings.lastAction = Date.now();
    
    groupSettings.set(groupId, settings);
    saveGroupSettings(groupId);
    
    return `✅ Anti-link protection ENABLED\n🛡️ Action: ${settings.action.toUpperCase()}\n💡 Links will be automatically handled.`;
}

function disableAntilink(groupId, settings) {
    settings.enabled = false;
    groupSettings.set(groupId, settings);
    saveGroupSettings(groupId);
    
    return '✅ Anti-link protection DISABLED\n🔓 Links are now allowed.';
}

function setAntilinkAction(groupId, settings, action) {
    settings.action = action;
    settings.lastAction = Date.now();
    
    groupSettings.set(groupId, settings);
    saveGroupSettings(groupId);
    
    const actionDescriptions = {
        warn: 'Send warning message',
        delete: 'Delete the message',
        remove: 'Remove user from group'
    };
    
    return `✅ Anti-link action set to: ${action.toUpperCase()}\n📝 ${actionDescriptions[action] || 'Unknown action'}`;
}

function manageWhitelist(groupId, settings, params, message) {
    const [subAction, domain] = params;
    
    if (!subAction || !domain) {
        const list = settings.whitelist.length > 0 
            ? settings.whitelist.map(d => `• ${d}`).join('\n')
            : 'No whitelisted domains';
        
        return `🔐 *WHITELISTED DOMAINS*\n\n${list}\n\n💡 Use: $antilink whitelist add <domain> or remove <domain>`;
    }
    
    if (subAction === 'add') {
        if (!settings.whitelist.includes(domain)) {
            settings.whitelist.push(domain);
            groupSettings.set(groupId, settings);
            saveGroupSettings(groupId);
            return `✅ Whitelisted domain: ${domain}`;
        }
        return `ℹ️ Domain already whitelisted: ${domain}`;
    }
    
    if (subAction === 'remove') {
        const index = settings.whitelist.indexOf(domain);
        if (index > -1) {
            settings.whitelist.splice(index, 1);
            groupSettings.set(groupId, settings);
            saveGroupSettings(groupId);
            return `✅ Removed from whitelist: ${domain}`;
        }
        return `ℹ️ Domain not in whitelist: ${domain}`;
    }
    
    return '❌ Invalid action. Use: add or remove';
}

function getAntilinkStatus(groupId, settings) {
    const status = settings.enabled ? '✅ ENABLED' : '❌ DISABLED';
    const whitelistCount = settings.whitelist.length;
    
    return `🛡️ *ANTI-LINK STATUS*\n\n• Protection: ${status}\n• Action: ${settings.action.toUpperCase()}\n• Whitelisted domains: ${whitelistCount}\n• Last updated: ${settings.lastAction ? new Date(settings.lastAction).toLocaleTimeString() : 'Never'}`;
}

function saveGroupSettings(groupId) {
    // In production, save to database
    // For now, keep in memory
    console.log(`Saved antilink settings for ${groupId}`);
}
