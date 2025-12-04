const { isVIP, validateArgs, formatBytes } = require('../../../shared/utils.js');
const { MediaHandler } = require('../../../shared/media-handler.js');

// VIP download limits (much higher)
const vipDownloadStats = new Map();

module.exports = {
    name: 'download',
    description: 'VIP downloads with no size limits',
    category: 'vip',
    async execute(args, message, client, botType) {
        if (!isVIP(message.from)) {
            return '❌ VIP downloads have no size/rate limits.\n💎 Upgrade with $vip';
        }
        
        const [action, ...params] = args.toLowerCase().split(' ');
        const userId = message.from;
        
        switch (action) {
            case 'yt':
                return await downloadYouTube(params.join(' '), userId, message);
            case 'batch':
                return await batchDownload(params, userId);
            case 'stats':
                return getDownloadStats(userId);
            case 'limit':
                return getVipLimits();
            default:
                return `📥 *VIP DOWNLOAD CENTER*\n\n• $vip download yt <url> - YouTube (no limits)\n• $vip download batch <url1 url2...> - Batch download\n• $vip download stats - Your download stats\n• $vip download limit - VIP limits info\n\n💎 No size limits! No speed limits!`;
        }
    }
};

async function downloadYouTube(url, userId, message) {
    if (!validateArgs(url)) {
        return '❌ Please provide a YouTube URL.';
    }
    
    try {
        await message.reply('⚡ VIP Download started... (Highest quality, no limits)');
        
        // VIP gets highest quality
        const result = await MediaHandler.downloadYouTube(url, 'video', 'vip', 'savage-x');
        
        if (!result.success) {
            return `❌ Download failed: ${result.error}`;
        }
        
        // Update VIP stats
        updateDownloadStats(userId, result.data?.filesize || 0);
        
        const size = result.data?.filesize 
            ? `📦 Size: ${formatBytes(result.data.filesize)}`
            : '';
        
        return `✅ *VIP DOWNLOAD COMPLETE*\n\n🎬 ${result.data?.title || 'Video'}\n${size}\n⚡ Quality: VIP MAXIMUM\n💎 No limits applied`;
        
    } catch (error) {
        console.error('VIP YouTube download error:', error);
        return `❌ VIP download failed: ${error.message}`;
    }
}

async function batchDownload(urls, userId) {
    if (urls.length === 0) {
        return '❌ Provide URLs: $vip download batch url1 url2 url3';
    }
    
    // VIP can download more at once
    const maxUrls = 10;
    const downloadUrls = urls.slice(0, maxUrls);
    
    let results = [];
    let totalSize = 0;
    
    for (const url of downloadUrls) {
        try {
            const result = await MediaHandler.downloadYouTube(url, 'video', 'medium', 'savage-x');
            
            if (result.success && result.data?.filesize) {
                totalSize += result.data.filesize;
            }
            
            results.push({
                url: url,
                success: result.success,
                title: result.data?.title || 'Unknown'
            });
            
        } catch (error) {
            results.push({
                url: url,
                success: false,
                error: error.message
            });
        }
    }
    
    // Update stats
    updateDownloadStats(userId, totalSize);
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    return `📦 *VIP BATCH DOWNLOAD*\n\n✅ Successful: ${successful}\n❌ Failed: ${failed}\n📊 Total size: ${formatBytes(totalSize)}\n⚡ VIP batch processing complete!`;
}

function getDownloadStats(userId) {
    const stats = vipDownloadStats.get(userId) || {
        totalDownloads: 0,
        totalSize: 0,
        lastDownload: null,
        averageSize: 0
    };
    
    const totalGB = (stats.totalSize / (1024 * 1024 * 1024)).toFixed(2);
    
    return `📊 *VIP DOWNLOAD STATS*\n\n• Total downloads: ${stats.totalDownloads}\n• Total data: ${totalGB} GB\n• Average size: ${formatBytes(stats.averageSize)}\n• Last download: ${stats.lastDownload ? new Date(stats.lastDownload).toLocaleDateString() : 'Never'}\n\n💎 Unlimited downloads remaining!`;
}

function getVipLimits() {
    return `🚫 *STANDARD LIMITS* vs 💎 *VIP LIMITS*\n\n📦 File size: 100MB vs NO LIMIT\n📥 Daily downloads: 10 vs UNLIMITED\n⚡ Speed: Normal vs MAXIMUM\n⏱️ Queue: Regular vs PRIORITY\n🔗 Concurrent: 1 vs 5\n\n💎 VIP has NO restrictions!`;
}

function updateDownloadStats(userId, size) {
    const stats = vipDownloadStats.get(userId) || {
        totalDownloads: 0,
        totalSize: 0,
        lastDownload: Date.now()
    };
    
    stats.totalDownloads++;
    stats.totalSize += size;
    stats.lastDownload = Date.now();
    stats.averageSize = stats.totalSize / stats.totalDownloads;
    
    vipDownloadStats.set(userId, stats);
}
