const fs = require('fs');
const path = require('path');
const { formatTime } = require('../../../shared/utils.js');

module.exports = {
    name: 'backup',
    description: 'Create full system backup',
    category: 'admin',
    async execute(args, message, client, botType) {
        if (!message.from.includes('@c.us')) {
            return '❌ Backup can only be done in private chat for security.';
        }

        try {
            const timestamp = Date.now();
            const backupDir = path.join(process.cwd(), 'backups', `savage-x-${timestamp}`);
            
            // Create backup directory
            fs.mkdirSync(backupDir, { recursive: true });
            
            // Backup files to copy
            const backupItems = [
                { src: 'auth/savage-x', dst: 'auth' },
                { src: 'logs', dst: 'logs' },
                { src: 'data', dst: 'data' },
                { src: 'bots/savage-x/config.json', dst: 'config.json' }
            ];
            
            let backedUp = 0;
            
            for (const item of backupItems) {
                const srcPath = path.join(process.cwd(), item.src);
                const dstPath = path.join(backupDir, item.dst);
                
                if (fs.existsSync(srcPath)) {
                    if (fs.lstatSync(srcPath).isDirectory()) {
                        copyFolderSync(srcPath, dstPath);
                    } else {
                        fs.copyFileSync(srcPath, dstPath);
                    }
                    backedUp++;
                }
            }
            
            // Create backup manifest
            const manifest = {
                bot: 'savage-x',
                timestamp: timestamp,
                date: formatTime(),
                files: backedUp,
                size: getFolderSize(backupDir),
                user: message.from
            };
            
            fs.writeFileSync(
                path.join(backupDir, 'manifest.json'),
                JSON.stringify(manifest, null, 2)
            );
            
            // Compress backup
            const archivePath = `${backupDir}.zip`;
            await compressFolder(backupDir, archivePath);
            
            // Cleanup
            fs.rmSync(backupDir, { recursive: true, force: true });
            
            return `✅ Backup created: ${path.basename(archivePath)}\n📦 Size: ${formatBytes(fs.statSync(archivePath).size)}\n⏰ Time: ${formatTime()}`;
            
        } catch (error) {
            console.error('Backup error:', error);
            return `❌ Backup failed: ${error.message}`;
        }
    }
};

// Helper functions
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

function getFolderSize(folderPath) {
    let totalSize = 0;
    
    function scan(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            
            if (entry.isDirectory()) {
                scan(fullPath);
            } else {
                totalSize += fs.statSync(fullPath).size;
            }
        }
    }
    
    scan(folderPath);
    return totalSize;
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function compressFolder(src, dest) {
    const archiver = require('archiver');
    const output = fs.createWriteStream(dest);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    return new Promise((resolve, reject) => {
        output.on('close', () => resolve());
        archive.on('error', (err) => reject(err));
        
        archive.pipe(output);
        archive.directory(src, false);
        archive.finalize();
    });
}
