const { isVIP, validateArgs } = require('../../../shared/utils.js');

// VIP blacklist management
const vipBlacklists = new Map();

module.exports = {
    name: 'blacklist',
    description: 'Blacklist management for VIP users',
    category: 'vip',
    async execute(args, message, client, botType) {
        if (!isVIP(message.from)) {
            return '❌ VIP access required for blacklist features.';
        }
        
        const [action, ...params] = args.toLowerCase().split(' ');
        const userId = message.from;
        
        switch (action) {
            case 'add':
                return addToBlacklist(userId, params.join(' '));
            case 'remove':
                return removeFromBlacklist(userId, params.join(' '));
            case 'list':
                return getBlacklist(userId);
            case 'clear':
                return clearBlacklist(userId);
            case 'import':
                return importFromBlockList(userId);
            case 'export':
                return exportBlacklist(userId);
            default:
                return `⚫ *VIP BLACKLIST SYSTEM*\n\n• $vip blacklist add <word/number> - Add to blacklist\n• $vip blacklist remove <word/number> - Remove\n• $vip blacklist list - View your blacklist\n• $vip blacklist clear - Clear all\n• $vip blacklist import - Import from block list\n• $vip blacklist export - Export blacklist\n\n💡 Blacklist filters messages and commands containing blocked terms.`;
        }
    }
};

function addToBlacklist(userId, item) {
    if (!validateArgs(item)) {
        return '❌ Please provide a word or number to blacklist.';
    }
    
    let blacklist = vipBlacklists.get(userId) || {
        words: new Set(),
        numbers: new Set(),
        regex: [],
        created: Date.now()
    };
    
    // Check if it's a number
    if (/^\d+$/.test(item.replace(/[^0-9]/g, ''))) {
        const number = item.replace(/[^0-9]/g, '');
        if (blacklist.numbers.has(number)) {
            return `ℹ️ Number ${number} is already blacklisted.`;
        }
        blacklist.numbers.add(number);
    } else {
        // It's a word/phrase
        const word = item.toLowerCase();
        if (blacklist.words.has(word)) {
            return `ℹ️ Word "${word}" is already blacklisted.`;
        }
        blacklist.words.add(word);
    }
    
    vipBlacklists.set(userId, blacklist);
    
    return `✅ Added to blacklist: "${item}"\n⚫ Filtering enabled for this term.`;
}

function removeFromBlacklist(userId, item) {
    if (!validateArgs(item)) {
        return '❌ Please provide a word or number to remove.';
    }
    
    const blacklist = vipBlacklists.get(userId);
    
    if (!blacklist) {
        return '📭 Your blacklist is empty.';
    }
    
    let removed = false;
    
    // Check numbers
    const number = item.replace(/[^0-9]/g, '');
    if (blacklist.numbers.has(number)) {
        blacklist.numbers.delete(number);
        removed = true;
    }
    
    // Check words
    const word = item.toLowerCase();
    if (blacklist.words.has(word)) {
        blacklist.words.delete(word);
        removed = true;
    }
    
    if (removed) {
        vipBlacklists.set(userId, blacklist);
        return `✅ Removed from blacklist: "${item}"`;
    }
    
    return `ℹ️ "${item}" was not found in your blacklist.`;
}

function getBlacklist(userId) {
    const blacklist = vipBlacklists.get(userId);
    
    if (!blacklist || (blacklist.words.size === 0 && blacklist.numbers.size === 0)) {
        return '📭 Your blacklist is empty.\n💡 Use: $vip blacklist add <word/number>';
    }
    
    const wordList = Array.from(blacklist.words)
        .map(word => `• "${word}"`)
        .join('\n');
    
    const numberList = Array.from(blacklist.numbers)
        .map(num => `• ${num}`)
        .join('\n');
    
    let result = `⚫ *YOUR BLACKLIST*\n\n`;
    
    if (wordList) {
        result += `📝 Words/Phrases:\n${wordList}\n\n`;
    }
    
    if (numberList) {
        result += `📱 Numbers:\n${numberList}\n\n`;
    }
    
    result += `📊 Total items: ${blacklist.words.size + blacklist.numbers.size}`;
    
    return result;
}

function clearBlacklist(userId) {
    const hadBlacklist = vipBlacklists.has(userId);
    
    if (!hadBlacklist) {
        return 'ℹ️ No blacklist found to clear.';
    }
    
    const blacklist = vipBlacklists.get(userId);
    const totalItems = blacklist.words.size + blacklist.numbers.size;
    
    vipBlacklists.delete(userId);
    
    return `✅ Cleared blacklist (${totalItems} items removed).`;
}

function importFromBlockList(userId) {
    const { blockedUsers } = require('./block.js');
    const userBlocks = blockedUsers.get(userId);
    
    if (!userBlocks || userBlocks.size === 0) {
        return '📭 Your block list is empty. Nothing to import.';
    }
    
    let blacklist = vipBlacklists.get(userId) || {
        words: new Set(),
        numbers: new Set(),
        regex: [],
        created: Date.now()
    };
    
    let imported = 0;
    
    for (const blockedUser of userBlocks) {
        // Extract number from user ID
        const number = blockedUser.replace('@c.us', '');
        if (/^\d+$/.test(number)) {
            blacklist.numbers.add(number);
            imported++;
        }
    }
    
    vipBlacklists.set(userId, blacklist);
    
    return `✅ Imported ${imported} number(s) from block list to blacklist.\n⚫ These numbers will now be filtered from all messages.`;
}

function exportBlacklist(userId) {
    const blacklist = vipBlacklists.get(userId);
    
    if (!blacklist || (blacklist.words.size === 0 && blacklist.numbers.size === 0)) {
        return '📭 Your blacklist is empty. Nothing to export.';
    }
    
    const exportData = {
        userId: userId,
        exportDate: new Date().toISOString(),
        words: Array.from(blacklist.words),
        numbers: Array.from(blacklist.numbers),
        totalItems: blacklist.words.size + blacklist.numbers.size
    };
    
    // In a real implementation, this would save to a file or database
    // For now, return formatted data
    
    return `📤 *BLACKLIST EXPORT*\n\n✅ Export ready!\n📊 Items: ${exportData.totalItems}\n📝 Words: ${exportData.words.length}\n📱 Numbers: ${exportData.numbers.length}\n\n💡 Contact admin for full export file.`;
}
