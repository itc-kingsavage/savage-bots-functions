const fs = require('fs');
const path = require('path');
const { validateArgs } = require('../../../shared/utils.js');

module.exports = {
    name: 'restore',
    description: 'Restore system from backup',
    category: 'admin',
    async execute(args, message, client, botType) {
        if (!message.from.includes('@c.us')) {
            return '❌ Restore can only be done in private chat.';
        }
        
        if (!validateArgs(args)) {
            return '📝 Usage: $admin restore <backup_filename>\n📁 Available backups:\n' + getBackupList();
        }
        
        const backupName = args.trim();
        const backupPath = path.join(process.cwd(), 'backups', backupName);
        
        if (!fs.existsSync(backupPath)) {
            return `❌ Backup "${backupName}" not found.\n${getBackupList()}`;
        }
        
        try {
            // Extract backup
            await extractBackup(backupPath);
            
            // Verify manifest
            const manifestPath = path.join(process.cwd(), 'temp_restore', 'manifest.json');
            if (!fs.existsSync(manifestPath)) {
                return '❌ Invalid backup: manifest missing';
            }
            
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            
            // Restore files
            await restoreFiles();
            
            // Cleanup
            fs.rmSync(path.join(process.cwd(), 'temp_restore'), { recursive: true, force: true });
            
            return `✅ Restore successful from ${manifest.date}\n🔄 Please restart the bot for changes to take effect.`;
            
        } catch (error) {
            console.error('Restore error:', error);
            return `❌ Restore failed: ${error.message}`;
        }
    }
};

function getBackupList() {
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) return 'No backups found.';
    
    const backups = fs.readdirSync(backupDir)
        .filter(file => file.endsWith('.zip'))
        .map(file => `• ${file}`)
        .join('\n');
    
    return backups || 'No backups found.';
}

async function extractBackup(zipPath) {
    const extract = require('extract-zip');
    const extractPath = path.join(process.cwd(), 'temp_restore');
    
    if (fs.existsSync(extractPath)) {
        fs.rmSync(extractPath, { recursive: true, force: true });
    }
    
    fs.mkdirSync(extractPath, { recursive: true });
    
    await extract(zipPath, { dir: extractPath });
}

async function restoreFiles() {
    const tempPath = path.join(process.cwd(), 'temp_restore');
    
    // Restore auth
    const authSrc = path.join(tempPath, 'auth');
    const authDst = path.join(process.cwd(), 'auth', 'savage-x');
    
    if (fs.existsSync(authSrc)) {
        if (fs.existsSync(authDst)) {
            fs.rmSync(authDst, { recursive: true, force: true });
        }
        copyFolderSync(authSrc, authDst);
    }
    
    // Restore other items...
}

function copyFolderSync(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            copyFolderSync(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}
