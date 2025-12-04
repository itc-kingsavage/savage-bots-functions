const { validateArgs, isAdminUser } = require('../../../shared/utils.js');

module.exports = {
    name: 'broadcast',
    description: 'Broadcast message to all chats',
    category: 'admin',
    async execute(args, message, client, botType) {
        if (!isAdminUser(message.from)) {
            return '❌ Admin access required for broadcast.';
        }
        
        if (!validateArgs(args, 3)) {
            return '📝 Usage: $admin broadcast <message>\n💡 Example: $admin broadcast Bot maintenance in 10 minutes';
        }
        
        const broadcastMessage = `📢 *ADMIN BROADCAST*\n\n${args}\n\n_From Savage-X Admin_`;
        
        try {
            // Send typing indicator
            await message.reply('📢 Starting broadcast... This may take a moment.');
            
            // Get all chats
            const chats = await client.getChats();
            
            // Filter out groups if needed (optional)
            const targetChats = chats.filter(chat => 
                !chat.isGroup &&  // Only personal chats
                chat.id._serialized !== 'status@broadcast'
            );
            
            let sent = 0;
            let failed = 0;
            
            // Send to each chat with delay to avoid rate limiting
            for (const chat of targetChats) {
                try {
                    await client.sendMessage(chat.id._serialized, broadcastMessage);
                    sent++;
                    
                    // Rate limiting: 1 second between messages
                    if (sent % 10 === 0) {
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    } else {
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                    
                } catch (error) {
                    console.error(`Failed to send to ${chat.id._serialized}:`, error);
                    failed++;
                }
            }
            
            return `✅ Broadcast completed!\n✓ Sent: ${sent}\n✗ Failed: ${failed}\n📊 Total: ${targetChats.length} chats`;
            
        } catch (error) {
            console.error('Broadcast error:', error);
            return `❌ Broadcast failed: ${error.message}`;
        }
    }
};
