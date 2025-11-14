import { 
    validateArgs, 
    getRandomItem, 
    formatTime,
    validateModuleCommand,
    formatModuleResponse,
    logModuleExecution,
    handleModuleError
} from '../../shared/utils.js';

// Import modules
import { processGeneral } from './modules/general.js';
import { processAI } from './modules/ai.js';
import { processFun } from './modules/fun.js';
import { processBot } from './modules/bot.js';
import { processGroup } from './modules/group.js';
import { processDownload } from './modules/download.js';
import { processGod } from './modules/god.js';
import { processExtra } from './modules/extra.js';
import { processReaction } from './modules/reaction.js';

export async function processCommand(command, args, message, botType) {
    try {
        console.log(`🛠️ [ROUTER] Routing command: $${command}`);
        
        // Route to appropriate module
        switch (true) {
            // GENERAL MENU
            case validateModuleCommand(command, ['menu', 'help', 'ping', 'weather', 'currency', 'calc', 'time', 'reminder', 'notes', 'qr']):
                return await processGeneral(command, args, message, botType);
            
            // AI MENU
            case validateModuleCommand(command, ['ai', 'chatgpt', 'imageai', 'summarize', 'translate', 'code', 'ocr', 'sentiment']):
                return await processAI(command, args, message, botType);
            
            // FUN MENU
            case validateModuleCommand(command, ['fun', 'truth', 'dare', 'trivia', 'wordgame', 'card', 'joke', 'meme', 'fact', 'quote', '8ball']):
                return await processFun(command, args, message, botType);
            
            // BOT MENU
            case validateModuleCommand(command, ['bot', 'autoreply', 'stats', 'backup', 'schedule', 'trigger']):
                return await processBot(command, args, message, botType);
            
            // GROUP MENU
            case validateModuleCommand(command, ['group', 'antilink', 'welcome', 'rules', 'promote', 'demote', 'banword']):
                return await processGroup(command, args, message, botType);
            
            // DOWNLOAD MENU
            case validateModuleCommand(command, ['download', 'yt', 'ig', 'tiktok', 'fb', 'spotify', 'convert']):
                return await processDownload(command, args, message, botType);
            
            // GOD MENU
            case validateModuleCommand(command, ['god', 'bible', 'prayer', 'sermon', 'devotional', 'church']):
                return await processGod(command, args, message, botType);
            
            // EXTRA MENU
            case validateModuleCommand(command, ['extra', 'tts', 'imageedit', 'music', 'encrypt', 'virusscan', 'timer']):
                return await processExtra(command, args, message, botType);
            
            // REACTION MENU
            case validateModuleCommand(command, ['laugh', 'cry', 'fire', 'love', 'angry', 'clown', 'ghost', 'alien', 'robot', 'thumbsup', 'hearteyes', 'thinking', 'party', 'cool', 'sick', 'rich', 'shush', 'wave', 'flex']):
                return await processReaction(command, args, message, botType);
            
            default:
                return `❌ Unknown command: $${command}\nType $menu for all commands`;
        }
    } catch (error) {
        console.error(`❌ [ROUTER] Command routing failed:`, error);
        return `❌ Command processing failed. Please try again.`;
    }
}

// Helper function for module imports
export async function dynamicImport(moduleName) {
    try {
        const module = await import(`./modules/${moduleName}.js`);
        return module;
    } catch (error) {
        console.error(`❌ [ROUTER] Module import failed:`, error);
        return null;
    }
}

// Fallback for missing modules
export function getFallbackResponse(command) {
    const fallbacks = {
        'menu': `🦅 SAVAGE-X BOT - MAIN MENU\n\n📱 GENERAL: weather, currency, calc, time\n🤖 AI: chatgpt, imageai, summarize\n🎮 FUN: truth, dare, trivia, joke\n⚙️ BOT: autoreply, stats, backup\n👥 GROUP: antilink, welcome, rules\n📥 DOWNLOAD: yt, ig, tiktok\n🙏 GOD: bible, prayer, devotional\n🎵 EXTRA: tts, imageedit, music\n😂 REACTIONS: laugh, cry, fire, love\n\n🔧 Some modules temporarily unavailable`,
        'ping': `🏓 Pong! Savage-X Active\n⏰ ${formatTime()}`,
        'help': `Type $menu to see all available commands\n$help <category> for specific help`
    };
    
    return fallbacks[command] || `❌ Command temporarily unavailable: $${command}`;
}
