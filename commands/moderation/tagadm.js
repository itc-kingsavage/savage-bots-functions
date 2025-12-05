module.exports = {
    name: 'tagadm',
    description: 'Mention all group admins',
    category: 'moderation',
    async execute(args, message, client, botType) {
        if (!message.from.includes('@g.us')) {
            return '❌ This command works only in groups.';
        }
        
        try {
            const chat = await message.getChat();
            const participants = chat.participants;
            
            // Filter admins
            const admins = participants.filter(p => p.isAdmin);
            
            if (admins.length === 0) {
                return '👥 This group has no admins.';
            }
            
            // Create mention list
            const adminMentions = [];
            let adminList = '';
            
            for (const admin of admins) {
                const contact = await client.getContactById(admin.id);
                const name = contact.pushname || contact.name || admin.id.replace('@c.us', '');
                
                adminMentions.push(admin.id);
                adminList += `👑 ${name}\n`;
            }
            
            // Create message with mentions
            const mentionText = adminMentions.map(id => `@${id.replace('@c.us', '')}`).join(' ');
            
            return `📢 *GROUP ADMINS*\n\n${adminList}\n📊 Total: ${admins.length} admin(s)\n\n👆 ${mentionText}`;
            
        } catch (error) {
            console.error('Tagadm error:', error);
            return `❌ Failed to get admin list: ${error.message}`;
        }
    }
};
