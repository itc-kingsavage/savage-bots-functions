const fs = require('fs');
const path = require('path');
const { validateArgs, formatTime } = require('../../../shared/utils.js');

module.exports = {
    name: 'logs',
    description: 'View system logs',
    category: 'admin',
    async execute(args, message, client, botType) {
        const logsDir = path.join(process.cwd(), 'logs');
        
        if (!fs.existsSync(logsDir)) {
            return '📭 No logs found.';
        }
        
        const logFiles = fs.readdirSync(logsDir)
            .filter(file => file.includes('savage-x') && file.endsWith('.log'))
            .sort()
            .reverse();
        
        if (logFiles.length === 0) {
            return '📭 No Savage-X logs found.';
        }
        
        const [action, ...rest] = args.toLowerCase().split(' ');
        
        switch (action) {
            case 'view':
                return await viewLog(logFiles[0], rest.join(' '));
            case 'list':
                return listLogs(logFiles);
            case 'clear':
                return clearLogs(logsDir, logFiles);
            case 'error':
                return filterLogs('ERROR', logFiles[0]);
            case 'warn':
                return filterLogs('WARN', logFiles[0]);
            default:
                return `📋 Logs Commands:\n• $admin logs list - Show available logs\n• $admin logs view [lines] - View latest log\n• $admin logs error - View errors only\n• $admin logs warn - View warnings only\n• $admin logs clear - Clear all logs`;
        }
    }
};

function listLogs(logFiles) {
    const list = logFiles.map((file, index) => {
        const stats = fs.statSync(path.join(process.cwd(), 'logs', file));
        const size = (stats.size / 1024).toFixed(2);
        return `${index + 1}. ${file} (${size} KB) - ${formatTime('UTC', 'short', stats.mtime)}`;
    }).join('\n');
    
    return `📁 Available Logs:\n${list}\n\n📝 Use: $admin logs view <filename_number>`;
}

async function viewLog(filename, linesParam = '50') {
    const logPath = path.join(process.cwd(), 'logs', filename);
    
    if (!fs.existsSync(logPath)) {
        return `❌ Log file not found: ${filename}`;
    }
    
    const lines = parseInt(linesParam) || 50;
    const maxLines = 100;
    const actualLines = Math.min(lines, maxLines);
    
    const content = fs.readFileSync(logPath, 'utf8');
    const allLines = content.split('\n').filter(line => line.trim());
    const recentLines = allLines.slice(-actualLines).join('\n');
    
    const stats = fs.statSync(logPath);
    const fileInfo = `📄 ${filename}\n📏 Lines: ${allLines.length}\n📦 Size: ${(stats.size / 1024).toFixed(2)} KB\n⏰ Modified: ${formatTime('UTC', 'short', stats.mtime)}`;
    
    return `${fileInfo}\n\n📜 Last ${actualLines} lines:\n${recentLines}`;
}

function filterLogs(type, filename) {
    const logPath = path.join(process.cwd(), 'logs', filename);
    
    if (!fs.existsSync(logPath)) {
        return `❌ Log file not found: ${filename}`;
    }
    
    const content = fs.readFileSync(logPath, 'utf8');
    const filteredLines = content.split('\n')
        .filter(line => line.includes(`[${type}]`))
        .slice(-50)
        .join('\n');
    
    if (!filteredLines.trim()) {
        return `📭 No ${type} logs found in ${filename}`;
    }
    
    return `🔍 ${type} Logs from ${filename}:\n${filteredLines}`;
}

function clearLogs(logsDir, logFiles) {
    let cleared = 0;
    
    for (const file of logFiles) {
        try {
            fs.writeFileSync(path.join(logsDir, file), '');
            cleared++;
        } catch (error) {
            console.error(`Failed to clear ${file}:`, error);
        }
    }
    
    return `🧹 Cleared ${cleared} log files.`;
}
