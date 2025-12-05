const { getMentionedUsers, isGroupAdmin } = require('../../../shared/utils.js');

module.exports = {
    name: 'promote',
    description: 'Make user admin',
    category: 'moderation',
    async execute(args, message, client, botType) {
        if (!message.from.includes('@g.us')) {
            return '❌ This command works only in groups.';
        }
        
        // Check if sender is admin
        const participants = await message.getChat().then(chat => chat.participants);
        const senderId = message.author || message.from;
        
        if (!isGroupAdmin(participants, senderId)) {
            return '❌ You need to be an admin to promote users.';
        }
        
        const mentioned = getMentionedUsers(message);
        
        if (mentioned.length === 0) {
            return '❌ Please mention a user to promote.\n💡 Example: $promote @username';
        }
        
        if (mentioned.length > 1) {
            return '❌ You can only promote one user at a time.';
        }
        
        const targetUser = mentioned[0];
        
        try {
            // Check if target is already admin
            if (isGroupAdmin(participants, targetUser)) {
                return 'ℹ️ This user is already an admin.';
            }
            
            // Promote user
            const chat = await message.getChat();
            await chat.promoteParticipants([targetUser]);
            
            // Get user info
            const contact = await client.getContactById(targetUser);
            const userName = contact.pushname || contact.name || targetUser;
            
            // Log promotion
            console.log(`Promotion: ${senderId} promoted ${targetUser} in ${message.from}`);
            
            return `👑 *ADMIN PROMOTION*\n\n✅ Successfully promoted:\n📛 Name: ${userName}\n📞 Number: ${targetUser.replace('@c.us', '')}\n👤 Promoted by: ${senderId.replace('@c.us', '')}\n\n💡 User now has admin privileges.`;
            
        } catch (error) {
            console.error('Promote error:', error);
            
            if (error.message.includes('not authorized')) {
                return '❌ Bot needs to be admin to promote users.';
            } else if (error.message.includes('not in group')) {
                return '❌ User is not in this group.';
            }
            
            return `❌ Promotion failed: ${error.message}`;
        }
    }
};
