// Updated Media Handler for Savage Bots FX
// Location: shared/media-handler.js

import pkg from 'youtube-dl-exec';
const { exec } = pkg;
import ffmpeg from 'fluent-ffmpeg';
import axios from 'axios';
import { createReadStream, createWriteStream } from 'fs';
import { unlink, mkdir } from 'fs/promises';
import { join } from 'path';

export class MediaHandler {
    static TEMP_DIR = join(process.cwd(), 'temp_media');
    
    static async init() {
        try {
            await mkdir(this.TEMP_DIR, { recursive: true });
            console.log('📁 Media temp directory ready');
        } catch (error) {
            console.warn('⚠️ Could not create temp directory:', error.message);
        }
    }
    
    static getTempPath(filename) {
        return join(this.TEMP_DIR, `${Date.now()}_${filename}`);
    }
    
    static async downloadYouTube(url, format = 'audio', quality = 'best', botType = 'savage-x') {
        try {
            console.log(`🎥 ${botType} | Downloading YouTube: ${format} | ${quality}`);
            
            const options = {
                dumpSingleJson: true,
                noCheckCertificates: true,
                noWarnings: true,
                preferFreeFormats: true,
                addHeader: ['--referer', 'https://www.youtube.com'],
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            };
            
            // Quality settings
            if (format === 'audio') {
                options.extractAudio = true;
                options.audioFormat = 'mp3';
                options.audioQuality = quality === 'high' ? 0 : 5;
            } else {
                options.format = quality === 'high' ? 'bestvideo+bestaudio' : 'best';
                options.mergeOutputFormat = 'mp4';
            }
            
            // VIP priority for Savage-X
            if (botType === 'savage-x' && quality === 'vip') {
                options.addHeader.push('--limit-rate', '0'); // No rate limit
                options.addHeader.push('--retries', '10');
            }
            
            const result = await exec(url, options);
            return { 
                success: true, 
                data: result,
                bot: botType,
                format: format
            };
        } catch (error) {
            return { 
                success: false, 
                error: error.message,
                bot: botType
            };
        }
    }
    
    static async downloadInstagram(url, botType = 'savage-x') {
        try {
            console.log(`📸 ${botType} | Downloading Instagram`);
            
            // Different access for VIP users
            const headers = {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
            };
            
            // Savage-X VIP gets premium access
            if (botType === 'savage-x') {
                headers['X-IG-App-ID'] = '936619743392459';
                headers['X-IG-WWW-Claim'] = '0';
            }
            
            const postId = url.split('/').pop().split('?')[0];
            const apiUrl = `https://www.instagram.com/p/${postId}/?__a=1`;
            
            const response = await axios.get(apiUrl, { headers });
            const media = response.data.graphql?.shortcode_media;
            
            if (!media) {
                return { success: false, error: 'Media not found' };
            }
            
            const result = {
                success: true,
                type: media.is_video ? 'video' : 'image',
                url: media.is_video ? media.video_url : media.display_url,
                caption: media.edge_media_to_caption?.edges[0]?.node?.text || '',
                username: media.owner?.username || '',
                bot: botType
            };
            
            // VIP gets HD for Savage-X
            if (botType === 'savage-x' && media.is_video && media.video_url_hd) {
                result.url = media.video_url_hd;
                result.quality = 'hd';
            }
            
            return result;
        } catch (error) {
            return { 
                success: false, 
                error: 'Failed to download Instagram media',
                bot: botType
            };
        }
    }
    
    static async downloadTikTok(url, botType = 'savage-x') {
        try {
            console.log(`🎵 ${botType} | Downloading TikTok`);
            
            const headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            };
            
            // Use different API for Savage-X VIP
            let apiUrl;
            if (botType === 'savage-x') {
                apiUrl = `https://www.tiktok.com/oembed?url=${url}&partner=savage-x`;
            } else {
                apiUrl = `https://www.tiktok.com/oembed?url=${url}`;
            }
            
            const response = await axios.get(apiUrl, { headers });
            return { 
                success: true, 
                data: response.data,
                bot: botType
            };
        } catch (error) {
            return { 
                success: false, 
                error: 'Failed to download TikTok',
                bot: botType
            };
        }
    }
    
    static async downloadFacebook(url, botType = 'savage-x') {
        try {
            console.log(`📘 ${botType} | Downloading Facebook`);
            
            // Facebook requires special handling for Savage-X
            const options = {
                dumpSingleJson: true,
                referer: 'https://www.facebook.com/',
                userAgent: 'facebookexternalhit/1.1'
            };
            
            if (botType === 'savage-x') {
                options.addHeader = ['--cookies', 'facebook_cookies.txt'];
            }
            
            const result = await exec(url, options);
            return { 
                success: true, 
                data: result,
                bot: botType
            };
        } catch (error) {
            return { 
                success: false, 
                error: 'Failed to download Facebook video',
                bot: botType
            };
        }
    }
    
    static async downloadSpotify(url, botType = 'savage-x') {
        try {
            console.log(`🎶 ${botType} | Processing Spotify`);
            
            // Spotify requires authentication for Savage-X VIP
            const options = {
                dumpSingleJson: true,
                extractAudio: true,
                audioFormat: 'mp3',
                audioQuality: 0
            };
            
            if (botType === 'savage-x') {
                options.addHeader = [
                    '--username', process.env.SPOTIFY_USER || '',
                    '--password', process.env.SPOTIFY_PASS || ''
                ];
            }
            
            const result = await exec(url, options);
            return { 
                success: true, 
                data: result,
                bot: botType,
                note: botType === 'savage-x' ? 'VIP Quality' : 'Standard Quality'
            };
        } catch (error) {
            return { 
                success: false, 
                error: 'Failed to process Spotify',
                bot: botType
            };
        }
    }
    
    static async convertAudio(inputPath, outputFormat, botType = 'savage-x') {
        return new Promise((resolve, reject) => {
            const outputPath = this.getTempPath(`converted.${outputFormat}`);
            console.log(`🔄 ${botType} | Converting audio: ${outputFormat}`);
            
            const command = ffmpeg(inputPath)
                .toFormat(outputFormat);
            
            // Higher quality for Savage-X VIP
            if (botType === 'savage-x') {
                command.audioBitrate('320k');
            } else {
                command.audioBitrate('192k');
            }
            
            command
                .on('end', () => resolve({ 
                    success: true, 
                    path: outputPath,
                    bot: botType
                }))
                .on('error', (err) => reject({ 
                    success: false, 
                    error: err.message,
                    bot: botType
                }))
                .save(outputPath);
        });
    }
    
    static async compressVideo(inputPath, quality = 'medium', botType = 'savage-x') {
        const qualities = {
            low: '500k',
            medium: '1000k',
            high: '2000k',
            vip: '5000k' // Savage-X VIP quality
        };
        
        const bitrate = qualities[botType === 'savage-x' ? quality : 'medium'];
        
        return new Promise((resolve, reject) => {
            const outputPath = this.getTempPath('compressed.mp4');
            console.log(`📹 ${botType} | Compressing video: ${quality}`);
            
            ffmpeg(inputPath)
                .videoBitrate(bitrate)
                .on('end', () => resolve({ 
                    success: true, 
                    path: outputPath,
                    sizeReduction: 'approx 50%',
                    bot: botType
                }))
                .on('error', (err) => reject({ 
                    success: false, 
                    error: err.message,
                    bot: botType
                }))
                .save(outputPath);
        });
    }
    
    static async extractThumbnail(videoPath, time = '00:00:01', quality = 'high', botType = 'savage-x') {
        return new Promise((resolve, reject) => {
            const outputPath = this.getTempPath('thumbnail.jpg');
            console.log(`🖼️ ${botType} | Extracting thumbnail`);
            
            const command = ffmpeg(videoPath)
                .screenshots({
                    timestamps: [time],
                    filename: 'thumbnail.jpg',
                    folder: this.TEMP_DIR,
                    size: quality === 'high' ? '1280x720' : '640x360'
                });
            
            if (botType === 'savage-x') {
                command.outputOptions('-qscale:v 2'); // Higher quality for Savage-X
            }
            
            command
                .on('end', () => resolve({ 
                    success: true, 
                    path: outputPath,
                    bot: botType
                }))
                .on('error', (err) => reject({ 
                    success: false, 
                    error: err.message,
                    bot: botType
                }));
        });
    }
    
    static async getMediaInfo(filePath, botType = 'savage-x') {
        return new Promise((resolve, reject) => {
            console.log(`📊 ${botType} | Analyzing media`);
            
            ffmpeg.ffprobe(filePath, (err, metadata) => {
                if (err) {
                    reject({ 
                        success: false, 
                        error: err.message,
                        bot: botType
                    });
                } else {
                    // Format response based on bot type
                    const response = {
                        success: true,
                        format: metadata.format.format_name,
                        duration: metadata.format.duration,
                        size: metadata.format.size,
                        bitrate: metadata.format.bit_rate,
                        streams: metadata.streams.length
                    };
                    
                    // Enhanced info for Savage-X
                    if (botType === 'savage-x') {
                        response.detailed = metadata.streams.map(stream => ({
                            type: stream.codec_type,
                            codec: stream.codec_name,
                            resolution: stream.width && stream.height 
                                ? `${stream.width}x${stream.height}` 
                                : 'N/A'
                        }));
                    }
                    
                    resolve(response);
                }
            });
        });
    }
    
    static async createSticker(imagePath, botType = 'savage-x') {
        return new Promise((resolve, reject) => {
            const outputPath = this.getTempPath('sticker.webp');
            console.log(`🖼️ ${botType} | Creating sticker`);
            
            ffmpeg(imagePath)
                .outputOptions([
                    '-vf', 'scale=512:512:force_original_aspect_ratio=decrease',
                    '-c:v', 'libwebp',
                    '-lossless', '0',
                    '-quality', botType === 'savage-x' ? '90' : '75'
                ])
                .on('end', () => resolve({ 
                    success: true, 
                    path: outputPath,
                    format: 'webp',
                    bot: botType
                }))
                .on('error', (err) => reject({ 
                    success: false, 
                    error: err.message,
                    bot: botType
                }))
                .save(outputPath);
        });
    }
    
    static async mergeAudioVideo(audioPath, videoPath, outputPath, botType = 'savage-x') {
        return new Promise((resolve, reject) => {
            console.log(`🎬 ${botType} | Merging audio/video');
            
            ffmpeg()
                .input(videoPath)
                .input(audioPath)
                .outputOptions('-c:v', 'copy')
                .outputOptions('-c:a', botType === 'savage-x' ? 'aac' : 'mp3')
                .outputOptions('-shortest')
                .on('end', () => resolve({ 
                    success: true, 
                    path: outputPath,
                    bot: botType
                }))
                .on('error', (err) => reject({ 
                    success: false, 
                    error: err.message,
                    bot: botType
                }))
                .save(outputPath);
        });
    }
    
    static async cleanTempFiles(filePaths, botType = 'savage-x') {
        try {
            console.log(`🧹 ${botType} | Cleaning ${filePaths.length} temp files`);
            
            for (const path of filePaths) {
                if (path.includes(this.TEMP_DIR)) {
                    await unlink(path).catch(() => {});
                }
            }
            
            // Clean old files (older than 1 hour)
            const now = Date.now();
            const fs = require('fs');
            const files = fs.readdirSync(this.TEMP_DIR);
            
            for (const file of files) {
                const filePath = join(this.TEMP_DIR, file);
                const stats = fs.statSync(filePath);
                if (now - stats.mtimeMs > 3600000) { // 1 hour
                    await unlink(filePath).catch(() => {});
                }
            }
            
            return { success: true, cleaned: filePaths.length, bot: botType };
        } catch (error) {
            return { 
                success: false, 
                error: error.message,
                bot: botType
            };
        }
    }
    
    static validateMediaUrl(url, botType = 'savage-x') {
        const patterns = {
            youtube: /(youtube\.com|youtu\.be)/,
            instagram: /instagram\.com/,
            tiktok: /tiktok\.com/,
            facebook: /facebook\.com|fb\.watch/,
            spotify: /spotify\.com/,
            twitter: /twitter\.com|x\.com/
        };
        
        for (const [platform, pattern] of Object.entries(patterns)) {
            if (pattern.test(url)) {
                console.log(`🔗 ${botType} | Detected: ${platform}`);
                return platform;
            }
        }
        return null;
    }
    
    static getSupportedFormats(botType = 'savage-x') {
        const baseFormats = {
            audio: ['mp3', 'wav', 'ogg', 'm4a'],
            video: ['mp4', 'avi', 'mov'],
            image: ['jpg', 'png', 'gif']
        };
        
        // Savage-X gets additional formats
        if (botType === 'savage-x') {
            baseFormats.audio.push('flac', 'alac');
            baseFormats.video.push('mkv', 'webm', 'flv');
            baseFormats.image.push('webp', 'bmp', 'tiff');
        }
        
        return baseFormats;
    }
    
    static async batchDownload(urls, format = 'video', botType = 'savage-x') {
        console.log(`📦 ${botType} | Batch download: ${urls.length} items`);
        
        const results = [];
        const maxDownloads = botType === 'savage-x' ? 10 : 3; // VIP gets more
        
        for (let i = 0; i < Math.min(urls.length, maxDownloads); i++) {
            try {
                const result = await this.downloadYouTube(urls[i], format, 'medium', botType);
                results.push({
                    url: urls[i],
                    success: result.success,
                    data: result.data
                });
            } catch (error) {
                results.push({
                    url: urls[i],
                    success: false,
                    error: error.message
                });
            }
        }
        
        return {
            success: true,
            total: urls.length,
            processed: results.length,
            results: results,
            bot: botType
        };
    }
}

// Initialize on import
MediaHandler.init().catch(console.error);
