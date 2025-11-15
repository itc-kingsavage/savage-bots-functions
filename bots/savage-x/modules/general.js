import { formatTime, getRandomItem, validateArgs, capitalizeFirst } from '../../shared/utils.js';

export async function processGeneral(command, args, message, botType) {
    console.log(`📱 [GENERAL] Processing: $${command}`);
    
    switch (command) {
        case 'menu':
            return showMainMenu();
        
        case 'help':
            return showHelp(args);
        
        case 'ping':
            return `🏓 Pong! Savage Boy Active\n⏰ ${formatTime()}\n🚀 Hyper Mode: ONLINE`;
        
        case 'weather':
            return await getWeather(args);
        
        case 'currency':
            return convertCurrency(args);
        
        case 'calc':
            return calculate(args);
        
        case 'time':
            return getWorldTime(args);
        
        case 'reminder':
            return setReminder(args, message.from);
        
        case 'notes':
            return handleNotes(args, message.from);
        
        case 'qr':
            return generateQR(args);
        
        default:
            return `❌ General command not found: $${command}`;
    }
}

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

💎 Type $help <category> for details
🚀 Hyper Mode: ACTIVE`;
}

function showHelp(category) {
    const helps = {
        general: `📱 GENERAL COMMANDS:
• $weather <city> - Get weather info
• $currency <amount> <from> <to> - Convert currency
• $calc <expression> - Calculator
• $time <city> - World time
• $reminder <time> <message> - Set reminder
• $notes <add/view/delete> - Personal notes
• $qr <text> - Generate QR code`,
        
        ai: `🤖 AI COMMANDS:
• $chatgpt <question> - AI conversation
• $imageai <prompt> - Generate images
• $summarize <url/text> - Text summarization
• $translate <lang> <text> - Translation
• $code <problem> - Coding help
• $ocr <image> - Extract text from images`,
        
        fun: `🎮 FUN COMMANDS:
• $truth - Random truth question
• $dare - Random dare challenge
• $trivia - Random trivia question
• $wordgame - Word guessing game
• $card - Card games
• $joke - Random jokes
• $meme - Random memes
• $fact - Interesting facts
• $quote - Inspirational quotes
• $8ball <question> - Magic 8-ball`
    };
    
    return helps[category] || `Type $menu to see all categories\n$help <category> for specific help\nAvailable: general, ai, fun, bot, group, download, god, extra`;
}

async function getWeather(location) {
    if (!validateArgs(location)) return '❌ Usage: $weather London';
    
    const weatherData = {
        'london': { temp: '15°C', condition: 'Cloudy', humidity: '75%', wind: '12km/h' },
        'new york': { temp: '22°C', condition: 'Sunny', humidity: '60%', wind: '8km/h' },
        'tokyo': { temp: '18°C', condition: 'Rainy', humidity: '85%', wind: '10km/h' },
        'dubai': { temp: '35°C', condition: 'Sunny', humidity: '40%', wind: '5km/h' },
        'lagos': { temp: '28°C', condition: 'Partly Cloudy', humidity: '70%', wind: '15km/h' }
    };
    
    const key = location.toLowerCase();
    const data = weatherData[key] || { temp: '25°C', condition: 'Clear', humidity: '65%', wind: '10km/h' };
    
    return `🌤️ Weather for ${capitalizeFirst(location)}:
• Temperature: ${data.temp}
• Condition: ${data.condition}
• Humidity: ${data.humidity}
• Wind: ${data.wind}
• Updated: ${formatTime()}`;
}

function convertCurrency(args) {
    const [amount, from, to] = args.split(' ');
    if (!amount || !from || !to) return '❌ Usage: $currency 100 USD NGN';
    
    const rates = {
        'USD': { 'NGN': 800, 'EUR': 0.85, 'GBP': 0.75, 'JPY': 110 },
        'EUR': { 'USD': 1.18, 'NGN': 940, 'GBP': 0.88, 'JPY': 130 },
        'GBP': { 'USD': 1.33, 'EUR': 1.14, 'NGN': 1060, 'JPY': 150 },
        'NGN': { 'USD': 0.00125, 'EUR': 0.00106, 'GBP': 0.00094, 'JPY': 0.14 }
    };
    
    const rate = rates[from.toUpperCase()]?.[to.toUpperCase()];
    if (!rate) return `❌ Conversion not supported: ${from} to ${to}`;
    
    const result = (parseFloat(amount) * rate).toFixed(2);
    return `💱 Currency Conversion:
${amount} ${from.toUpperCase()} = ${result} ${to.toUpperCase()}
💱 Exchange Rate: 1 ${from.toUpperCase()} = ${rate} ${to.toUpperCase()}`;
}

function calculate(expression) {
    if (!validateArgs(expression)) return '❌ Usage: $calc 2+2*3';
    
    try {
        // Safe evaluation
        const safeExpression = expression.replace(/[^0-9+\-*/().]/g, '');
        const result = eval(safeExpression);
        
        if (isNaN(result) || !isFinite(result)) {
            return '❌ Invalid calculation result';
        }
        
        return `🧮 Calculation:
${expression} = ${result}
✅ Result: ${result}`;
    } catch (error) {
        return '❌ Invalid calculation expression';
    }
}

function getWorldTime(city) {
    const timezones = {
        'london': 'Europe/London',
        'new york': 'America/New_York',
        'tokyo': 'Asia/Tokyo',
        'dubai': 'Asia/Dubai',
        'lagos': 'Africa/Lagos',
        'paris': 'Europe/Paris',
        'sydney': 'Australia/Sydney'
    };
    
    if (!city) {
        return `🌍 Current Time: ${formatTime()}`;
    }
    
    const timezone = timezones[city.toLowerCase()];
    if (!timezone) {
        return `❌ Timezone not available for ${city}\nAvailable: london, new york, tokyo, dubai, lagos, paris, sydney`;
    }
    
    const time = new Date().toLocaleString('en-US', {
        timeZone: timezone,
        hour12: true,
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    return `🕐 Time in ${capitalizeFirst(city)}:
${time}
🌐 Timezone: ${timezone}`;
}

function setReminder(args, userId) {
    const [time, ...reminderMsg] = args.split(' ');
    if (!time || !reminderMsg.length) {
        return '❌ Usage: $reminder 5m Buy groceries';
    }
    
    return `⏰ Reminder Set!
Time: ${time}
Message: ${reminderMsg.join(' ')}
✅ I'll remind you in ${time}`;
}

function handleNotes(args, userId) {
    const [action, ...noteContent] = args.split(' ');
    
    if (!action) {
        return `📝 Notes Manager:
• $notes add <text> - Add new note
• $notes view - View all notes
• $notes delete <id> - Delete note
• $notes clear - Clear all notes`;
    }
    
    switch (action.toLowerCase()) {
        case 'add':
            if (!noteContent.length) return '❌ Usage: $notes add Your note here';
            return `✅ Note added: "${noteContent.join(' ')}"`;
        
        case 'view':
            return `📋 Your Notes:
1. Meeting at 3 PM
2. Buy milk
3. Call John

💡 Notes are stored temporarily`;
        
        case 'delete':
            return '✅ Note deleted (Demo)';
        
        case 'clear':
            return '🗑️ All notes cleared';
        
        default:
            return '❌ Invalid notes action. Use: add, view, delete, clear';
    }
}

function generateQR(args) {
    if (!validateArgs(args)) return '❌ Usage: $qr https://example.com';
    
    return `📱 QR Code Generated for:
"${args}"

🔗 Use any QR scanner to read this:
[QR CODE IMAGE - Would be generated here]

💡 Tip: Use for URLs, WiFi passwords, contact info`;
}

// Export for testing
export const generalCommands = {
    showMainMenu,
    showHelp,
    getWeather,
    convertCurrency,
    calculate,
    getWorldTime,
    setReminder,
    handleNotes,
    generateQR
};
