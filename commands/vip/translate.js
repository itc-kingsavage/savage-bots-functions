const axios = require('axios');
const { isVIP, validateArgs } = require('../../../shared/utils.js');

// VIP translation limits (unlimited for VIP)
const translationHistory = new Map();

module.exports = {
    name: 'translate',
    description: 'Unlimited translations (VIP only)',
    category: 'vip',
    async execute(args, message, client, botType) {
        if (!isVIP(message.from)) {
            return '❌ Unlimited translations are VIP-only.\n💎 Use $vip to upgrade.';
        }
        
        const parts = args.split(' ');
        if (parts.length < 3) {
            return '📝 Usage: $vip translate <language> <text>\n🌐 Example: $vip translate spanish Hello world\n💡 Languages: en, es, fr, de, ja, ko, zh, ar, hi, ru';
        }
        
        const targetLang = parts[0].toLowerCase();
        const text = parts.slice(1).join(' ');
        
        try {
            // Track VIP usage
            const userId = message.from;
            const userHistory = translationHistory.get(userId) || [];
            userHistory.push({
                from: 'auto',
                to: targetLang,
                text: text.substring(0, 50),
                timestamp: Date.now()
            });
            
            // Keep only last 100 translations
            if (userHistory.length > 100) {
                userHistory.shift();
            }
            translationHistory.set(userId, userHistory);
            
            // Perform translation
            const translated = await translateText(text, targetLang);
            
            // VIP gets additional info
            const totalTranslations = userHistory.length;
            
            return `🌐 *VIP TRANSLATION*\n\n📝 Original: ${text}\n\n🔤 Translated (${targetLang.toUpperCase()}): ${translated}\n\n💎 VIP Stats: ${totalTranslations} translations used (unlimited)`;
            
        } catch (error) {
            console.error('Translation error:', error);
            
            if (error.response?.status === 429) {
                return '⚠️ Translation API limit reached. Try again in a minute.';
            }
            
            return `❌ Translation failed: ${error.message}`;
        }
    }
};

async function translateText(text, targetLang) {
    // Using LibreTranslate (free) or Google Translate API
    const apiUrl = process.env.TRANSLATE_API || 'https://libretranslate.com/translate';
    
    const response = await axios.post(apiUrl, {
        q: text,
        source: 'auto',
        target: targetLang,
        format: 'text',
        api_key: process.env.TRANSLATE_API_KEY || ''
    }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
    });
    
    return response.data.translatedText;
}
