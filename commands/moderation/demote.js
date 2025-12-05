const { getMentionedUsers, isGroupAdmin } = require('../../../shared/utils.js');

module.exports = {
    name: 'demote',
    description: 'Remove admin rights',
    category: 'moderation',
    async execute(args, message, client, botType) {
        if (!message.from.includes('@g.us')) {
            return '❌ This command works only in groups.';
        }
        
        // Check if sender is admin
        const participants = await message.getChat().then(chat => chat.participants);
        const senderId = message.author || message.from;
        
        if (!isGroupAdmin(participants, senderId)) {
            return '❌ You need to be an admin to demote users.';
        }
        
        const mentioned = getMentionedUsers(message);
        
        if (mentioned.length === 0) {
            return '❌ Please mention an admin to demote.\n💡 Example: $demote @username';
        }
        
        if (mentioned.length > 1) {
            return '❌ You can only demote one user at a time.';
        }
        
        const targetUser = mentioned[0];
        
        try {
            // Check if target is admin
            if (!isGroupAdmin(participants, targetUser)) {
                return 'ℹ️ This user is not an admin.';
            }
            
            // Check if trying to demote group creator
            const chat = await message.getChat();
            const groupInfo = await chat.groupMetadata;
            
            if (groupInfo.owner === targetUser) {
                return '❌ Cannot demote group creator.';
            }
            
            // Demote user
            await chat.demoteParticipants([targetUser]);
            
            // Get user info
            const contact = await client.getContactById(targetUser);
            const userName = contact.pushname || contact.name || targetUser;
            
            // Log demotion
            console.log(`Demotion: ${senderId} demoted ${targetUser} in ${message.from}`);
            
            return `⬇️ *ADMIN DEMOTION*\n\n✅ Successfully demoted:\n📛 Name: ${userName}\n📞 Number: ${targetUser.replace('@c.us', '')}\n👤 Demoted by: ${senderId.replace('@c.us', '')}\n\n⚠️ User no longer has admin privileges.`;
            
        } catch (error) {
            console.error('Demote error:', error);
            
            if (error.message.includes('not authorized')) {
                return '❌ Bot needs to be admin to demote users.';
            } else if (error.message.includes('not in group')) {
                return '❌ User is not in this group.';
            }
            
            return `❌ Demotion failed: ${error.message}`;
        }
    }
};
