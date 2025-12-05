const { validateArgs } = require('../../../shared/utils.js');

// Store banned words per group
const bannedWords = new Map();

module.exports = {
    name: 'banword',
    description: 'Word filter [add/remove/list] + action setting',
    category: 'moderation',
    async execute(args, message, client, botType) {
        if (!message.from.includes('@g.us')) {
            return '❌ This command works only in groups.';
        }
        
        const groupId = message.from;
        const [action, ...params] = args.toLowerCase().split(' ');
        const word = params.join(' ').trim();
        
        // Initialize group settings
        if (!bannedWords.has(groupId)) {
            bannedWords.set(groupId, {
                words: new Set(),
                action: 'warn', // warn, delete, remove
                whitelist: new Set(),
                regex: false,
                casesensitive: false
            });
        }
        
        const settings = bannedWords.get(groupId);
        
        switch (action) {
            case 'add':
                return addBannedWord(groupId, settings, word);
            case 'remove':
                return removeBannedWord(groupId, settings, word);
            case 'list':
                return listBannedWords(settings);
            case 'action':
                return setBanAction(groupId, settings, params[0]);
            case 'clear':
                return clearBannedWords(groupId);
            case 'regex':
                return toggleRegex(groupId, settings, params[0]);
            case 'status':
                return getBanWordStatus(settings);
            default:
                return `🚫 *BANNED WORDS SYSTEM*\n\n• $banword add <word> - Ban a word\n• $banword remove <word> - Unban word\n• $banword list - List banned words\n• $banword action [warn/delete/remove] - Set action\n• $banword clear - Clear all banned words\n• $banword regex [on/off] - Toggle regex matching\n• $banword status - Current settings`;
        }
    }
};

function addBannedWord(groupId, settings, word) {
    if (!word) {
        return '❌ Please provide a word to ban.\n💡 Example: $banword add spam';
    }
    
    if (word.length > 50) {
        return '❌ Word too long (max 50 characters).';
    }
    
    const normalizedWord = settings.casesensitive ? word : word.toLowerCase();
    
    if (settings.words.has(normalizedWord)) {
        return `ℹ️ Word "${word}" is already banned.`;
    }
    
    settings.words.add(normalizedWord);
    bannedWords.set(groupId, settings);
    saveBanWords(groupId);
    
    return `✅ Word banned: "${word}"\n🚫 Action: ${settings.action.toUpperCase()}\n💡 Total banned words: ${settings.words.size}`;
}

function removeBannedWord(groupId, settings, word) {
    if (!word) {
        return '❌ Please provide a word to unban.\n💡 Example: $banword remove spam';
    }
    
    const normalizedWord = settings.casesensitive ? word : word.toLowerCase();
    
    if (!settings.words.has(normalizedWord)) {
        return `ℹ️ Word "${word}" is not in banned list.`;
    }
    
    settings.words.delete(normalizedWord);
    bannedWords.set(groupId, settings);
    saveBanWords(groupId);
    
    return `✅ Word unbanned: "${word}"\n✅ Removed from banned list.`;
}

function listBannedWords(settings) {
    if (settings.words.size === 0) {
        return '📭 No words are currently banned.';
    }
    
    const wordList = Array.from(settings.words)
        .map((word, index) => `${index + 1}. "${word}"`)
        .join('\n');
    
    return `🚫 *BANNED WORDS LIST*\n\n${wordList}\n\n📊 Total: ${settings.words.size} word(s)\n⚡ Action: ${settings.action.toUpperCase()}\n🔍 Regex: ${settings.regex ? 'ON' : 'OFF'}`;
}

function setBanAction(groupId, settings, action) {
    const validActions = ['warn', 'delete', 'remove'];
    
    if (!action || !validActions.includes(action)) {
        return `❌ Valid actions: ${validActions.join(', ')}`;
    }
    
    settings.action = action;
    bannedWords.set(groupId, settings);
    saveBanWords(groupId);
    
    const actionDescriptions = {
        warn: 'Users will receive a warning',
        delete: 'Messages will be deleted automatically',
        remove: 'Users will be removed from group'
    };
    
    return `✅ Ban word action set to: ${action.toUpperCase()}\n📝 ${actionDescriptions[action]}`;
}

function clearBannedWords(groupId) {
    const settings = bannedWords.get(groupId);
    
    if (!settings || settings.words.size === 0) {
        return '📭 No banned words to clear.';
    }
    
    const count = settings.words.size;
    settings.words.clear();
    bannedWords.set(groupId, settings);
    saveBanWords(groupId);
    
    return `✅ Cleared ${count} banned word(s).`;
}

function toggleRegex(groupId, settings, state) {
    if (state === 'on' || state === 'off') {
        settings.regex = state === 'on';
        bannedWords.set(groupId, settings);
        saveBanWords(groupId);
        
        return `✅ Regex matching: ${settings.regex ? 'ENABLED' : 'DISABLED'}\n💡 ${settings.regex ? 'Words are treated as regex patterns' : 'Exact word matching'}`;
    }
    
    return `🔍 Regex matching: ${settings.regex ? '✅ ON' : '❌ OFF'}\n💡 Use: $banword regex on/off`;
}

function getBanWordStatus(settings) {
    const isActive = settings.words.size > 0;
    
    return `🚫 *BANWORD STATUS*\n\n• Active: ${isActive ? '✅ YES' : '❌ NO'}\n• Action: ${settings.action.toUpperCase()}\n• Words banned: ${settings.words.size}\n• Regex: ${settings.regex ? 'ON' : 'OFF'}\n• Case sensitive: ${settings.casesensitive ? 'YES' : 'NO'}\n\n💡 ${isActive ? 'Filter is active and monitoring messages.' : 'No words are currently banned.'}`;
}

function saveBanWords(groupId) {
    // Save to database in production
    console.log(`Saved ban words for ${groupId}: ${bannedWords.get(groupId).words.size} words`);
}
