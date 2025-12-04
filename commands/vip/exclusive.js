const { isVIP } = require('../../../shared/utils.js');

module.exports = {
    name: 'exclusive',
    description: 'VIP exclusive features',
    category: 'vip',
    async execute(args, message, client, botType) {
        if (!isVIP(message.from)) {
            return '❌ VIP access required for exclusive features.';
        }
        
        const [feature] = args.toLowerCase().split(' ');
        
        const exclusiveFeatures = {
            themes: '🎨 Custom bot themes - Change bot colors and appearance',
            fonts: '🔤 Premium fonts - Access exclusive text styles',
            stickers: '🖼️ VIP sticker packs - Unlock premium stickers',
            voices: '🎤 Premium TTS voices - More voice options',
            effects: '✨ Media effects - Exclusive filters and effects',
            api: '🔑 Extended API - Higher rate limits',
            backup: '💾 Cloud backup - Automatic chat backup',
            stealth: '👻 Stealth mode - Invisible commands'
        };
        
        if (feature && exclusiveFeatures[feature]) {
            return `💎 *${feature.toUpperCase()} - VIP EXCLUSIVE*\n\n${exclusiveFeatures[feature]}\n\n🚀 Usage coming soon!`;
        }
        
        // List all features
        const featuresList = Object.entries(exclusiveFeatures)
            .map(([name, desc]) => `• *${name}* - ${desc}`)
            .join('\n');
        
        return `💎 *VIP EXCLUSIVE FEATURES*\n\n${featuresList}\n\n💡 Use: $vip exclusive <feature_name>\nExample: $vip exclusive themes`;
    }
};
