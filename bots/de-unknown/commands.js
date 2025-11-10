import { formatTime, getRandomItem, validateArgs } from '../../shared/utils.js';

export async function processCommand(command, args, message, botType) {
    switch (command) {
        case 'menu':
            return showDeUnknownMenu();
        
        case 'mystery':
            return exploreMystery(args);
        
        case 'discover':
            return makeDiscovery(args, message.from);
        
        case 'puzzle':
            return solvePuzzle(args);
        
        case 'riddle':
            return getRiddle();
        
        case 'secret':
            return findSecret(args);
        
        case 'level':
            return checkMysteryLevel(message.from);
        
        case 'clue':
            return getClue(args);
        
        case 'decode':
            return decodeMessage(args);
        
        case 'encrypt':
            return encryptMessage(args);
        
        case 'predict':
            return makePrediction(args);
        
        case 'fortune':
            return getFortune();
        
        case 'wisdom':
            return getAncientWisdom();
        
        case 'challenge':
            return startChallenge(args);
        
        case 'quest':
            return beginQuest(message.from);
        
        default:
            return handleUnknownCommand(command);
    }
}

function showDeUnknownMenu() {
    return `🔮 DE-UNKNOWN MYSTERY BOT

🕵️ MYSTERY: mystery, discover, secret
🧩 PUZZLES: puzzle, riddle, decode
🔮 FORTUNE: predict, fortune, wisdom
🎯 CHALLENGE: challenge, quest, level
❓ CLUES: clue, encrypt

Type any command to explore the unknown...`;
}

function exploreMystery(topic) {
    const mysteries = [
        "🔍 Exploring: The Case of the Vanishing Message...",
        "🕵️ Investigating: Secret Patterns in Code...", 
        "🔮 Examining: Ancient Encryption Methods...",
        "📜 Researching: Lost Languages...",
        "💫 Probing: Cosmic Mysteries..."
    ];
    
    if (topic) {
        return `🔍 Investigating: "${topic}"\n\nClues found: ${Math.floor(Math.random() * 5) + 1}\nMystery level: ${Math.floor(Math.random() * 10) + 1}/10`;
    }
    
    return getRandomItem(mysteries);
}

function makeDiscovery(item, userId) {
    const discoveries = [
        "✨ Discovered: Hidden Chamber",
        "💎 Found: Ancient Artifact", 
        "📜 Uncovered: Secret Scroll",
        "🗝️ Obtained: Mystery Key",
        "🔓 Unlocked: Forbidden Knowledge"
    ];
    
    const discovery = item ? `🔍 Discovered: ${item}` : getRandomItem(discoveries);
    return `${discovery}\n\n🎯 Mystery Level Increased!`;
}

function solvePuzzle(puzzle) {
    const puzzles = {
        '1': "🧩 Puzzle: I speak without a mouth and hear without ears. What am I? \nAnswer: An echo",
        '2': "🧩 Puzzle: The more you take, the more you leave behind. What am I?\nAnswer: Footsteps", 
        '3': "🧩 Puzzle: What has keys but can't open locks?\nAnswer: A piano"
    };
    
    if (puzzle && puzzles[puzzle]) {
        return puzzles[puzzle];
    }
    
    return getRandomItem(Object.values(puzzles));
}

function getRiddle() {
    const riddles = [
        "❓ I'm light as a feather, but the strongest person can't hold me for long. What am I?",
        "❓ I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?",
        "❓ What comes once in a minute, twice in a moment, but never in a thousand years?",
        "❓ The more you have of it, the less you see. What is it?"
    ];
    
    const answers = [
        "Answer: Your breath",
        "Answer: A map", 
        "Answer: The letter 'M'",
        "Answer: Darkness"
    ];
    
    const index = Math.floor(Math.random() * riddles.length);
    return `${riddles[index]}\n\n💡 Think carefully... Use $solve for answer`;
}

function findSecret(code) {
    const secrets = {
        '1234': "🔐 Secret Unlocked: Basic Mysteries",
        '4321': "🔐 Secret Unlocked: Advanced Puzzles", 
        '7777': "🔐 Secret Unlocked: Master Level",
        '0000': "🔐 Secret Unlocked: Ultimate Knowledge"
    };
    
    if (code && secrets[code]) {
        return secrets[code];
    }
    
    return "🔍 Search for secrets... Try different codes\n💡 Hint: Numbers hold the key";
}

function checkMysteryLevel(userId) {
    const level = Math.floor(Math.random() * 100) + 1;
    const ranks = {
        1: "Novice Investigator",
        25: "Junior Detective", 
        50: "Master Sleuth",
        75: "Mystery Expert",
        90: "Legendary Explorer"
    };
    
    let rank = "Beginner";
    for (const [minLevel, rankName] of Object.entries(ranks)) {
        if (level >= minLevel) rank = rankName;
    }
    
    return `🔮 MYSTERY PROFILE:\n\nLevel: ${level}\nRank: ${rank}\nDiscoveries: ${Math.floor(level / 10)}\nProgress: ${level}%`;
}

function getClue(type) {
    const clues = {
        puzzle: "💡 Puzzle Clue: Look for patterns in the wording",
        mystery: "💡 Mystery Clue: Nothing is as it seems", 
        secret: "💡 Secret Clue: Numbers can be codes",
        general: "💡 General Clue: Sometimes the answer is simpler than you think"
    };
    
    return clues[type] || "💡 Clue: Explore everything. Question everything.";
}

function decodeMessage(message) {
    if (!validateArgs(message)) return '❌ Usage: $decode encoded message';
    
    // Simple "decoding" for demonstration
    const decoded = message.split('').reverse().join('');
    return `🔓 DECODED MESSAGE:\n\n"${decoded}"\n\n✨ Mystery revealed!`;
}

function encryptMessage(message) {
    if (!validateArgs(message)) return '❌ Usage: $encrypt your message';
    
    // Simple "encryption" for demonstration  
    const encrypted = message.split('').map(char => {
        return String.fromCharCode(char.charCodeAt(0) + 1);
    }).join('');
    
    return `🔐 ENCRYPTED MESSAGE:\n\n"${encrypted}"\n\n💡 Share this with $decode`;
}

function makePrediction(topic) {
    const predictions = [
        "🔮 Prediction: You will discover something important today",
        "🔮 Prediction: A mystery will be solved soon", 
        "🔮 Prediction: New knowledge awaits you",
        "🔮 Prediction: The answer you seek is closer than you think"
    ];
    
    if (topic) {
        return `🔮 Prediction about "${topic}": The signs point to revelation`;
    }
    
    return getRandomItem(predictions);
}

function getFortune() {
    const fortunes = [
        "🎴 Fortune: Adventure calls - answer it!",
        "🎴 Fortune: Your curiosity will be rewarded", 
        "🎴 Fortune: Secrets will be revealed to you",
        "🎴 Fortune: Trust your instincts in mysteries",
        "🎴 Fortune: A puzzle piece will fall into place"
    ];
    
    return getRandomItem(fortunes);
}

function getAncientWisdom() {
    const wisdoms = [
        "📜 Ancient Wisdom: The truth is rarely pure and never simple",
        "📜 Ancient Wisdom: In the middle of difficulty lies opportunity", 
        "📜 Ancient Wisdom: The only true wisdom is in knowing you know nothing",
        "📜 Ancient Wisdom: Curiosity is the wick in the candle of learning"
    ];
    
    return getRandomItem(wisdoms);
}

function startChallenge(type) {
    const challenges = {
        puzzle: "🎯 Puzzle Challenge: Solve 3 riddles in a row",
        mystery: "🎯 Mystery Challenge: Find the hidden pattern", 
        code: "🎯 Code Challenge: Break the encryption"
    };
    
    return challenges[type] || "🎯 Challenge: Explore the unknown and make a discovery!";
}

function beginQuest(userId) {
    const quests = [
        "⚔️ Quest: The Lost Temple of Knowledge",
        "⚔️ Quest: The Cryptic Codex", 
        "⚔️ Quest: The Phantom Riddle",
        "⚔️ Quest: The Enigma Chronicles"
    ];
    
    return `${getRandomItem(quests)}\n\n🎯 Objective: Solve the ultimate mystery\n⏳ Duration: Until solved\n🏆 Reward: Ultimate knowledge`;
}

function handleUnknownCommand(command) {
    const responses = [
        `🤔 "${command}"... Interesting. This command holds secrets.`,
        `🔍 "${command}" - A mystery to be solved.`, 
        `💫 "${command}" echoes in the void of unknown commands.`,
        `📜 "${command}" is written in ancient texts, but its meaning is lost.`
    ];
    
    return `${getRandomItem(responses)}\n\n💡 Try $mystery to explore further`;
}
