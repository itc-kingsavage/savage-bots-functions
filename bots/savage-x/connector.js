import { handleMessage } from '../../shared/message-handler.js';

export default function savageXConnector() {
    console.log('🔥 Savage-X Bot Activated');
    
    const bot = {
        name: "Savage Boy",
        prefix: "$",
        version: "1.0.0",
        sessions: new Map(),
        vipUsers: new Set([
            '1234567890@c.us',
            '0987654321@c.us'
        ]),
        
        processMessage: async (message) => {
            return await handleMessage(message, "savage-x");
        },
        
        addVIP: (userId) => {
            bot.vipUsers.add(userId);
            return true;
        },
        
        removeVIP: (userId) => {
            return bot.vipUsers.delete(userId);
        },
        
        createSession: (userId) => {
            const session = {
                id: userId,
                createdAt: Date.now(),
                lastActivity: Date.now(),
                data: new Map(),
                isActive: true
            };
            bot.sessions.set(userId, session);
            return session;
        },
        
        getSession: (userId) => {
            let session = bot.sessions.get(userId);
            if (!session) {
                session = bot.createSession(userId);
            }
            session.lastActivity = Date.now();
            return session;
        },
        
        clearSession: (userId) => {
            return bot.sessions.delete(userId);
        },
        
        cleanupSessions: () => {
            const now = Date.now();
            const timeout = 30 * 60 * 1000; // 30 minutes
            for (const [userId, session] of bot.sessions) {
                if (now - session.lastActivity > timeout) {
                    bot.sessions.delete(userId);
                }
            }
        },
        
        getStats: () => {
            return {
                totalSessions: bot.sessions.size,
                vipUsers: bot.vipUsers.size,
                activeSessions: Array.from(bot.sessions.values()).filter(s => s.isActive).length
            };
        }
    };
    
    setInterval(() => {
        bot.cleanupSessions();
    }, 5 * 60 * 1000);
    
    return bot;
}
