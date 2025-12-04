const { isVIP } = require('../../../shared/utils.js');

const vipThemes = new Map();

module.exports = {
    name: 'theme',
    description: 'Custom bot theme (VIP only)',
    category: 'vip',
    async execute(args, message, client, botType) {
        if (!isVIP(message.from)) {
            return '❌ VIP access required for custom themes.';
        }
        
        const [action, ...params] = args.toLowerCase().split(' ');
        const userId = message.from;
        
        switch (action) {
            case 'set':
                return setTheme(userId, params[0], params.slice(1));
            case 'list':
                return listThemes();
            case 'preview':
                return previewTheme(params[0]);
            case 'reset':
                return resetTheme(userId);
            case 'current':
                return getCurrentTheme(userId);
            default:
                return `🎨 *VIP CUSTOM THEMES*\n\n• $vip theme list - Available themes\n• $vip theme set <name> - Apply theme\n• $vip theme preview <name> - Preview theme\n• $vip theme reset - Reset to default\n• $vip theme current - Your current theme\n\n💎 Personalize your Savage-X experience!`;
        }
    }
};

function setTheme(userId, themeName, options = []) {
    const themes = {
        'dark': { bg: 'black', text: 'white', accent: 'cyan' },
        'light': { bg: 'white', text: 'black', accent: 'blue' },
        'matrix': { bg: 'black', text: 'green', accent: 'lime' },
        'royal': { bg: 'purple', text: 'gold', accent: 'silver' },
        'ocean': { bg: 'blue', text: 'white', accent: 'cyan' },
        'fire': { bg: 'red', text: 'yellow', accent: 'orange' },
        'cyber': { bg: 'darkblue', text: 'neon', accent: 'pink' }
    };
    
    if (!themeName || !themes[themeName]) {
        return `❌ Theme not found. Available: ${Object.keys(themes).join(', ')}`;
    }
    
    const theme = {
        ...themes[themeName],
        name: themeName,
        appliedAt: Date.now(),
        customOptions: options
    };
    
    vipThemes.set(userId, theme);
    
    // Apply theme to user session
    applyThemeToSession(userId, theme);
    
    return `✅ Theme applied: ${themeName.toUpperCase()}\n🎨 Colors: ${theme.bg}/${theme.text}/${theme.accent}\n💡 Your commands will now use this theme!`;
}

function listThemes() {
    const themeList = [
        '🎨 DARK - Black background, white text',
        '☀️ LIGHT - White background, black text', 
        '💚 MATRIX - Green on black (hacker style)',
        '👑 ROYAL - Gold on purple (royal style)',
        '🌊 OCEAN - Blue theme (calm waters)',
        '🔥 FIRE - Red/yellow (hot theme)',
        '🤖 CYBER - Neon cyberpunk style'
    ];
    
    return `🎨 *VIP THEMES*\n\n${themeList.join('\n')}\n\n💡 Use: $vip theme set <name>`;
}

function previewTheme(themeName) {
    const themes = {
        'dark': '⬛ *DARK THEME*\n▫️ Background: Black\n▫️ Text: White\n▫️ Accent: Cyan',
        'light': '⬜ *LIGHT THEME*\n▫️ Background: White\n▫️ Text: Black\n▫️ Accent: Blue',
        'matrix': '💚 *MATRIX THEME*\n▫️ Background: Black\n▫️ Text: Green\n▫️ Accent: Lime'
    };
    
    if (!themeName || !themes[themeName]) {
        return '❌ Preview available for: dark, light, matrix';
    }
    
    return themes[themeName];
}

function resetTheme(userId) {
    const hadTheme = vipThemes.has(userId);
    vipThemes.delete(userId);
    
    return hadTheme 
        ? '✅ Theme reset to default Savage-X theme.'
        : 'ℹ️ No custom theme was active.';
}

function getCurrentTheme(userId) {
    const theme = vipThemes.get(userId);
    
    if (!theme) {
        return '🎨 Current: DEFAULT Savage-X theme\n💡 Use: $vip theme list to see options';
    }
    
    const age = Date.now() - theme.appliedAt;
    const hours = Math.floor(age / (1000 * 60 * 60));
    
    return `🎨 *YOUR THEME*\n\n• Name: ${theme.name.toUpperCase()}\n• Colors: ${theme.bg}/${theme.text}/${theme.accent}\n• Applied: ${hours} hours ago\n• Custom: ${theme.customOptions.length > 0 ? theme.customOptions.join(', ') : 'None'}`;
}

function applyThemeToSession(userId, theme) {
    // This would apply theme to user's session in a real implementation
    console.log(`Theme applied for ${userId}:`, theme.name);
}
