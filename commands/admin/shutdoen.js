const { isAdminUser } = require('../../../shared/utils.js');

module.exports = {
    name: 'shutdown',
    description: 'Emergency shutdown of Savage-X',
    category: 'admin',
    async execute(args, message, client, botType) {
        if (!isAdminUser(message.from)) {
            return '❌ Admin access required for shutdown.';
        }
        
        const confirm = args.toLowerCase();
        
        if (confirm !== 'confirm') {
            return '⚠️ *EMERGENCY SHUTDOWN*\n\nThis will stop the Savage-X bot completely.\nTo confirm, type:\n$admin shutdown confirm';
        }
        
        try {
            await message.reply('🛑 Emergency shutdown initiated...');
            
            // Send status to admin
            const adminMessage = `🛑 Savage-X shutdown by: ${message.from}\n⏰ Time: ${new Date().toLocaleString()}`;
            
            // Save to shutdown log
            const fs = require('fs');
            fs.appendFileSync('./logs/shutdown.log', 
                `[SHUTDOWN] ${new Date().toISOString()} - ${message.from}\n`
            );
            
            // Destroy client
            if (client) {
                await client.destroy();
            }
            
            // Exit process
            setTimeout(() => {
                console.log('🛑 Savage-X shutdown complete.');
                process.exit(0);
            }, 2000);
            
            return '🛑 Shutdown sequence started. Bot will stop in 2 seconds.';
            
        } catch (error) {
            console.error('Shutdown error:', error);
            return `❌ Shutdown failed: ${error.message}`;
        }
    }
};
