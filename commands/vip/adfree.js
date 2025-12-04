const { isVIP } = require('../../../shared/utils.js');

const adFreeUsers = new Set();

module.exports = {
    name: 'adfree',
    description: 'Ad-free experience (VIP only)',
    category: 'vip',
    async execute(args, message, client, botType) {
        if (!isVIP(message.from)) {
            return '❌ Ad-free experience is VIP-only.\n💎 Ads removed with $vip';
        }
        
        const [action] = args.toLowerCase().split(' ');
        const userId = message.from;
        
        switch (action) {
            case 'on':
                return enableAdFree(userId);
            case 'off':
                return disableAdFree(userId);
            case 'status':
                return getAdFreeStatus(userId);
            case 'compare':
                return compareWithAds();
            default:
                return `🚫 *AD-FREE EXPERIENCE*\n\n• $vip adfree on - Remove all ads\n• $vip adfree off - Show ads (why?)\n• $vip adfree status - Current status\n• $vip adfree compare - See the difference\n\n💎 Enjoy Savage-X without interruptions!`;
        }
    }
};

function enableAdFree(userId) {
    adFreeUsers.add(userId);
    
    return `✅ *AD-FREE ENABLED*\n\n🎉 All ads have been removed!\n\n📱 What you get:\n• No promotional messages\n• No sponsored commands\n• Clean interface\n• Faster responses\n• VIP-only content\n\n💎 Enjoy your premium experience!`;
}

function disableAdFree(userId) {
    const wasEnabled = adFreeUsers.has(userId);
    adFreeUsers.delete(userId);
    
    return wasEnabled 
        ? 'ℹ️ Ad-free disabled. Ads will now appear occasionally.'
        : 'ℹ️ Ad-free was not active.';
}

function getAdFreeStatus(userId) {
    const isAdFree = adFreeUsers.has(userId);
    
    if (isAdFree) {
        return `🚫 *AD-FREE STATUS: ACTIVE*\n\n✅ No ads will be shown\n💎 Premium experience enabled\n📅 Active until: Forever (VIP)`;
    } else {
        return `📢 *AD-FREE STATUS: INACTIVE*\n\nℹ️ Ads may appear occasionally\n💡 Enable with: $vip adfree on`;
    }
}

function compareWithAds() {
    return `📊 *WITH ADS vs AD-FREE*\n\n📱 *WITH ADS (Free):*\n• Promotional messages\n• Sponsored command results\n• Ad banners in responses\n• Occasional delays\n• Limited features\n\n🚫 *AD-FREE (VIP):*\n• No promotions\n• Clean responses\n• Faster processing\n• All features unlocked\n• VIP priority\n\n💎 Upgrade with $vip`;
}
