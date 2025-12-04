const fs = require('fs');
const path = require('path');
const { validateArgs, isVIP, isAdminUser } = require('../../../shared/utils.js');

module.exports = {
    name: 'users',
    description: 'Manage users (VIP/Admin)',
    category: 'admin',
    async execute(args, message, client, botType) {
        const [action, ...rest] = args.toLowerCase().split(' ');
        const target = rest[0]?.trim();
        
        switch (action) {
            case 'list':
                return listUsers();
            case 'add':
                return await addUser(target, rest[1]?.toLowerCase(), message);
            case 'remove':
                return await removeUser(target, rest[1]?.toLowerCase(), message);
            case 'info':
                return getUserInfo(target);
            default:
                return `👥 User Management:\n• $admin users list - List all VIP/Admin users\n• $admin users add <number> [vip/admin] - Add user\n• $admin users remove <number> [vip/admin] - Remove user\n• $admin users info <number> - Get user info`;
        }
    }
};

function listUsers() {
    const usersFile = path.join(process.cwd(), 'config', 'users.json');
    
    if (!fs.existsSync(usersFile)) {
        return '📭 No users data found.';
    }
    
    const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    
    const vipList = users.vip?.map(u => `• ${u.id} - ${u.name || 'Unknown'}`).join('\n') || 'None';
    const adminList = users.admin?.map(u => `• ${u.id} - ${u.name || 'Unknown'}`).join('\n') || 'None';
    
    return `⭐ VIP Users (${users.vip?.length || 0}):\n${vipList}\n\n👑 Admin Users (${users.admin?.length || 0}):\n${adminList}`;
}

async function addUser(userId, type, message) {
    if (!userId || !type) {
        return '📝 Usage: $admin users add <number> [vip/admin]';
    }
    
    // Format userId to WhatsApp format
    const formattedId = userId.includes('@c.us') ? userId : `${userId.replace(/[^0-9]/g, '')}@c.us`;
    
    const usersFile = path.join(process.cwd(), 'config', 'users.json');
    const users = fs.existsSync(usersFile) ? JSON.parse(fs.readFileSync(usersFile, 'utf8')) : { vip: [], admin: [] };
    
    // Check if already exists
    const existing = [...(users.vip || []), ...(users.admin || [])]
        .find(u => u.id === formattedId);
    
    if (existing) {
        return `ℹ️ User ${formattedId} already exists as ${existing.type}.`;
    }
    
    // Get user info from WhatsApp
    let userName = 'Unknown';
    try {
        const contact = await message.getContact();
        userName = contact.pushname || contact.name || 'Unknown';
    } catch (error) {
        console.error('Failed to get contact:', error);
    }
    
    const userEntry = {
        id: formattedId,
        name: userName,
        addedBy: message.from,
        addedAt: new Date().toISOString(),
        type: type
    };
    
    if (type === 'vip') {
        users.vip = users.vip || [];
        users.vip.push(userEntry);
    } else if (type === 'admin') {
        users.admin = users.admin || [];
        users.admin.push(userEntry);
    } else {
        return '❌ Type must be "vip" or "admin"';
    }
    
    // Save to file
    fs.mkdirSync(path.dirname(usersFile), { recursive: true });
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    
    // Update environment cache
    if (type === 'vip') {
        process.env.VIP_USERS = [...(process.env.VIP_USERS?.split(',') || []), formattedId].filter(Boolean).join(',');
    } else {
        process.env.ADMIN_USERS = [...(process.env.ADMIN_USERS?.split(',') || []), formattedId].filter(Boolean).join(',');
    }
    
    return `✅ Added ${type.toUpperCase()}: ${userName} (${formattedId})`;
}

async function removeUser(userId, type, message) {
    if (!userId) {
        return '📝 Usage: $admin users remove <number> [vip/admin]';
    }
    
    const formattedId = userId.includes('@c.us') ? userId : `${userId.replace(/[^0-9]/g, '')}@c.us`;
    
    const usersFile = path.join(process.cwd(), 'config', 'users.json');
    
    if (!fs.existsSync(usersFile)) {
        return '📭 No users data found.';
    }
    
    const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    let removed = false;
    
    if (type === 'vip' || !type) {
        const initialLength = users.vip?.length || 0;
        users.vip = (users.vip || []).filter(u => u.id !== formattedId);
        removed = removed || (initialLength !== users.vip.length);
    }
    
    if (type === 'admin' || !type) {
        const initialLength = users.admin?.length || 0;
        users.admin = (users.admin || []).filter(u => u.id !== formattedId);
        removed = removed || (initialLength !== users.admin.length);
    }
    
    if (!removed) {
        return `ℹ️ User ${formattedId} not found${type ? ` in ${type} list` : ''}.`;
    }
    
    // Save updated list
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    
    // Update environment cache
    if (type === 'vip' || !type) {
        process.env.VIP_USERS = (process.env.VIP_USERS?.split(',') || [])
            .filter(id => id !== formattedId)
            .join(',');
    }
    
    if (type === 'admin' || !type) {
        process.env.ADMIN_USERS = (process.env.ADMIN_USERS?.split(',') || [])
            .filter(id => id !== formattedId)
            .join(',');
    }
    
    return `✅ Removed user: ${formattedId}${type ? ` from ${type}` : ''}`;
}

function getUserInfo(userId) {
    if (!userId) {
        return '📝 Usage: $admin users info <number>';
    }
    
    const formattedId = userId.includes('@c.us') ? userId : `${userId.replace(/[^0-9]/g, '')}@c.us`;
    
    const isVip = isVIP(formattedId);
    const isAdmin = isAdminUser(formattedId);
    
    return `👤 User: ${formattedId}\n⭐ VIP: ${isVip ? '✅' : '❌'}\n👑 Admin: ${isAdmin ? '✅' : '❌'}\n📅 Checked: ${new Date().toLocaleString()}`;
}
