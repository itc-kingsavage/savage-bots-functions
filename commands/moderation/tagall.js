module.exports = {
    name: 'tagall',
    description: 'Mention all group members',
    category: 'moderation',
    async execute(args, message, client, botType) {
        if (!message.from.includes('@g.us')) {
            return '❌ This command works only in groups.';
        }
        
        try {
            const chat = await message.getChat();
            const participants = chat.participants;
            
            if (participants.length === 0) {
                return '👥 This group has no members.';
            }
            
            // Check group size
            if (participants.length > 100) {
                return `❌ Group too large (${participants.length} members).\n💡 Use sparingly for large groups.`;
            }
            
            // Create mention list
            const allMentions = [];
            let memberCount = 0;
            
            for (const member of participants) {
                // Limit to first 50 mentions to avoid message too long
                if (memberCount < 50) {
                    allMentions.push(member.id);
                }
                memberCount++;
            }
            
            // Create mention text
            const mentionText = allMentions.map(id => `@${id.replace('@c.us', '')}`).join(' ');
            
            // If more than 50 members, add note
            const extraNote = memberCount > 50 
                ? `\n📝 Note: Showing first 50 of ${memberCount} members.`
                : '';
            
            return `📢 *MENTION ALL*\n\n👥 Total members: ${memberCount}\n🔔 Mentioning: ${Math.min(50, memberCount)}\n\n👆 ${mentionText}${extraNote}\n\n💡 Use sparingly to avoid spam.`;
            
        } catch (error) {
            console.error('Tagall error:', error);
            return `❌ Failed to mention members: ${error.message}`;
        }
    }
};
