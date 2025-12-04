const fs = require('fs');
const path = require('path');
const os = require('os');
const { formatTime, formatBytes, formatDuration } = require('../../../shared/utils.js');

module.exports = {
    name: 'stats',
    description: 'Show Savage-X system statistics',
    category: 'admin',
    async execute(args, message, client, botType) {
        try {
            // System stats
            const totalMem = os.totalmem();
            const freeMem = os.freemem();
            const usedMem = totalMem - freeMem;
            
            const loadAvg = os.loadavg();
            const uptime = os.uptime();
            
            // Process stats
            const memoryUsage = process.memoryUsage();
            
            // Bot stats
            const chatsCount = client ? (await client.getChats()).length : 0;
            
            // Command stats
            const commandStats = getCommandStats();
            
            // VIP/Admin counts
            const vipCount = getVIPCount();
            const adminCount = getAdminCount();
            
            // Format response
            const stats = `
╔══════════════════════════════════════╗
║        𝕾𝔄𝔙𝔄𝔊𝔈-𝔛 𝕾𝖀𝕻𝕰𝕽 𝕾𝖄𝕾𝕿𝕰𝕸         ║
╠══════════════════════════════════════╣

🖥️ *SYSTEM INFO*
• CPU: ${os.cpus()[0]?.model || 'Unknown'}
• Cores: ${os.cpus().length}
• Load: ${loadAvg[0].toFixed(2)} (1min)
• OS: ${os.type()} ${os.release()}

💾 *MEMORY USAGE*
• Total: ${formatBytes(totalMem)}
• Used: ${formatBytes(usedMem)} (${((usedMem/totalMem)*100).toFixed(1)}%)
• Free: ${formatBytes(freeMem)}
• Process: ${formatBytes(memoryUsage.rss)}

🤖 *BOT STATS*
• Prefix: $
• Uptime: ${formatDuration(uptime * 1000)}
• Chats: ${chatsCount}
• Connected: ${client ? '✅' : '❌'}

👥 *USER STATS*
• VIP Users: ${vipCount}
• Admin Users: ${adminCount}
• Commands Today: ${commandStats.today}

📊 *COMMAND STATS*
${commandStats.topCommands}

⏰ *LAST UPDATED*
${formatTime()}
╚══════════════════════════════════════╝
            `.trim();
            
            return stats;
            
        } catch (error) {
            console.error('Stats error:', error);
            return `❌ Failed to get stats: ${error.message}`;
        }
    }
};

function getCommandStats() {
    const statsFile = path.join(process.cwd(), 'logs', 'command-stats.json');
    
    if (!fs.existsSync(statsFile)) {
        return { today: 0, topCommands: 'No data' };
    }
    
    try {
        const stats = JSON.parse(fs.readFileSync(statsFile, 'utf8'));
        const today = new Date().toDateString();
        
        const todayCommands = stats[today] || {};
        const todayCount = Object.values(todayCommands).reduce((a, b) => a + b, 0);
        
        // Get top 5 commands
        const allCommands = {};
        Object.values(stats).forEach(day => {
            Object.entries(day).forEach(([cmd, count]) => {
                allCommands[cmd] = (allCommands[cmd] || 0) + count;
            });
        });
        
        const topCommands = Object.entries(allCommands)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([cmd, count], index) => `${index + 1}. ${cmd}: ${count}`)
            .join('\n');
        
        return {
            today: todayCount,
            topCommands: topCommands || 'No commands yet'
        };
        
    } catch (error) {
        return { today: 0, topCommands: 'Error loading stats' };
    }
}

function getVIPCount() {
    const usersFile = path.join(process.cwd(), 'config', 'users.json');
    
    if (!fs.existsSync(usersFile)) return 0;
    
    try {
        const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
        return users.vip?.length || 0;
    } catch (error) {
        return 0;
    }
}

function getAdminCount() {
    const usersFile = path.join(process.cwd(), 'config', 'users.json');
    
    if (!fs.existsSync(usersFile)) return 0;
    
    try {
        const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
        return users.admin?.length || 0;
    } catch (error) {
        return 0;
    }
}
