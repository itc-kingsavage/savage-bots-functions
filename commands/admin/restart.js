const { isAdminUser } = require('../../../shared/utils.js');

module.exports = {
    name: 'restart',
    description: 'Restart Savage-X bot',
    category: 'admin',
    async execute(args, message, client, botType) {
        if (!isAdminUser(message.from)) {
            return '❌ Admin access required for restart.';
        }
        
        try {
            await message.reply('🔄 Restarting Savage-X bot...');
            
            // Graceful shutdown
            if (client) {
                await client.destroy();
            }
            
            // Use PM2 if available
            if (process.env.PM2_HOME) {
                const { exec } = require('child_process');
                exec('pm2 restart savage-x', (error) => {
                    if (error) {
                        console.error('PM2 restart failed:', error);
                        // Fallback to process exit
                        setTimeout(() => process.exit(1), 1000);
                    }
                });
            } else {
                // Simple exit (will be restarted by external process manager)
                setTimeout(() => process.exit(0), 1000);
            }
            
            return '🔄 Savage-X restart initiated.';
            
        } catch (error) {
            console.error('Restart error:', error);
            return `❌ Restart failed: ${error.message}`;
        }
    }
};
