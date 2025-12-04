const { isVIP, validateArgs } = require('../../../shared/utils.js');

// Block list storage
const blockedUsers = new Map();
const globalBlockList = new Set();

module.exports = {
    name: 'block',
    description: 'Block users from interacting with you (VIP only)',
    category: 'vip',
    async execute(args, message, client, botType) {
        if (!isVIP(message.from)) {
            return '❌ VIP access required for blocking features.';
        }
        
        const [action, target] = args.toLowerCase().split(' ');
        const userId = message.from;
        
        if (!action) {
            return `🚫 *VIP BLOCK SYSTEM*\n\n• $vip block add <number> - Block user\n• $vip block remove <number> - Unblock user\n• $vip block list - Your block list\n• $vip block clear - Clear all blocks\n• $vip block global - Block globally (admin)\n\n💡 Blocked users cannot message you or see your commands.`;
        }
        
        switch (action) {
            case 'add':
                return addToBlockList(userId, target, message);
            case 'remove':
                return removeFromBlockList(userId, target);
            case 'list':
                return getBlockList(userId);
            case 'clear':
                return clearBlockList(userId);
            case 'global':
                return manageGlobalBlock(target, args.split(' ')[2], userId);
            default:
                return '❌ Invalid action. Use: add, remove, list, clear, global';
        }
    }
};

function addToBlockList(userId, target, message) {
    if (!validateArgs(target)) {
        return '❌ Please provide a user number to block.\n💡 Example: $vip block add 1234567890';
    }
    
    const formattedTarget = target.includes('@c.us') ? target : `${target.replace(/[^0-9]/g, '')}@c.us`;
    
    // Get user's block list
    let userBlocks = blockedUsers.get(userId) || new Set();
    
    if (userBlocks.has(formattedTarget)) {
        return `ℹ️ User ${formattedTarget} is already blocked.`;
    }
    
    userBlocks.add(formattedTarget);
    blockedUsers.set(userId, userBlocks);
    
    // Log the block
    console.log(`VIP Block: ${userId} blocked ${formattedTarget}`);
    
    return `✅ User blocked: ${formattedTarget}\n🚫 They can no longer:\n• Send you messages\n• See your commands\n• Interact with you\n\n💡 Use $vip block remove <number> to unblock.`;
}

function removeFromBlockList(userId, target) {
    if (!validateArgs(target)) {
        return '❌ Please provide a user number to unblock.';
    }
    
    const formattedTarget = target.includes('@c.us') ? target : `${target.replace(/[^0-9]/g, '')}@c.us`;
    const userBlocks = blockedUsers.get(userId);
    
    if (!userBlocks || !userBlocks.has(formattedTarget)) {
        return `ℹ️ User ${formattedTarget} is not in your block list.`;
    }
    
    userBlocks.delete(formattedTarget);
    
    if (userBlocks.size === 0) {
        blockedUsers.delete(userId);
    } else {
        blockedUsers.set(userId, userBlocks);
    }
    
    return `✅ User unblocked: ${formattedTarget}\n🤝 They can now interact with you again.`;
}

function getBlockList(userId) {
    const userBlocks = blockedUsers.get(userId);
    
    if (!userBlocks || userBlocks.size === 0) {
        return '📭 Your block list is empty.';
    }
    
    const blockList = Array.from(userBlocks)
        .map((user, index) => `${index + 1}. ${user}`)
        .join('\n');
    
    return `🚫 *YOUR BLOCK LIST*\n\n${blockList}\n\n📊 Total blocked: ${userBlocks.size}\n💡 Use: $vip block remove <number> to unblock`;
}

function clearBlockList(userId) {
    const hadBlocks = blockedUsers.has(userId);
    const count = hadBlocks ? blockedUsers.get(userId).size : 0;
    
    blockedUsers.delete(userId);
    
    return hadBlocks 
        ? `✅ Cleared ${count} user(s) from your block list.`
        : 'ℹ️ Your block list was already empty.';
}

function manageGlobalBlock(target, action, requesterId) {
    // Only certain VIPs can manage global blocks
    const allowedVIPs = process.env.VIP_ADMINS?.split(',') || [];
    
    if (!allowedVIPs.includes(requesterId)) {
        return '❌ Global block management requires VIP Admin privileges.';
    }
    
    if (!target || !action) {
        const globalCount = globalBlockList.size;
        return `🌍 *GLOBAL BLOCK LIST*\n\n📊 Total globally blocked: ${globalCount}\n👑 Managed by VIP Admins only`;
    }
    
    const formattedTarget = target.includes('@c.us') ? target : `${target.replace(/[^0-9]/g, '')}@c.us`;
    
    if (action === 'add') {
        if (globalBlockList.has(formattedTarget)) {
            return `ℹ️ User ${formattedTarget} is already globally blocked.`;
        }
        
        globalBlockList.add(formattedTarget);
        return `✅ User globally blocked: ${formattedTarget}\n🚫 Blocked from all VIP features.`;
    }
    
    if (action === 'remove') {
        if (!globalBlockList.has(formattedTarget)) {
            return `ℹ️ User ${formattedTarget} is not globally blocked.`;
        }
        
        globalBlockList.delete(formattedTarget);
        return `✅ User removed from global block: ${formattedTarget}`;
    }
    
    return '❌ Invalid action. Use: add or remove';
}
