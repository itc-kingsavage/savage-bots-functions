import pkg from 'youtube-dl-exec';
const { exec } = pkg;
import ffmpeg from 'fluent-ffmpeg';
import axios from 'axios';
import { createReadStream, createWriteStream } from 'fs';
import { unlink } from 'fs/promises';

export class MediaHandler {
    static async downloadYouTube(url, format = 'audio') {
        try {
            const options = {
                dumpSingleJson: true,
                noCheckCertificates: true,
                noWarnings: true,
                preferFreeFormats: true,
                addHeader: ['--referer', 'https://www.youtube.com']
            };

            if (format === 'audio') {
                options.extractAudio = true;
                options.audioFormat = 'mp3';
                options.audioQuality = 0;
            }

            const result = await exec(url, options);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    static async downloadInstagram(url) {
        try {
            const response = await axios.get(`https://www.instagram.com/p/${url.split('/').pop()}/?__a=1`);
            const media = response.data.graphql.shortcode_media;
            
            if (media.is_video) {
                return { success: true, type: 'video', url: media.video_url };
            } else {
                return { success: true, type: 'image', url: media.display_url };
            }
        } catch (error) {
            return { success: false, error: 'Failed to download Instagram media' };
        }
    }

    static async downloadTikTok(url) {
        try {
            const response = await axios.get(`https://www.tiktok.com/oembed?url=${url}`);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: 'Failed to download TikTok' };
        }
    }

    static async convertAudio(inputPath, outputFormat) {
        return new Promise((resolve, reject) => {
            const outputPath = inputPath.replace(/\.[^/.]+$/, '') + '.' + outputFormat;
            
            ffmpeg(inputPath)
                .toFormat(outputFormat)
                .on('end', () => resolve({ success: true, path: outputPath }))
                .on('error', (err) => reject({ success: false, error: err.message }))
                .save(outputPath);
        });
    }

    static async compressVideo(inputPath, quality = 'medium') {
        const qualities = {
            low: '500k',
            medium: '1000k',
            high: '2000k'
        };

        return new Promise((resolve, reject) => {
            const outputPath = inputPath.replace(/\.[^/.]+$/, '') + '_compressed.mp4';
            
            ffmpeg(inputPath)
                .videoBitrate(qualities[quality] || '1000k')
                .on('end', () => resolve({ success: true, path: outputPath }))
                .on('error', (err) => reject({ success: false, error: err.message }))
                .save(outputPath);
        });
    }

    static async extractThumbnail(videoPath, time = '00:00:01') {
        return new Promise((resolve, reject) => {
            const outputPath = videoPath.replace(/\.[^/.]+$/, '') + '_thumb.jpg';
            
            ffmpeg(videoPath)
                .screenshots({
                    timestamps: [time],
                    filename: outputPath,
                    folder: './'
                })
                .on('end', () => resolve({ success: true, path: outputPath }))
                .on('error', (err) => reject({ success: false, error: err.message }));
        });
    }

    static async getMediaInfo(filePath) {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(filePath, (err, metadata) => {
                if (err) {
                    reject({ success: false, error: err.message });
                } else {
                    resolve({ success: true, metadata });
                }
            });
        });
    }

    static async mergeAudioVideo(audioPath, videoPath, outputPath) {
        return new Promise((resolve, reject) => {
            ffmpeg()
                .input(videoPath)
                .input(audioPath)
                .outputOptions('-c:v copy')
                .outputOptions('-c:a aac')
                .on('end', () => resolve({ success: true, path: outputPath }))
                .on('error', (err) => reject({ success: false, error: err.message }))
                .save(outputPath);
        });
    }

    static async cleanTempFiles(filePaths) {
        try {
            for (const path of filePaths) {
                await unlink(path);
            }
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    static validateMediaUrl(url) {
        const patterns = {
            youtube: /(youtube\.com|youtu\.be)/,
            instagram: /instagram\.com/,
            tiktok: /tiktok\.com/,
            facebook: /facebook\.com|fb\.watch/,
            spotify: /spotify\.com/
        };

        for (const [platform, pattern] of Object.entries(patterns)) {
            if (pattern.test(url)) return platform;
        }
        return null;
    }

    static getSupportedFormats() {
        return {
            audio: ['mp3', 'wav', 'ogg', 'm4a'],
            video: ['mp4', 'avi', 'mov', 'mkv'],
            image: ['jpg', 'png', 'gif', 'webp']
        };
    }
}
