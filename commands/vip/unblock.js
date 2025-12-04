const { isVIP, validateArgs } = require('../../../shared/utils.js');

module.exports = {
    name: 'unblock',
    description: 'Unblock previously blocked users (VIP only)',
    category: 'vip',
    async execute(args, message, client, botType) {
        if (!isVIP(message.from)) {
            return '❌ VIP access required for unblock features.';
        }
        
        if (!validateArgs(args)) {
            return `🔓 *VIP UNBLOCK*\n\n📝 Usage: $vip unblock <number>\n💡 Example: $vip unblock 1234567890\n\n📋 To see blocked users: $vip block list`;
        }
        
        const target = args.trim();
        const userId = message.from;
        
        // Alias for block remove functionality
        return require('./block.js').removeFromBlockList(userId, target);
    }
};
