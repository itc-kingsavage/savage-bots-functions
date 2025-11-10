import { formatTime, getRandomItem, validateArgs } from '../../shared/utils.js';

export async function processCommand(command, args, message, botType) {
    switch (command) {
        case 'menu':
            return showRoyalMenu();
        
        case 'royal':
            return royalDecree(args);
        
        case 'bow':
            return showLoyalty(message.from);
        
        case 'court':
            return manageCourt(args, message.from);
        
        case 'rank':
            return checkRoyalRank(message.from);
        
        case 'favor':
            return requestFavor(args, message.from);
        
        case 'banquet':
            return hostBanquet();
        
        case 'ball':
            return royalBall();
        
        case 'jester':
            return courtJester();
        
        case 'throne':
            return throneRoom();
        
        case 'crown':
            return crownJewels();
        
        case 'scepter':
            return royalScepter();
        
        case 'proclamation':
            return royalProclamation(args);
        
        case 'knight':
            return knightUser(args);
        
        case 'quest':
            return royalQuest(args);
        
        case 'treasure':
            return royalTreasure();
        
        case 'castle':
            return exploreCastle();
        
        case 'garden':
            return royalGarden();
        
        case 'library':
            return royalLibrary();
        
        default:
            return `👑 Her Majesty does not recognize "$${command}"\nType $menu for royal commands`;
    }
}

function showRoyalMenu() {
    return `👑 QUEEN RIXIE'S ROYAL COURT 👑

🎭 ROYALTY: royal, bow, rank, crown
🏛️ COURT: court, favor, knight, proclamation  
🎪 EVENTS: banquet, ball, jester
🏰 CASTLE: throne, castle, garden, library
⚔️ QUESTS: quest, treasure, scepter

💎 Show your loyalty to the Crown!`;
}

function royalDecree(decree) {
    if (!validateArgs(decree)) {
        return `📜 ROYAL DECREES:
• $royal tax - Tax the peasants
• $royal feast - Announce a feast
• $royal law - Proclaim new law
• $royal pardon - Grant royal pardon`;
    }
    
    const decrees = {
        tax: "💸 ROYAL DECREE: All peasants shall pay 10% tax to the Crown!",
        feast: "🍗 ROYAL DECREE: A grand feast is announced for the entire kingdom!",
        law: "⚖️ ROYAL DECREE: From this day forth, loyalty to the Crown is mandatory!",
        pardon: "🕊️ ROYAL DECREE: All past offenses are pardoned by Her Majesty!"
    };
    
    return decrees[decree] || `📜 ROYAL DECREE: ${decree}\n\nSo commands Her Majesty Queen Rixie!`;
}

function showLoyalty(userId) {
    const loyalActions = [
        "🙇 You bow deeply before Her Majesty",
        "👑 You kneel and swear fealty to the Crown", 
        "💫 You present a gift to Queen Rixie",
        "🎭 You perform a loyal dance for the Court",
        "📜 You recite the Oath of Loyalty"
    ];
    
    return `${getRandomItem(loyalActions)}\n\n💎 Loyalty points increased!`;
}

function manageCourt(action, userId) {
    if (!action) {
        return `🏛️ ROYAL COURT MANAGEMENT:
• $court join - Request to join Royal Court
• $court leave - Leave the Royal Court  
• $court status - Check court membership
• $court list - See court members`;
    }
    
    const actions = {
        join: "📜 Request to join Royal Court submitted!\nAwaiting Her Majesty's approval...",
        leave: "You have left the Royal Court.\nHer Majesty is... disappointed.",
        status: "🏛️ Court Status: Pending approval\nProve your loyalty to join!",
        list: "👑 ROYAL COURT MEMBERS:\n• Royal Advisor\n• Court Jester\n• 5 Loyal Knights"
    };
    
    return actions[action] || `🏛️ Court action "${action}" processed by Her Majesty`;
}

function checkRoyalRank(userId) {
    const ranks = [
        "Peasant 👨‍🌾",
        "Serf 🧑‍💼", 
        "Commoner 👨‍🎨",
        "Merchant 🧑‍💼",
        "Knight ⚔️",
        "Baron 🧑‍⚖️",
        "Count 👑",
        "Duke 💎",
        "Prince 🤴",
        "Royal 👑"
    ];
    
    const rank = getRandomItem(ranks);
    const points = Math.floor(Math.random() * 1000);
    
    return `👑 ROYAL RANK:\n\nRank: ${rank}\nLoyalty Points: ${points}\nFavors: ${Math.floor(points/100)}\n\n💎 Serve the Crown to rise in rank!`;
}

function requestFavor(favor, userId) {
    const favors = {
        gold: "💰 Favor Granted: 100 gold coins from Royal Treasury!",
        land: "🏞️ Favor Granted: A small plot of land in the kingdom!",
        title: "🎖️ Favor Granted: Honorary title 'Friend of the Crown'!",
        protection: "🛡️ Favor Granted: Royal protection for your family!"
    };
    
    if (favor && favors[favor]) {
        return favors[favor];
    }
    
    return `🎭 ROYAL FAVORS:\n• $favor gold\n• $favor land\n• $favor title\n• $favor protection\n\n💎 Her Majesty may grant your request if you prove loyal`;
}

function hostBanquet() {
    const foods = [
        "Roast boar with honey glaze",
        "Venison stew with winter vegetables", 
        "Freshly baked bread with royal butter",
        "Apple pie with cinnamon spice",
        "Fine wine from the royal cellars"
    ];
    
    return `🍗 ROYAL BANQUET:\n\nHer Majesty hosts a grand feast!\n\nMenu:\n${foods.map(food => `• ${food}`).join('\n')}\n\n🎉 All loyal subjects are invited!`;
}

function royalBall() {
    const activities = [
        "Elegant waltzes in the grand ballroom",
        "Court musicians playing classical melodies", 
        "Nobles exchanging polite conversation",
        "Her Majesty leading the first dance",
        "Fireworks over the castle gardens"
    ];
    
    return `💃 ROYAL BALL:\n\nThe castle ballroom sparkles with elegance!\n\nActivities:\n${activities.map(act => `• ${act}`).join('\n')}\n\n🎭 Dress in your finest attire!`;
}

function courtJester() {
    const jokes = [
        "Why did the knight join the theater? He wanted to play a starring role!",
        "What do you call a royal who tells bad jokes? The Pun-cess!", 
        "Why was the castle so noisy? Because the knights were always clanging!",
        "What's a dragon's favorite royal food? Knight-bread!"
    ];
    
    return `🎭 COURT JESTER:\n\n"${getRandomItem(jokes)}"\n\n😂 The entire court erupts in laughter!`;
}

function throneRoom() {
    return `🪙 THRONE ROOM:\n\nYou stand before the magnificent golden throne where Queen Rixie holds court.\n\n💎 The room shimmers with jewels and gold\n👑 Her Majesty's presence commands respect\n📜 Scrolls of law cover the walls\n🛡️ Royal guards stand vigilant\n\n🙇 You feel humbled in this sacred space`;
}

function crownJewels() {
    const jewels = [
        "💎 The Star of the Kingdom diamond",
        "👑 The Royal Crown with 100 precious stones", 
        "💍 The Scepter of Power encrusted with rubies",
        "📿 The Necklace of Wisdom with ancient pearls",
        "💠 The Royal Ring bearing the kingdom's seal"
    ];
    
    return `💎 CROWN JEWELS:\n\nProtected in the royal vault:\n\n${jewels.map(jewel => `• ${jewel}`).join('\n')}\n\n✨ Priceless treasures of the kingdom!`;
}

function royalScepter() {
    return `📿 ROYAL SCEPTER:\n\nHer Majesty's scepter glows with ancient power!\n\n✨ Can grant wishes to the truly loyal\n💫 Channels the magic of the kingdom\n🔮 Only responds to royal bloodline\n⚡ Humming with mysterious energy\n\n🪄 A symbol of absolute authority`;
}

function royalProclamation(message) {
    if (!validateArgs(message)) return '❌ Usage: $proclamation Your message here';
    
    return `📢 ROYAL PROCLAMATION:\n\n"${message}"\n\n- By order of Queen Rixie\n\n🎺 Heralds announce this throughout the kingdom!`;
}

function knightUser(user) {
    if (!validateArgs(user)) return '❌ Usage: $knight @username';
    
    return `⚔️ KNIGHTING CEREMONY:\n\n${user} kneels before Queen Rixie...\n\n👑 "Arise, Sir ${user.split('@')[0]}!"\n\n💎 You are now a Knight of the Royal Court!\n🛡️ Sworn to protect the kingdom!`;
}

function royalQuest(questType) {
    const quests = {
        dragon: "🐉 ROYAL QUEST: Slay the dragon terrorizing the northern villages!",
        treasure: "🗺️ ROYAL QUEST: Find the lost treasure of the ancient kings!",
        artifact: "🔮 ROYAL QUEST: Retrieve the magical artifact from the forbidden forest!",
        diplomacy: "🕊️ ROYAL QUEST: Negotiate peace with the neighboring kingdom!"
    };
    
    return quests[questType] || `⚔️ ROYAL QUEST: Serve the Crown with honor and loyalty!\n\nReward: Her Majesty's favor and royal recognition!`;
}

function royalTreasure() {
    const treasures = [
        "Chests overflowing with gold coins 💰",
        "Ancient artifacts from forgotten civilizations 🏺", 
        "Magical weapons of legendary heroes ⚔️",
        "Precious gems that glow in the dark 💎",
        "Scrolls containing lost knowledge 📜"
    ];
    
    return `🗝️ ROYAL TREASURE VAULT:\n\nGuarded by loyal knights and ancient magic:\n\n${treasures.map(treasure => `• ${treasure}`).join('\n')}\n\n💎 The wealth of generations protected for the kingdom!`;
}

function exploreCastle() {
    const rooms = [
        "Great Hall with towering banners",
        "Royal Library with ancient books", 
        "Armory filled with shining weapons",
        "Royal Chambers with silk drapes",
        "Dungeons (best avoided)",
        "Tower with panoramic kingdom views"
    ];
    
    return `🏰 CASTLE EXPLORATION:\n\nYou wander through the magnificent castle:\n\n${rooms.map(room => `• ${room}`).join('\n')}\n\n🔑 Some areas require royal permission to enter!`;
}

function royalGarden() {
    const features = [
        "Fountains with crystal clear water",
        "Roses of every color imaginable", 
        "Herb garden for royal kitchens",
        "Maze of perfectly trimmed hedges",
        "Pavilion for royal tea parties",
        "Peacocks strutting proudly"
    ];
    
    return `🌹 ROYAL GARDENS:\n\nA paradise of beauty and tranquility:\n\n${features.map(feature => `• ${feature}`).join('\n')}\n\n🌸 Her Majesty's favorite place for contemplation`;
}

function royalLibrary() {
    const books = [
        "Histories of the kingdom's founding",
        "Genealogies of the royal family", 
        "Books of law and governance",
        Ancient spell tomes (forbidden section)",
        "Maps of the known world",
        "Philosophical works of great thinkers"
    ];
    
    return `📚 ROYAL LIBRARY:\n\nWisdom of ages preserved in ink:\n\n${books.map(book => `• ${book}`).join('\n')}\n\n🕯️ Scholars study here by candlelight`;
}
