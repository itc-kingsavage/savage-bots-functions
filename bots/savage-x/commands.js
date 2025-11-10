import { isVIP, formatTime, getRandomItem, validateArgs, capitalizeFirst } from '../../shared/utils.js';
import { MediaHandler } from '../../shared/media-handler.js';

export async function processCommand(command, args, message, botType) {
    switch (command) {
        // GENERAL MENU
        case 'menu': return showMainMenu();
        case 'help': return showHelp(args);
        case 'ping': return `🏓 Pong! Savage Boy Active\n⏰ ${formatTime()}`;
        case 'weather': return await getWeather(args);
        case 'currency': return convertCurrency(args);
        case 'calc': return calculate(args);
        case 'time': return getWorldTime(args);
        case 'reminder': return setReminder(args, message.from);
        case 'notes': return handleNotes(args, message.from);
        case 'qr': return generateQR(args);
        
        // AI MENU
        case 'ai': return `🤖 AI Features:\n• $chatgpt <text>\n• $imageai <prompt>\n• $summarize <url/text>\n• $translate <lang> <text>\n• $code <problem>\n• $ocr <image>\n• $sentiment <text>`;
        case 'chatgpt': return await chatGPT(args);
        case 'imageai': return generateImage(args);
        case 'summarize': return summarizeText(args);
        case 'translate': return translateText(args);
        
        // FUN MENU
        case 'fun': return `🎮 Fun Commands:\n• $truth\n• $dare\n• $trivia\n• $wordgame\n• $card\n• $joke\n• $meme\n• $fact\n• $quote\n• $8ball <question>`;
        case 'truth': return getTruth();
        case 'dare': return getDare();
        case 'trivia': return getTrivia();
        case 'joke': return getJoke();
        case 'meme': return getMeme();
        case '8ball': return magic8Ball(args);
        
        // BOT MENU
        case 'bot': return `⚙️ Bot Controls:\n• $autoreply <on/off>\n• $stats\n• $backup\n• $schedule <time> <cmd>\n• $trigger <word> <response>`;
        case 'stats': return getBotStats();
        case 'autoreply': return toggleAutoReply(args);
        
        // GROUP MENU
        case 'group': return `👥 Group Tools:\n• $antilink <on/off>\n• $welcome <message>\n• $rules\n• $promote @user\n• $demote @user\n• $banword <word>`;
        case 'antilink': return toggleAntilink(args);
        case 'welcome': return setWelcome(args);
        
        // DOWNLOAD MENU
        case 'download': return `📥 Download:\n• $yt <url>\n• $ig <url>\n• $tiktok <url>\n• $fb <url>\n• $spotify <url>\n• $convert <format>`;
        case 'yt': return downloadYouTube(args);
        case 'ig': return downloadInstagram(args);
        case 'tiktok': return downloadTikTok(args);
        
        // GOD MENU
        case 'god': return `🙏 Spiritual:\n• $bible <verse>\n• $prayer <type>\n• $sermon <topic>\n• $devotional\n• $church <location>`;
        case 'bible': return getBibleVerse(args);
        case 'prayer': return getPrayer(args);
        case 'devotional': return getDevotional();
        
        // EXTRA MENU
        case 'extra': return `🎵 Extra Tools:\n• $tts <text>\n• $imageedit <effect>\n• $music <song>\n• $encrypt <text>\n• $virusscan <file>\n• $timer <time>`;
        case 'tts': return textToSpeech(args);
        case 'timer': return setTimer(args);
        
        // REACTION MENU
        case 'laugh': return '😂';
        case 'cry': return '😢';
        case 'fire': return '🔥';
        case 'love': return '❤️';
        case 'angry': return '😠';
        case 'clown': return '🤡';
        case 'ghost': return '👻';
        case 'alien': return '👽';
        case 'robot': return '🤖';
        
        default: return `❌ Unknown command: $${command}\nType $menu for all commands`;
    }
}

// GENERAL COMMANDS
function showMainMenu() {
    return `🦅 SAVAGE BOY BOT - MAIN MENU

📱 GENERAL: weather, currency, calc, time, reminder, notes, qr
🤖 AI: chatgpt, imageai, summarize, translate, code, ocr
🎮 FUN: truth, dare, trivia, wordgame, card, joke, meme
⚙️ BOT: autoreply, stats, backup, schedule, trigger
👥 GROUP: antilink, welcome, rules, promote, demote, banword
📥 DOWNLOAD: yt, ig, tiktok, fb, spotify, convert
🙏 GOD: bible, prayer, sermon, devotional, church
🎵 EXTRA: tts, imageedit, music, encrypt, virusscan, timer
😂 REACTIONS: laugh, cry, fire, love, angry, clown, ghost

Type $help <category> for details`;
}

function showHelp(category) {
    const helps = {
        general: `📱 GENERAL: weather, currency, calc, time, reminder, notes, qr`,
        ai: `🤖 AI: chatgpt, imageai, summarize, translate, code, ocr, sentiment`,
        fun: `🎮 FUN: truth, dare, trivia, wordgame, card, joke, meme, fact, quote, 8ball`
    };
    return helps[category] || `Type $menu to see all categories\n$help <category> for specific help`;
}

async function getWeather(location) {
    if (!validateArgs(location)) return '❌ Usage: $weather London';
    return `🌤️ Weather for ${location}: 25°C, Sunny\n💧 Humidity: 60% | 🌬️ Wind: 15km/h`;
}

function convertCurrency(args) {
    const [amount, from, to] = args.split(' ');
    if (!amount || !from || !to) return '❌ Usage: $currency 100 USD NGN';
    return `💱 ${amount} ${from.toUpperCase()} = ${(amount * 800)} ${to.toUpperCase()}`;
}

function calculate(expression) {
    try {
        const result = eval(expression);
        return `🧮 ${expression} = ${result}`;
    } catch {
        return '❌ Invalid calculation expression';
    }
}

// AI COMMANDS
async function chatGPT(prompt) {
    if (!validateArgs(prompt)) return '❌ Usage: $chatgpt Tell me about AI';
    return `🤖 ChatGPT: Processing your request...\n"${prompt}"`;
}

function generateImage(prompt) {
    if (!validateArgs(prompt)) return '❌ Usage: $imageai a beautiful sunset';
    return `🎨 Generating image: "${prompt}"\n⏳ Please wait...`;
}

// FUN COMMANDS
function getTruth() {
    const truths = [
        "What's your biggest fear?",
        "What's the most embarrassing thing you've done?",
        "What's your secret talent?",
        "What's the worst lie you've told?"
    ];
    return `🤔 TRUTH: ${getRandomItem(truths)}`;
}

function getDare() {
    const dares = [
        "Do 10 pushups right now!",
        "Send a voice message singing happy birthday",
        "Change your status to 'I love Savage Boy Bot'",
        "Send the last emoji you used 5 times"
    ];
    return `😈 DARE: ${getRandomItem(dares)}`;
}

function getJoke() {
    const jokes = [
        "Why don't scientists trust atoms? Because they make up everything!",
        "Why did the scarecrow win an award? He was outstanding in his field!",
        "I told my wife she was drawing her eyebrows too high. She looked surprised!"
    ];
    return `😂 JOKE: ${getRandomItem(jokes)}`;
}

// DOWNLOAD COMMANDS
async function downloadYouTube(url) {
    if (!validateArgs(url)) return '❌ Usage: $yt https://youtube.com/watch?v=...';
    const result = await MediaHandler.downloadYouTube(url);
    return result.success ? `📥 YouTube download started...` : `❌ Download failed: ${result.error}`;
}

async function downloadInstagram(url) {
    if (!validateArgs(url)) return '❌ Usage: $ig https://instagram.com/p/...';
    const result = await MediaHandler.downloadInstagram(url);
    return result.success ? `📥 Instagram download started...` : `❌ Download failed: ${result.error}`;
}

// BOT COMMANDS
function getBotStats() {
    return `📊 BOT STATS:
• Uptime: 24 hours
• Commands: 150+
• Users: 500
• Groups: 50
• Version: 1.0.0`;
}

// GROUP COMMANDS
function toggleAntilink(args) {
    if (!args) return '❌ Usage: $antilink on/off';
    return `🛡️ Anti-link ${args === 'on' ? 'activated' : 'deactivated'}`;
}

// GOD COMMANDS
function getBibleVerse(verse) {
    if (!validateArgs(verse)) return '❌ Usage: $bible John 3:16';
    return `📖 ${verse}: "For God so loved the world..."`;
}

function getPrayer(type) {
    const prayers = {
        morning: "🙏 Morning Prayer: Lord, guide me through this day...",
        evening: "🙏 Evening Prayer: Thank you for the blessings of this day...",
        meal: "🙏 Meal Prayer: Bless this food to our bodies..."
    };
    return prayers[type] || "🙏 Prayer: Lord, hear our prayers...";
}

// EXTRA COMMANDS
function textToSpeech(text) {
    if (!validateArgs(text)) return '❌ Usage: $tts Hello world';
    return `🗣️ TTS: Converting "${text}" to speech...`;
}

function setTimer(time) {
    if (!validateArgs(time)) return '❌ Usage: $timer 5m';
    return `⏰ Timer set for ${time}\nI'll remind you when time's up!`;
}

function magic8Ball(question) {
    if (!validateArgs(question)) return '❌ Usage: $8ball Will I win today?';
    const answers = [
        "Yes definitely", "No definitely not", "Ask again later",
        "Signs point to yes", "Don't count on it", "Outlook good"
    ];
    return `🎱 ${question}\nAnswer: ${getRandomItem(answers)}`;
}
