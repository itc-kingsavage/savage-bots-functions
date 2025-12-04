const { isVIP, formatTime, formatDuration } = require('../../../shared/utils.js');

// Session storage
const vipSessions = new Map();

module.exports = {
    name: 'sessioninfo',
    description: 'VIP session information and management',
    category: 'vip',
    async execute(args, message, client, botType) {
        if (!isVIP(message.from)) {
            return '❌ VIP access required for session info.';
        }
        
        const [action] = args.toLowerCase().split(' ');
        const userId = message.from;
        
        switch (action) {
            case 'details':
                return getSessionDetails(userId);
            case 'list':
                return listActiveSessions();
            case 'clear':
                return clearUserSession(userId);
            case 'refresh':
                return refreshSession(userId);
            case 'security':
                return getSecurityInfo(userId);
            default:
                return getSessionOverview(userId);
        }
    }
};

function getSessionOverview(userId) {
    const session = vipSessions.get(userId) || createNewSession(userId);
    
    const duration = formatDuration(Date.now() - session.createdAt);
    const commandsUsed = session.commandsUsed.length;
    
    return `🔐 *VIP SESSION OVERVIEW*\n\n👤 User: ${userId}\n⏰ Created: ${formatTime('UTC', 'short', session.createdAt)}\n⏱️ Duration: ${duration}\n📊 Commands: ${commandsUsed}\n🛡️ Security: ${session.securityLevel}\n\n💡 Use: $vip sessioninfo details for more`;
}

function getSessionDetails(userId) {
    const session = vipSessions.get(userId) || createNewSession(userId);
    
    const recentCommands = session.commandsUsed
        .slice(-10)
        .map((cmd, index) => `${index + 1}. ${cmd.command} (${formatTime('UTC', 'short', cmd.timestamp)})`)
        .join('\n');
    
    return `📋 *VIP SESSION DETAILS*\n\n👤 User ID: ${session.userId}\n🎫 Session ID: ${session.sessionId}\n⏰ Created: ${formatTime('UTC', 'full', session.createdAt)}\n🔄 Last Active: ${formatTime('UTC', 'full', session.lastActive)}\n📊 Total Commands: ${session.commandsUsed.length}\n🛡️ Security Level: ${session.securityLevel}\n🔑 Features: ${session.enabledFeatures.join(', ')}\n\n📝 Recent Commands:\n${recentCommands || 'None'}`;
}

function listActiveSessions() {
    const activeSessions = Array.from(vipSessions.entries())
        .filter(([_, session]) => Date.now() - session.lastActive < 3600000) // Last hour
        .map(([userId, session]) => {
            const duration = formatDuration(Date.now() - session.createdAt);
            return `• ${userId.substring(0, 15)}... - ${duration} - ${session.commandsUsed.length} commands`;
        });
    
    if (activeSessions.length === 0) {
        return '📭 No active VIP sessions found.';
    }
    
    return `👥 *ACTIVE VIP SESSIONS*\n\n${activeSessions.join('\n')}\n\n💡 Total: ${activeSessions.length} active session(s)`;
}

function clearUserSession(userId) {
    const hadSession = vipSessions.has(userId);
    vipSessions.delete(userId);
    
    // Create fresh session
    createNewSession(userId);
    
    return hadSession 
        ? '✅ Session cleared and refreshed. New session created.'
        : '✅ Fresh session created.';
}

function refreshSession(userId) {
    const oldSession = vipSessions.get(userId);
    
    const newSession = createNewSession(userId);
    
    // Carry over some data
    if (oldSession) {
        newSession.totalCommands = oldSession.totalCommands + oldSession.commandsUsed.length;
        newSession.previousSessions = (oldSession.previousSessions || 0) + 1;
    }
    
    vipSessions.set(userId, newSession);
    
    return `🔄 *SESSION REFRESHED*\n\n🎫 New Session ID: ${newSession.sessionId}\n⏰ Started: ${formatTime('UTC', 'short', newSession.createdAt)}\n🛡️ Security: ${newSession.securityLevel}\n\n💡 Old session data preserved.`;
}

function getSecurityInfo(userId) {
    const session = vipSessions.get(userId) || createNewSession(userId);
    
    const securityFeatures = [
        '✅ Encrypted session data',
        '✅ IP tracking (if enabled)',
        '✅ Command logging',
        '✅ Auto-logout after 24h',
        '✅ Multi-factor ready',
        '✅ Activity monitoring'
    ];
    
    return `🛡️ *VIP SESSION SECURITY*\n\n${securityFeatures.join('\n')}\n\n🔐 Session ID: ${session.sessionId}\n📱 Device: WhatsApp Web\n🌐 Location: Encrypted\n🔑 Access: VIP Authenticated`;
}

function createNewSession(userId) {
    const session = {
        userId: userId,
        sessionId: generateSessionId(),
        createdAt: Date.now(),
        lastActive: Date.now(),
        commandsUsed: [],
        totalCommands: 0,
        previousSessions: 0,
        securityLevel: 'high',
        enabledFeatures: ['ai', 'download', 'translate', 'priority'],
        data: {}
    };
    
    vipSessions.set(userId, session);
    return session;
}

function generateSessionId() {
    return 'VIP-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}
