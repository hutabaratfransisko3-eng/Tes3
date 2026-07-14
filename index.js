const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType, StringSelectMenuBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const fs = require('fs');
const https = require('https');
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');
// Import semua fungsi download
const axios = require('axios');
const cheerio = require('cheerio');
const FormData = require('form-data');

// Import semua fungsi dari file terpisah
const { ytmp3dl } = require('./ytmp3dl.js');
const { ttmp3dl } = require('./ttmp3dl.js');
const { soundclouddl } = require('./soundclouddl.js');
const { spotifydl } = require('./spotifydl.js');
const { listServer } = require('./listServer.js');
const { uploadTop4Top } = require('./top4top.js');
const { mediafireDl } = require('./mediafire_download.js');

// Backup functions jika import gagal
async function ytmp3dl_backup(url) {
  // Fungsi backup akan digunakan jika import gagal
  if (!/^(https?:\/\/)?((www|m)\.)?(youtube\.com\/watch\?.*?[&?]v=|youtu\.be\/)[\w-]{11}(\S*)?$/i.test(url)) {
    throw new Error('Invalid YouTube URL');
  }

  const form = new FormData();
  form.append('url', url);

  const { data } = await axios.post(
    'https://www.youtubemp3.ltd/convert',
    form,
    {
      headers: {
        ...form.getHeaders(),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0',
        Accept: 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        Origin: 'https://www.youtubemp3.ltd',
        Referer: 'https://www.youtubemp3.ltd/',
        Connection: 'keep-alive'
      },
    }
  );

  if (!data?.link) throw new Error('Download link not found');

  return {
    title: (data.filename ?? 'Unknown').replace(/\.mp3$/i, ''),
    link: data.link
  };
}
const pages = {};

const db = new QuickDB();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages
    ]
});

const TOKEN = process.env.DISCORD_BOT_TOKEN || 'MTQwODIxMjE5MTU3MTg2OTcyNg.GluThA.2CqgXpMbrB8C-Yn6Qg6db1wb1rMAoG62Hxs3wc';
const PREFIX = '*';

// Anti-spam system
const userCooldowns = new Map();
const COOLDOWN_TIME = 5000; // 5 seconds

// Invisible market system data
const invisibleMessages = new Map();
let invisibleCounter = 1000;

// Enhanced keylogger detection patterns - DARI FILE KEYLOGGER
const KEYLOGGER_PATTERNS = [
    // HTTP Request patterns
    /(?:(?:require\s*\(\s*(?:['"]requests['"])\s*\)|requests)\s*\.\s*post\b)/gi,
    /\b(?:Content-Type|application\/json)\b/gi,

    // Telegram Bot API patterns
    /https?:\/\/api\.telegram\.org\/(?:bot|Bot)\d{9,11}:[A-Za-z0-9_-]{35,46}\/(?:send(?:Message|Document|Photo|Audio)|get(?:Updates|Me))(\?[\w-]+(=[\w-]*)?(&[\w-]+(=[\w-]*)?)*)?/gi,

    // Discord Webhook patterns (enhanced)
    /https?:\/\/(?:(?:canary|ptb)\.)?discord(?:app)?\.com\/api(?:\/v\d+)?\/webhooks\/\d{17,20}\/[A-Za-z0-9_-]{60,70}(\/[\w-]+)?/gi,

    // Suspicious function names
    /\b(?:send(?:Discord|DiscordData|DiscordWebhook|DiscordWebhooks|Telegram|TelegramMessage|telegramdata|Webhook|Webhooks|Embed(?:ded)?To|MessageTo|To)|post(?:Discord|DiscordWebhook|DiscordWebhooks|Telegram|telegramdata|Data))[A-Za-z0-9_]*\b/gi,

    // Additional keylogger patterns
    /\b(?:getHWID|getComputerName|getUserName|getSystemInfo|getProcessList)\b/gi,
    /\b(?:steal|grab|token|keylog|logger|dump|exfil)\b/gi,
    /\b(?:screenshot|capture|record|monitor)\b/gi,

    // Lua-specific malicious patterns
    /\b(?:os\.execute|io\.popen|loadfile|dofile)\s*\(/gi,
    /\b(?:sampRegisterChatCommand|sampAddChatMessage)\s*\([^)]*(?:\/logout|\/quit|\/exit)/gi,

    // Network/HTTP related suspicious patterns
    /\b(?:http\.request|https\.request|socket\.http|socket\.connect)\b/gi,
    /['"](?:POST|GET|PUT|DELETE)['"]\s*,/gi,

    // File system access patterns
    /\b(?:file\.write|file\.read|file\.append|io\.write|io\.read)\b/gi,

    // Registry/system access
    /\b(?:registry|regedit|HKEY_|SOFTWARE\\\\|SYSTEM\\\\)\b/gi,

    // Cryptocurrency/wallet related
    /\b(?:wallet\.dat|private\.key|seed\.txt|metamask|exodus|atomic)\b/gi,

    // Browser data stealing
    /\b(?:chrome|firefox|edge|brave|opera).*(?:cookies|passwords|history|bookmarks)\b/gi,

    // Process injection/manipulation
    /\b(?:CreateRemoteThread|WriteProcessMemory|VirtualAllocEx|SetWindowsHookEx)\b/gi
];

// Fungsi deobfuscation Lua - DARI FILE MAIN.PY
function decodeLuaObfuscated(encodedStr) {
    if (!encodedStr.startsWith("LOL!")) {
        return null;
    }

    const hexData = Buffer.from(encodedStr.substring(4), 'ascii');
    const output = [];
    let repeat = 0;
    let pos = 0;

    while (pos < hexData.length) {
        if (pos + 1 < hexData.length && hexData[pos + 1] === 81) {
            const char = String.fromCharCode(hexData[pos]);
            repeat = char.match(/\d/) ? parseInt(char, 16) : 0;
            pos += 2;
            continue;
        }

        if (pos + 1 < hexData.length) {
            try {
                const byteVal = ((hexData[pos] - 48 - 7 * (hexData[pos] > 64)) * 16) +
                               (hexData[pos + 1] - 48 - 7 * (hexData[pos + 1] > 64));

                if (repeat > 0) {
                    for (let i = 0; i < repeat; i++) {
                        output.push(byteVal);
                    }
                    repeat = 0;
                } else {
                    output.push(byteVal);
                }
            } catch (error) {
                // Skip invalid bytes
            }
            pos += 2;
        } else {
            pos += 1;
        }
    }

    return Buffer.from(output).toString('utf-8');
}

// Fungsi untuk analisis mendalam konten file
function deepAnalyzeContent(content) {
    const suspiciousIndicators = [];

    // Check untuk base64 encoded content
    const base64Pattern = /[A-Za-z0-9+/]{40,}={0,2}/g;
    const base64Matches = content.match(base64Pattern);
    if (base64Matches && base64Matches.length > 5) {
        suspiciousIndicators.push("Multiple base64 encoded strings detected");
    }

    // Check untuk hex encoded content
    const hexPattern = /[0-9a-fA-F]{40,}/g;
    const hexMatches = content.match(hexPattern);
    if (hexMatches && hexMatches.length > 3) {
        suspiciousIndicators.push("Multiple hex encoded strings detected");
    }

    // Check untuk suspicious string concatenation
    const concatPattern = /["'][^"']*["']\s*\.\.\s*["'][^"']*["']/g;
    const concatMatches = content.match(concatPattern);
    if (concatMatches && concatMatches.length > 10) {
        suspiciousIndicators.push("Excessive string concatenation (obfuscation)");
    }

    // Check untuk dynamic function calls
    const dynamicCallPattern = /\w+\s*\[\s*["'][^"']*["']\s*\]\s*\(/g;
    const dynamicCalls = content.match(dynamicCallPattern);
    if (dynamicCalls && dynamicCalls.length > 5) {
        suspiciousIndicators.push("Dynamic function calls detected");
    }

    return suspiciousIndicators;
}

// Fixed fetch function using built-in https/http modules
function fetch(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const isHttps = urlObj.protocol === 'https:';
        const lib = isHttps ? https : http;

        const requestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port || (isHttps ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: options.headers || {}
        };

        const req = lib.request(requestOptions, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    ok: res.statusCode >= 200 && res.statusCode < 300,
                    status: res.statusCode,
                    statusText: res.statusMessage,
                    text: () => Promise.resolve(data),
                    json: () => Promise.resolve(JSON.parse(data)),
                    buffer: () => Promise.resolve(Buffer.from(data, 'binary'))
                });
            });
        });

        req.on('error', reject);

        if (options.body) {
            if (options.body instanceof FormData) {
                options.body.pipe(req);
            } else {
                req.write(options.body);
            }
        } else {
            req.end();
        }
    });
}

// Top4Top function is now imported from top4top.js

// Function to detect keylogger content
function detectKeylogger(content) {
    const suspiciousPatterns = KEYLOGGER_PATTERNS.filter(pattern => pattern.test(content));
    return suspiciousPatterns.length > 0;
}

// Delay function
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Owner system functions
async function isOwner(userId, guildId) {
    const owners = await db.get(`owners.${guildId}`) || [];
    return owners.includes(userId);
}

async function isStaff(member) {
    const guildId = member.guild.id;
    const isOwnerUser = await isOwner(member.id, guildId);
    const hasAdminPerms = member.permissions.has(PermissionFlagsBits.Administrator);
    return isOwnerUser || hasAdminPerms;
}

// Color validation function for Discord embeds
function validateColor(color) {
    // Discord only supports #RRGGBB format (6 digits)
    const hexPattern = /^#([0-9A-F]{6})$/i;
    return hexPattern.test(color);
}

// Convert hex to Discord-compatible integer format
function hexToDiscordColor(hex) {
    if (!hex.startsWith('#')) return null;

    // Discord only accepts 6-digit hex colors, convert to integer
    if (hex.length === 7) {
        return parseInt(hex.substring(1), 16); // Convert hex to integer
    } else if (hex.length === 9) {
        // Strip alpha channel for Discord compatibility
        return parseInt(hex.substring(1, 7), 16);
    }

    return null;
}

// Auto-delete message function - 5 SECONDS FOR ALL BOT REPLIES
async function sendAutoDeleteMessage(channel, content, deleteAfter = 5000) {
    try {
        const message = await channel.send(content);
        setTimeout(() => {
            message.delete().catch(() => {});
        }, deleteAfter);
        return message;
    } catch (error) {
        console.error('Error sending auto-delete message:', error);
    }
}

// Database helper functions
async function createEmergencyBackup() {
    try {
        const currentConfigs = {
            embed_colors: await db.get('embed_colors') || {},
            keylogger_channels: await db.get('keylogger_channels') || [],
            top4top_channels: await db.get('top4top_channels') || [],
            invisible_configs: await db.get('invisible_configs') || [],
            market_categories: await db.get('market_categories') || {},
            auto_thread_channels: await db.get('auto_thread_channels') || [],
            daily_configs: await db.get('daily_configs') || [],
            verify_configs: await db.get('verify_configs') || {},
            midman_configs: await db.get('midman_configs') || {}
        };

        const emergencyBackup = {
            timestamp: new Date().toISOString(),
            configs: currentConfigs,
            type: 'emergency'
        };

        await db.set('emergency_backup', emergencyBackup);
        console.log('✅ Emergency backup created successfully');
    } catch (error) {
        console.error('❌ Failed to create emergency backup:', error);
    }
}

async function checkExistingConfigs() {
    try {
        let configCount = 0;
        const configKeys = [
            'embed_colors', 'keylogger_channels', 'top4top_channels',
            'invisible_configs', 'market_categories', 'auto_thread_channels',
            'daily_configs'
        ];

        for (const key of configKeys) {
            const config = await db.get(key);
            if (config && (Array.isArray(config) ? config.length > 0 : Object.keys(config).length > 0)) {
                configCount++;
            }
        }

        return configCount;
    } catch (error) {
        console.error('Error checking existing configs:', error);
        return 0;
    }
}

async function initializeDefaultConfigs() {
    try {
        // Set default embed colors
        const defaultColors = {
            verify: '#007FFF',
            midman: '#007FFF',
            ticket: '#007FFF',
            daily: '#007FFF',
            giveaway: '#007FFF',
            keylogger: '#ff0000',
            top4top: '#00ff00',
            custom: '#0099ff'
        };

        await db.set('embed_colors', defaultColors);
        await db.set('keylogger_channels', []);
        await db.set('top4top_channels', []);
        await db.set('invisible_configs', []);
        await db.set('market_categories', {});
        await db.set('auto_thread_channels', []);
        await db.set('daily_configs', []);

        console.log('✅ Default configurations initialized');
    } catch (error) {
        console.error('❌ Failed to initialize default configs:', error);
    }
}

async function restoreFromEmergencyBackup(emergencyBackup) {
    try {
        if (emergencyBackup.configs) {
            for (const [key, value] of Object.entries(emergencyBackup.configs)) {
                if (value && (Array.isArray(value) ? value.length > 0 : Object.keys(value).length > 0)) {
                    await db.set(key, value);
                }
            }
        }
        console.log('✅ Restored from emergency backup');
    } catch (error) {
        console.error('❌ Failed to restore from emergency backup:', error);
    }
}

function setupDailyAutoBackup() {
    // Create auto-backup every 24 hours
    setInterval(async () => {
        try {
            const dateString = new Date().toISOString().split('T')[0];
            const autoBackupName = `auto-backup-${dateString}`;

            const currentConfigs = {
                timestamp: new Date().toISOString(),
                guildId: 'auto-backup',
                serverName: 'Auto Backup',
                configs: {
                    embed_colors: await db.get('embed_colors') || {},
                    keylogger_channels: await db.get('keylogger_channels') || [],
                    top4top_channels: await db.get('top4top_channels') || [],
                    invisible_configs: await db.get('invisible_configs') || [],
                    market_categories: await db.get('market_categories') || {},
                    auto_thread_channels: await db.get('auto_thread_channels') || [],
                    daily_configs: await db.get('daily_configs') || []
                }
            };

            await db.set(`database_backup.${autoBackupName}`, currentConfigs);
            console.log(`📅 Daily auto-backup created: ${autoBackupName}`);
        } catch (error) {
            console.error('❌ Daily auto-backup failed:', error);
        }
    }, 24 * 60 * 60 * 1000); // 24 hours
}

client.once('ready', async () => {
    console.log(`🚀 Bot ${client.user.tag} is online!`);

    // Enhanced auto-load database with multiple attempts
    try {
        console.log('🔄 Checking for persistent configurations...');

        // Check for auto-load configuration
        const autoLoadConfig = await db.get('auto_load_database');
        if (autoLoadConfig && autoLoadConfig.enabled && autoLoadConfig.databaseName) {
            console.log(`📂 Auto-loading database: ${autoLoadConfig.databaseName}`);

            const configData = await db.get(`database_backup.${autoLoadConfig.databaseName}`);
            if (configData && configData.configs) {
                let loadedCount = 0;

                // Auto-restore all configurations with error handling
                const configTypes = [
                    'embed_colors', 'keylogger_channels', 'top4top_channels',
                    'invisible_configs', 'market_categories', 'auto_thread_channels',
                    'daily_configs', 'verify_configs', 'midman_configs'
                ];

                for (const configType of configTypes) {
                    if (configData.configs[configType]) {
                        try {
                            await db.set(configType, configData.configs[configType]);
                            loadedCount++;
                        } catch (error) {
                            console.error(`Failed to load ${configType}:`, error);
                        }
                    }
                }

                // Load guild-specific configurations
                if (configData.guildId) {
                    const guildSpecificConfigs = [
                        `owners.${configData.guildId}`,
                        `ticket_config.${configData.guildId}`,
                        `midman_config.${configData.guildId}`,
                        `verify_config.${configData.guildId}`,
                        `testimoni_channel.${configData.guildId}`,
                        `testimoni_data.${configData.guildId}`
                    ];

                    for (const configKey of guildSpecificConfigs) {
                        const configName = configKey.split('.')[0];
                        if (configData.configs[configName]) {
                            try {
                                await db.set(configKey, configData.configs[configName]);
                                loadedCount++;
                            } catch (error) {
                                console.error(`Failed to load ${configKey}:`, error);
                            }
                        }
                    }
                }

                console.log(`✅ Database auto-loaded successfully: ${autoLoadConfig.databaseName} (${loadedCount} configs restored)`);
            } else {
                console.log(`❌ Auto-load database not found or empty: ${autoLoadConfig.databaseName}`);

                // Create emergency backup if none exists
                console.log('🔄 Creating emergency backup of current state...');
                await createEmergencyBackup();
            }
        } else {
            console.log('📝 No auto-load configuration found, checking for existing configs...');

            // Check if any configuration exists, if not create default
            const existingConfigs = await checkExistingConfigs();
            if (existingConfigs === 0) {
                console.log('🔧 Initializing default configurations...');
                await initializeDefaultConfigs();
            } else {
                console.log(`📊 Found ${existingConfigs} existing configurations`);
            }
        }

        // Create daily auto-backup
        console.log('🔄 Setting up daily auto-backup...');
        setupDailyAutoBackup();

    } catch (error) {
        console.error('❌ Critical error during database initialization:', error);

        // Fallback: try to restore from emergency backup
        try {
            console.log('🚨 Attempting emergency recovery...');
            const emergencyBackup = await db.get('emergency_backup');
            if (emergencyBackup) {
                await restoreFromEmergencyBackup(emergencyBackup);
                console.log('✅ Emergency recovery successful');
            }
        } catch (emergencyError) {
            console.error('❌ Emergency recovery failed:', emergencyError);
        }
    }

    // Daily message scheduler - Fixed interval and no auto-delete
    setInterval(async () => {
        try {
            const dailyConfigs = await db.get('daily_configs') || [];
            if (dailyConfigs.length === 0) return;

            const now = new Date();
            const wibTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));

            const currentDateKey = `${wibTime.getFullYear()}-${(wibTime.getMonth() + 1).toString().padStart(2, '0')}-${wibTime.getDate().toString().padStart(2, '0')}`;
            const currentHour = wibTime.getHours();
            const currentMinute = wibTime.getMinutes();

            for (let i = 0; i < dailyConfigs.length; i++) {
                const config = dailyConfigs[i];
                const timeParts = config.time.split(':');
                const targetHour = parseInt(timeParts[0]);
                const targetMinute = parseInt(timeParts[1]) || 0;

                const timeMatches = currentHour === targetHour && currentMinute === targetMinute;
                const notSentToday = (config.lastSentDate || '') !== currentDateKey;

                if (timeMatches && notSentToday) {
                    const channel = client.channels.cache.get(config.channelId);
                    if (channel) {
                        try {
                            const colorHex = await db.get(`embed_colors.daily`) || '#0099ff';
                            const color = hexToDiscordColor(colorHex) || 0x0099ff;
                            const embed = new EmbedBuilder()
                                .setTitle(config.title)
                                .setDescription(config.text)
                                .setColor(color)
                                .setFooter({ text: `Sent at ${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')} WIB` })
                                .setTimestamp();

                            if (config.imageUrl && config.imageUrl.startsWith('http')) {
                                embed.setImage(config.imageUrl);
                            }

                            // Send daily message WITHOUT auto-delete
                            await channel.send({
                                content: '@everyone @here',
                                embeds: [embed]
                            });

                            // Update config with successful send
                            dailyConfigs[i].lastSentDate = currentDateKey;
                            dailyConfigs[i].lastSentTime = wibTime.toISOString();
                            dailyConfigs[i].sentCount = (dailyConfigs[i].sentCount || 0) + 1;

                            console.log(`Daily message sent successfully: ${config.title} to #${channel.name} at ${currentHour}:${currentMinute}`);

                        } catch (error) {
                            console.error('Error sending daily message:', error);
                        }
                    }
                }
            }

            await db.set('daily_configs', dailyConfigs);

        } catch (error) {
            console.error('Daily scheduler error:', error);
        }
    }, 30000); // Changed to 30 seconds for more precise timing
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    // AUTO-DETECTION: Semua media URL di channel top4top - Sistem Smart Download
    const top4topChannelsConfig = await db.get('top4top_channels') || [];

    // Auto-detection aktif HANYA di channel top4top yang dikonfigurasi
    const isTop4TopChannel = top4topChannelsConfig.includes(message.channel.id);

    if (!message.content.startsWith(PREFIX) && isTop4TopChannel && (
        message.content.includes('youtube.com/watch') ||
        message.content.includes('youtu.be/') ||
        message.content.includes('spotify.com/track') ||
        message.content.includes('tiktok.com') ||
        message.content.includes('soundcloud.com') ||
        message.content.includes('snd.sc')
    )) {
        // Regex untuk mendeteksi URLs
        const youtubeRegex = /(https?:\/\/)?(www\.|m\.)?(youtube\.com\/watch\?.*?[&?]v=|youtu\.be\/)[\w-]{11}(\S*)?/gi;
        const spotifyRegex = /https?:\/\/(open\.)?spotify\.com\/track\/[A-Za-z0-9]{22}(\?.*)?/gi;
        const tiktokRegex = /(https?:\/\/)?(www\.)?(vm|vt)?\.?tiktok\.com\/[^\s]+/gi;
        const soundcloudRegex = /(https?:\/\/)?(www\.)?(soundcloud\.com|snd\.sc)\/[\w\-./?%&=+#]+/gi;

        const youtubeUrls = [...message.content.matchAll(youtubeRegex)].map(match => match[0]);
        const spotifyUrls = [...message.content.matchAll(spotifyRegex)].map(match => match[0]);
        const tiktokUrls = [...message.content.matchAll(tiktokRegex)].map(match => match[0]);
        const soundcloudUrls = [...message.content.matchAll(soundcloudRegex)].map(match => match[0]);

        // Rate limiting: maksimal 3 URL per pesan
        const totalUrls = youtubeUrls.length + spotifyUrls.length + tiktokUrls.length + soundcloudUrls.length;
        if (totalUrls > 3) {
            await sendAutoDeleteMessage(message.channel, '⚠️ **Terlalu banyak URL!** Maksimal 3 URL per pesan untuk mencegah spam.');
            return;
        }

        // Process YouTube URLs dengan smart fallback
        for (const url of youtubeUrls) {
            try {
                const processingMsg = await message.channel.send('🎵 **Mendownload dari YouTube...**');

                // Gunakan fungsi import atau fallback
                let result;
                try {
                    result = await ytmp3dl(url);
                } catch (importError) {
                    console.log('Using backup function for YouTube');
                    result = await ytmp3dl_backup(url);
                }

                const audioResponse = await axios.get(result.link, { responseType: 'arraybuffer' });
                const audioBuffer = Buffer.from(audioResponse.data);

                // Generate safe filename
                const safeTitle = result.title.replace(/[^a-zA-Z0-9\s\-_.]/g, '').substring(0, 50);
                const filename = `${safeTitle || 'youtube_audio'}.mp3`;

                // Upload to Top4Top dengan auto HTTP replacement
                let uploadUrl = await uploadTop4Top(audioBuffer, filename);
                uploadUrl = uploadUrl.replace(/^https:/, 'http:'); // Auto replace HTTPS to HTTP

                await processingMsg.delete().catch(() => {});

                const embed = new EmbedBuilder()
                    .setTitle(`🎵 ${result.title}`)
                    .setDescription(`**🔗 Download:** [Click Here](${uploadUrl})`)
                    .setColor('#FF0000')
                    .setFooter({ text: 'YouTube MP3 Downloader • Powered by Armaaa28' })
                    .setTimestamp();

                await message.channel.send({ embeds: [embed] });

            } catch (error) {
                console.error('YouTube download error:', error);
                await sendAutoDeleteMessage(message.channel, `❌ **YouTube Download Gagal:** ${error.message}`);
            }
        }

        // Process Spotify URLs dengan smart fallback
        for (const url of spotifyUrls) {
            try {
                const processingMsg = await message.channel.send('🎶 **Mendownload dari Spotify...**');

                // Gunakan fungsi import atau fallback
                let result;
                try {
                    result = await spotifydl(url);
                } catch (importError) {
                    console.log('Using backup function for Spotify');
                    // Fallback menggunakan backup function yang sudah ada
                    if (!/^https?:\/\/(open\.)?spotify\.com\/track\/[A-Za-z0-9]{22}(?:\?.*)?$/i.test(url)) {
                        throw new Error('Invalid Spotify URL');
                    }
                    // Implementasi backup logic jika diperlukan
                    throw importError;
                }

                const audioResponse = await axios.get(result.link, { responseType: 'arraybuffer' });
                const audioBuffer = Buffer.from(audioResponse.data);

                // Generate safe filename
                const safeTitle = `${result.artist} - ${result.title}`.replace(/[^a-zA-Z0-9\s\-_.]/g, '').substring(0, 50);
                const filename = `${safeTitle || 'spotify_audio'}.mp3`;

                // Upload to Top4Top dengan auto HTTP replacement
                let uploadUrl = await uploadTop4Top(audioBuffer, filename);
                uploadUrl = uploadUrl.replace(/^https:/, 'http:'); // Auto replace HTTPS to HTTP

                await processingMsg.delete().catch(() => {});

                const embed = new EmbedBuilder()
                    .setTitle(`🎶 ${result.artist} - ${result.title}`)
                    .setDescription(`**🔗 Download:** [Click Here](${uploadUrl})`)
                    .setColor('#1DB954')
                    .setFooter({ text: 'Spotify MP3 Downloader • Powered by Armaaa28' })
                    .setTimestamp();

                await message.channel.send({ embeds: [embed] });

            } catch (error) {
                console.error('Spotify download error:', error);
                await sendAutoDeleteMessage(message.channel, `❌ **Spotify Download Gagal:** ${error.message}`);
            }
        }

        // Process TikTok URLs dengan smart fallback
        for (const url of tiktokUrls) {
            try {
                const processingMsg = await message.channel.send('🎵 **Mendownload dari TikTok...**');

                // Gunakan fungsi import
                const result = await ttmp3dl(url);
                if (!result.link) {
                    throw new Error('Audio tidak tersedia atau video tidak memiliki audio');
                }

                const audioResponse = await axios.get(result.link, { responseType: 'arraybuffer' });
                const audioBuffer = Buffer.from(audioResponse.data);

                const safeTitle = result.title.replace(/[^a-zA-Z0-9\s\-_.]/g, '').substring(0, 50);
                const filename = `${safeTitle || 'tiktok_audio'}.mp3`;

                // Upload dengan auto HTTP replacement
                let uploadUrl = await uploadTop4Top(audioBuffer, filename);
                uploadUrl = uploadUrl.replace(/^https:/, 'http:'); // Auto replace HTTPS to HTTP

                await processingMsg.delete().catch(() => {});

                const embed = new EmbedBuilder()
                    .setTitle(`🎵 ${result.title}`)
                    .setDescription(`**🔗 Download:** [Click Here](${uploadUrl})`)
                    .setColor('#000000')
                    .setFooter({ text: 'TikTok MP3 Downloader • Powered by Armaaa28' })
                    .setTimestamp();

                await message.channel.send({ embeds: [embed] });

            } catch (error) {
                console.error('TikTok download error:', error);
                await sendAutoDeleteMessage(message.channel, `❌ **TikTok Download Gagal:** ${error.message}`);
            }
        }

        // Process SoundCloud URLs dengan smart fallback
        for (const url of soundcloudUrls) {
            try {
                const processingMsg = await message.channel.send('🔊 **Mendownload dari SoundCloud...**');

                // Gunakan fungsi import
                const result = await soundclouddl(url);
                const audioResponse = await axios.get(result.link, { responseType: 'arraybuffer' });
                const audioBuffer = Buffer.from(audioResponse.data);

                const safeTitle = result.title.replace(/[^a-zA-Z0-9\s\-_.]/g, '').substring(0, 50);
                const filename = `${safeTitle || 'soundcloud_audio'}.mp3`;

                // Upload dengan auto HTTP replacement
                let uploadUrl = await uploadTop4Top(audioBuffer, filename);
                uploadUrl = uploadUrl.replace(/^https:/, 'http:'); // Auto replace HTTPS to HTTP

                await processingMsg.delete().catch(() => {});

                const embed = new EmbedBuilder()
                    .setTitle(`🔊 ${result.title}`)
                    .setDescription(`**🔗 Download:** [Click Here](${uploadUrl})`)
                    .setColor('#FF5500')
                    .setFooter({ text: 'SoundCloud MP3 Downloader • Powered by Armaaa28' })
                    .setTimestamp();

                await message.channel.send({ embeds: [embed] });

            } catch (error) {
                console.error('SoundCloud download error:', error);
                await sendAutoDeleteMessage(message.channel, `❌ **SoundCloud Download Gagal:** ${error.message}`);
            }
        }

        // Return setelah auto-detection untuk menghindari command processing
        if (totalUrls > 0) return;
    }

    // KEYLOGGER CHECKER - CHANNEL TERPISAH
    const keyloggerChannels = await db.get('keylogger_channels') || [];

    if (keyloggerChannels.includes(message.channel.id) && message.attachments.size > 0) {
        const attachment = message.attachments.first();

        // Check ekstensi file untuk keylogger checker
        if (!/\.(lua|luac|lua\.txt|luac\.txt)$/i.test(attachment.name)) {
            // Delete user message
            await message.delete().catch(() => {});
            await sendAutoDeleteMessage(message.channel, '🚫 **Hanya file dengan ekstensi** `.lua`, `.luac`, `.lua.txt`, **atau** `.luac.txt` **yang diizinkan untuk keylogger checking.**');
            return;
        }

        const tempFile = path.join('./temp', attachment.name.replace(/[^a-z0-9.]/gi, '_'));
        let processingMessage = null;

        try {
            // Buat direktori temp jika belum ada
            if (!fs.existsSync('./temp')) {
                fs.mkdirSync('./temp', { recursive: true });
            }

            processingMessage = await message.channel.send('🔄 **Menganalisis file keylogger...**');

            // Download file BEFORE deleting user message
            const response = await fetch(attachment.url);
            if (!response.ok) throw new Error(`Download failed: ${response.status}`);

            const buffer = await response.buffer();
            fs.writeFileSync(tempFile, buffer);

            // NOW delete user message to hide the file from everyone
            await message.delete().catch(() => {});

            let fileContent = buffer.toString('utf-8');
            let isObfuscated = false;
            let decodingAttempted = false;

            // Check apakah file perlu di-deobfuscate
            if (!/script_author|function\s+main\(\)|isSampLoaded|isSampAvailable|sampRegisterChatCommand/i.test(fileContent)) {
                isObfuscated = true;
                decodingAttempted = true;

                // Cari pattern obfuscated string
                const obfuscatedPatterns = [
                    /end\s*return\s*(?:v\d+|VMCall)\s*\(\s*"([^"]+)"/i,
                    /v\d+\s*\(\s*"([^"]+)"\s*,\s*v\d+\(\)\s*,\s*\.\.\.\s*\)/i,
                    /\)\s*\)\s*end\s*end\s*return\s*[^"]*"([^"]+)"/i
                ];

                let decoded = null;
                for (const pattern of obfuscatedPatterns) {
                    const match = fileContent.match(pattern);
                    if (match) {
                        decoded = decodeLuaObfuscated(match[1]);
                        if (decoded) {
                            fileContent = decoded;
                            break;
                        }
                    }
                }

                if (!decoded) {
                    if (processingMessage) {
                        await processingMessage.delete().catch(() => {});
                    }

                    await sendAutoDeleteMessage(message.channel, '⚠️ **Maaf, saya tidak dapat memproses file ini.**\n\n**Saya hanya dapat menangani file yang telah di-obfuscate menggunakan `luaobfuscator.com` atau file yang tidak di-obfuscate.**');
                    return;
                }
            }

            // Scan menggunakan pattern keylogger
            const matches = [...new Set(KEYLOGGER_PATTERNS.flatMap(p => fileContent.match(p) || []))];

            // Deep analysis
            const deepAnalysis = deepAnalyzeContent(fileContent);

            const formatFileSize = attachment.size >= 1048576 ? (attachment.size / 1048576).toFixed(2) + ' MB' :
                                  attachment.size >= 1024 ? (attachment.size / 1024).toFixed(2) + ' KB' :
                                  attachment.size + ' B';

            if (processingMessage) {
                await processingMessage.delete().catch(() => {});
            }

            // Tentukan apakah file berbahaya
            const isDangerous = matches.length > 0 || deepAnalysis.length > 0;
            const totalDetections = matches.length + deepAnalysis.length;

            const embedDescription = [];
            embedDescription.push(`_________________`);
            embedDescription.push(`👤 **Uploaded by:** ${message.author}`);
            embedDescription.push(`📂 **File:** \`${attachment.name}\``);
            embedDescription.push(`📏 **Ukuran:** \`${formatFileSize}\``);

            if (isObfuscated) {
                embedDescription.push(`🔒 **Status:** Lua Obfuscated`);
            }

            embedDescription.push(`_________________`);

            if (isDangerous) {
                embedDescription.push(`**🔍 Hasil Scan (${totalDetections} total deteksi):**`);

                if (matches.length > 0) {
                    embedDescription.push(`\n**Pola Berbahaya Ditemukan:**`);
                    embedDescription.push(`\`\`\`\n${matches.map(m => `• ${m}`).join('\n')}\n\`\`\``);
                }

                if (deepAnalysis.length > 0) {
                    embedDescription.push(`\n**Perilaku Mencurigakan:**`);
                    embedDescription.push(`\`\`\`\n${deepAnalysis.map(indicator => `• ${indicator}`).join('\n')}\n\`\`\``);
                }

                embedDescription.push(`\n⚠️ **File ini mengandung kode yang berpotensi berbahaya!**`);
            } else {
                embedDescription.push(`🔍 **Tidak ada keberadaan keylogger dalam file.**`);
                if (decodingAttempted) {
                    embedDescription.push(`✅ **File berhasil dianalisis.**`);
                }
            }

            // Get keylogger color from database and convert to integer
            const keyloggerColorHex = await db.get(`embed_colors.keylogger`) || (isDangerous ? '#FF0000' : '#00FF00');
            const keyloggerColor = hexToDiscordColor(keyloggerColorHex) || (isDangerous ? 0xFF0000 : 0x00FF00);

            // Use channel.send instead of message.reply since original message is deleted
            await message.channel.send({
                embeds: [{
                    title: isDangerous ? "🚨 KEYLOGGER TERDETEKSI!" : "✅ FILE AMAN",
                    description: embedDescription.join('\n'),
                    color: keyloggerColor,
                    footer: { text: `Keylogger Checker • Armaaa28` },
                    timestamp: new Date().toISOString()
                }]
            });

            // Keylogger results are now permanent (no auto-delete)

        } catch (error) {
            console.error('Keylogger processing error:', error);

            if (processingMessage) {
                await processingMessage.delete().catch(() => {});
            }

            let errorMessage = '⚠️ **Terjadi kesalahan saat memproses file keylogger!**\n\n';

            if (error.message && error.message.includes('Download failed: 404')) {
                errorMessage += '**Error:** File tidak dapat didownload (404 - Not Found)\n';
                errorMessage += '**Solusi:**\n';
                errorMessage += '• File mungkin sudah dihapus dari Discord\n';
                errorMessage += '• Coba upload ulang file Anda\n';
                errorMessage += '• Pastikan file tidak corrupt';
            } else if (error.message && error.message.includes('too large')) {
                errorMessage += '**Error:** File terlalu besar\n';
                errorMessage += '**Solusi:** Maksimal ukuran file adalah 30MB';
            } else if (error.message && error.message.includes('invalid')) {
                errorMessage += '**Error:** File tidak valid\n';
                errorMessage += '**Solusi:** Pastikan file berformat .lua, .luac, .lua.txt, atau .luac.txt';
            } else {
                errorMessage += `**Error:** ${error.message || 'Unknown error'}\n`;
                errorMessage += '**Solusi:** Silakan coba upload ulang file atau hubungi admin jika masalah berlanjut';
            }

            await sendAutoDeleteMessage(message.channel, errorMessage);
        } finally {
            // Cleanup
            if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
            }
        }
        return;
    }

    // MEDIAFIRE DOWNLOAD SYSTEM - CHANNEL KHUSUS
    const mediafireChannels = await db.get('mediafire_channels') || [];
    if (mediafireChannels.includes(message.channel.id)) {
        // Check for mediafire links in message
        const mediafirePattern = /https?:\/\/(www\.)?mediafire\.com\/file\/[a-zA-Z0-9]+\/[^\s]+/gi;
        const mediafireLinks = message.content.match(mediafirePattern);

        if (mediafireLinks && mediafireLinks.length > 0) {
            try {
                const processingMsg = await message.channel.send('⏳ **Mengunduh file dari MediaFire...**');

                for (const link of mediafireLinks) {
                    try {
                        const result = await mediafireDl(link);

                        if (!result.status) {
                            await message.channel.send(`❌ **Gagal mengunduh:** ${result.message}`);
                            continue;
                        }

                        // Download the file
                        const fileResponse = await axios.get(result.download, {
                            responseType: 'arraybuffer',
                            timeout: 120000,
                            maxContentLength: 25 * 1024 * 1024,
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                            }
                        });

                        const fileBuffer = Buffer.from(fileResponse.data);

                        // Check if file is within Discord limit (25MB)
                        if (fileBuffer.length > 25 * 1024 * 1024) {
                            const embed = new EmbedBuilder()
                                .setTitle('📁 ' + result.name)
                                .setDescription(`**File terlalu besar untuk Discord!**\n\n**Size:** ${result.size}\n**Type:** ${result.type || 'Unknown'}\n\n**🔗 Direct Download:** [Click Here](${result.download})`)
                                .setColor('#ff9900')
                                .setFooter({ text: 'MediaFire Downloader' })
                                .setTimestamp();

                            await message.channel.send({ embeds: [embed] });
                        } else {
                            const typeEmoji = {
                                '.mp3': '🎵', '.wav': '🎵', '.ogg': '🎵', '.flac': '🎵',
                                '.mp4': '🎬', '.avi': '🎬', '.mkv': '🎬', '.mov': '🎬',
                                '.jpg': '🖼️', '.jpeg': '🖼️', '.png': '🖼️', '.gif': '🖼️',
                                '.pdf': '📄', '.txt': '📄', '.zip': '📦', '.rar': '📦',
                                '.exe': '💻', '.apk': '📱', '.lua': '📜', '.luac': '📜'
                            };

                            const emoji = typeEmoji[result.type] || '📁';

                            const embed = new EmbedBuilder()
                                .setTitle(`${emoji} ${result.name}`)
                                .setDescription(`**Size:** ${result.size}\n**Type:** ${result.type || 'Unknown'}`)
                                .setColor('#00bfff')
                                .setFooter({ text: 'MediaFire Downloader' })
                                .setTimestamp();

                            await message.channel.send({
                                embeds: [embed],
                                files: [{
                                    attachment: fileBuffer,
                                    name: result.filename
                                }]
                            });
                        }
                    } catch (dlError) {
                        console.error('MediaFire download error:', dlError);
                        
                        let errorMsg = '❌ **Gagal mengunduh file!**\n';
                        if (dlError.message.includes('maxContentLength')) {
                            errorMsg += 'File terlalu besar (maks 25MB untuk upload ke Discord)';
                        } else if (dlError.message.includes('timeout')) {
                            errorMsg += 'Download timeout - file mungkin terlalu besar atau server lambat';
                        } else {
                            errorMsg += dlError.message;
                        }
                        
                        await message.channel.send(errorMsg);
                    }
                }

                await processingMsg.delete().catch(() => {});

            } catch (error) {
                console.error('MediaFire system error:', error);
                await sendAutoDeleteMessage(message.channel, '❌ Terjadi error saat memproses link MediaFire!');
            }
            return;
        }
    }

    // TOP4TOP FILE UPLOAD - CHANNEL TERPISAH
    if (top4topChannelsConfig.includes(message.channel.id) && message.attachments.size > 0) {
        const attachment = message.attachments.first();

        // Check file size (30MB limit for Top4Top)
        if (attachment.size > 30 * 1024 * 1024) {
            await sendAutoDeleteMessage(message.channel, '❌ File terlalu besar! Maksimal 30MB untuk Top4Top.io');
            return;
        }

        try {
            const processingMsg = await message.channel.send('⏳ **Mengupload file ke Top4Top.io...**');

            // Download file with better error handling
            const response = await axios.get(attachment.url, {
                responseType: 'arraybuffer',
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            const buffer = Buffer.from(response.data);

            // Upload to Top4Top with retry logic
            let uploadUrl;
            let retries = 3;

            while (retries > 0) {
                try {
                    uploadUrl = await uploadTop4Top(buffer, attachment.name);
                    break;
                } catch (uploadError) {
                    retries--;
                    if (retries === 0) throw uploadError;

                    console.log(`Upload attempt failed, retrying... (${retries} attempts left)`);
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
                }
            }

            await processingMsg.delete().catch(() => {});

            const typeEmoji = {
                'mp3': '🎵', 'wav': '🎵', 'ogg': '🎵', 'flac': '🎵',
                'mp4': '🎬', 'avi': '🎬', 'mkv': '🎬', 'mov': '🎬',
                'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️',
                'pdf': '📄', 'txt': '📄', 'zip': '📦', 'rar': '📦'
            };

            const fileExt = attachment.name.split('.').pop().toLowerCase();
            const emoji = typeEmoji[fileExt] || '📁';

            // Get top4top color from database and convert to integer
            const top4topColorHex = await db.get(`embed_colors.top4top`) || '#00ff00';
            const top4topColor = hexToDiscordColor(top4topColorHex) || 0x00ff00;

            const embed = new EmbedBuilder()
                .setTitle(`${emoji} ${attachment.name}`)
                .setDescription(`**🔗 Download:** [Click Here](${uploadUrl})`)
                .setColor(top4topColor)
                .setFooter({ text: 'Top4Top.io • Powered by Armaaa28' })
                .setTimestamp();

            const reply = await message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error('Top4Top upload error:', error);

            let errorMessage = '❌ Upload gagal: ';

            if (error.code === 'ECONNABORTED') {
                errorMessage += 'Timeout - Server Top4Top tidak merespons.';
            } else if (error.message.includes('unable to retrieve download link')) {
                errorMessage += 'Tidak dapat mendapatkan link download dari Top4Top. Coba lagi nanti.';
            } else if (error.message.includes('File too large')) {
                errorMessage += 'File terlalu besar (maksimal 30MB).';
            } else {
                errorMessage += error.message;
            }

            await sendAutoDeleteMessage(message.channel, errorMessage);
        }
        return;
    }

    // ANTI-LINK SYSTEM - Check BEFORE invisible market to prevent links from entering anonymous
    const antiLinkConfigs = await db.get('anti_link_configs') || [];
    const antiLinkConfig = antiLinkConfigs.find(config => config.channelId === message.channel.id);

    if (antiLinkConfig && !message.content.startsWith(PREFIX)) {
        // Link patterns to detect
        const linkPatterns = [
            /https?:\/\/[^\s]+/gi,
            /www\.[^\s]+/gi,
            /discord\.gg\/[^\s]+/gi,
            /discord\.com\/invite\/[^\s]+/gi,
            /discordapp\.com\/invite\/[^\s]+/gi,
            /t\.me\/[^\s]+/gi,
            /bit\.ly\/[^\s]+/gi,
            /tinyurl\.com\/[^\s]+/gi,
            /[\w-]+\.(com|net|org|io|me|co|gg|xyz|info|biz|tv|cc|ws|link|site|online|store|app|dev)[^\s]*/gi
        ];

        const hasLink = linkPatterns.some(pattern => pattern.test(message.content));

        if (hasLink) {
            try {
                await message.delete();
                
                const warningEmbed = new EmbedBuilder()
                    .setTitle('🚫 Link Tidak Diizinkan!')
                    .setDescription(`${message.author}, link tidak diperbolehkan di channel ini!`)
                    .setColor('#ff0000')
                    .setFooter({ text: 'Anti-Link System' })
                    .setTimestamp();

                const warningMsg = await message.channel.send({ embeds: [warningEmbed] });
                
                setTimeout(async () => {
                    try {
                        await warningMsg.delete();
                    } catch (e) {}
                }, 5000);
            } catch (error) {
                console.error('Anti-link error:', error);
            }
            return;
        }
    }

    // Invisible Market System - AUTO PROCESS ALL MESSAGES
    const invisibleConfigs = await db.get('invisible_configs') || [];
    const invisibleConfig = invisibleConfigs.find(config => config.channelId === message.channel.id);

    if (invisibleConfig && !message.content.startsWith(PREFIX)) {
        try {
            // Get market categories
            const marketCategories = await db.get('market_categories') || {};

            // Auto-detect type based on keywords, default to 'sell'
            const sellKeywords = ['sell', 'jual', 'selling', 'dijual'];
            const findKeywords = ['find', 'cari', 'looking', 'need', 'butuh', 'wtb'];
            const messageContent = message.content.toLowerCase();

            let listingType = 'sell'; // Default type
            if (findKeywords.some(keyword => messageContent.includes(keyword))) {
                listingType = 'find';
            } else if (sellKeywords.some(keyword => messageContent.includes(keyword))) {
                listingType = 'sell';
            }

            // Delete original message
            await message.delete();

            // Create invisible listing
            const invisibleId = `INV-${invisibleCounter++}`;
            const invisibleData = {
                id: invisibleId,
                userId: message.author.id,
                username: message.author.username,
                content: message.content,
                timestamp: Date.now(),
                channelId: message.channel.id,
                type: listingType,
                serverName: message.guild.name,
                categoryId: marketCategories[listingType] || null
            };

            invisibleMessages.set(invisibleId, invisibleData);
            await db.set(`invisible_messages.${invisibleId}`, invisibleData);

            // Create enhanced listing embed with DARK THEME
            const typeEmoji = listingType === 'sell' ? '💰' : '🔍';
            const typeText = listingType === 'sell' ? 'SELLING' : 'FINDING';

            const embed = new EmbedBuilder()
                .setTitle(`🔒 Anonymous Market - ${typeText}`)
                .setDescription(`${message.content}\n\n**Listing ID:** \`${invisibleId}\`\n**Posted:** <t:${Math.floor(Date.now() / 1000)}:R>`)
                .setColor('#1a1a1a') // DARK THEME COLOR
                .setFooter({ text: `🕶️ ${message.guild.name} Dark Market • Click button to contact ${listingType}er` });

            // Create buttons with DELETE button
            const contactButton = new ButtonBuilder()
                .setCustomId(`contact_invisible_${invisibleId}`)
                .setLabel(listingType === 'sell' ? '📱 Contact Seller' : '📱 Contact Finder')
                .setStyle(ButtonStyle.Secondary);

            const deleteButton = new ButtonBuilder()
                .setCustomId(`delete_invisible_${invisibleId}`)
                .setLabel('🗑️ Delete')
                .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder().addComponents(contactButton, deleteButton);

            await message.channel.send({ embeds: [embed], components: [row] });

        } catch (error) {
            console.error('Invisible market error:', error);
        }
        return;
    }

    // FIXED Auto thread system - ALL messages create threads without keywords
    if (!message.content.startsWith(PREFIX)) {
        const autoThreadChannels = await db.get('auto_thread_channels') || [];
        const threadConfig = autoThreadChannels.find(config => config.channelId === message.channel.id);

        if (threadConfig) {
            try {
                const threadName = `Auto Thread - ${message.author.username}`;

                const thread = await message.startThread({
                    name: threadName,
                    autoArchiveDuration: 60
                });

            } catch (error) {
                console.error('Error creating thread:', error);
            }
        }
        return;
    }

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    try {
        // Anti-spam check
        const userId = message.author.id;
        const now = Date.now();
        const userLastCommand = userCooldowns.get(userId);

        if (userLastCommand && (now - userLastCommand) < COOLDOWN_TIME) {
            const remainingTime = Math.ceil((COOLDOWN_TIME - (now - userLastCommand)) / 1000);
            await sendAutoDeleteMessage(message.channel, `⏰ Please wait ${remainingTime} seconds before using another command.`);
            return;
        }

        userCooldowns.set(userId, now);

        // Active command aliases (cleaned up)
        const commandAliases = {
            'h': 'help',
            'iv': 'set-invisible',
            'sc': 'set-channel',
            'at': 'auto-thread',
            'sv': 'set-verify',
            'sm': 'set-midman',
            'se': 'send-embed',
            'dl': 'daily-list',
            'dt': 'daily-test',
            'dc': 'daily-clear',
            'clr': 'clear',
            'st': 'set-status',
            'stc': 'set-status-clear',
            'sd': 'save-database',
            'ld': 'load-database',
            'lsd': 'list-database',
            'dd': 'delete-database'
        };

        // Use alias if exists
        const actualCommand = commandAliases[command] || command;

        // YouTube MP3 Download command: $yt-dl <youtube-url>
        if (actualCommand === 'yt-dl') {
            if (args.length < 1) {
                await sendAutoDeleteMessage(message.channel, '**Format:** `$yt-dl <youtube-url>`\n**Example:** `$yt-dl https://youtube.com/watch?v=dQw4w9WgXcQ`');
                return;
            }

            const url = args[0];

            if (!/^(https?:\/\/)?((www|m)\.)?(youtube\.com\/watch\?.*?[&?]v=|youtu\.be\/)[\w-]{11}(\S*)?$/i.test(url)) {
                await sendAutoDeleteMessage(message.channel, '❌ **URL YouTube tidak valid!** Pastikan format URL benar.');
                return;
            }

            try {
                const processingMsg = await message.channel.send('🎵 **Mendownload dari YouTube...**');

                // Gunakan fungsi import atau fallback
                let result;
                try {
                    result = await ytmp3dl(url);
                } catch (importError) {
                    console.log('Using backup function for YouTube command');
                    result = await ytmp3dl_backup(url);
                }

                const audioResponse = await axios.get(result.link, { responseType: 'arraybuffer' });
                const audioBuffer = Buffer.from(audioResponse.data);

                const safeTitle = result.title.replace(/[^a-zA-Z0-9\s\-_.]/g, '').substring(0, 50);
                const filename = `${safeTitle || 'youtube_audio'}.mp3`;

                // Upload dengan auto HTTP replacement
                let uploadUrl = await uploadTop4Top(audioBuffer, filename);
                uploadUrl = uploadUrl.replace(/^https:/, 'http:'); // Auto replace HTTPS to HTTP

                await processingMsg.delete().catch(() => {});

                const embed = new EmbedBuilder()
                    .setTitle(`🎵 ${result.title}`)
                    .setDescription(`**🔗 Download:** [Click Here](${uploadUrl})`)
                    .setColor('#FF0000')
                    .setFooter({ text: 'YouTube MP3 Downloader • Powered by Armaaa28' })
                    .setTimestamp();

                await message.channel.send({ embeds: [embed] });

            } catch (error) {
                console.error('YouTube download error:', error);
                await sendAutoDeleteMessage(message.channel, `❌ **YouTube Download Gagal:** ${error.message}`);
            }
        }

        // Spotify MP3 Download command: $spotify-dl <spotify-track-url>
        else if (actualCommand === 'spotify-dl') {
            if (args.length < 1) {
                await sendAutoDeleteMessage(message.channel, '**Format:** `$spotify-dl <spotify-track-url>`\n**Example:** `$spotify-dl https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh`');
                return;
            }

            const url = args[0];

            if (!/^https?:\/\/(open\.)?spotify\.com\/track\/[A-Za-z0-9]{22}(?:\?.*)?$/i.test(url)) {
                await sendAutoDeleteMessage(message.channel, '❌ **URL Spotify tidak valid!** Pastikan itu adalah link track Spotify.');
                return;
            }

            try {
                const processingMsg = await message.channel.send('🎶 **Mendownload dari Spotify...**');

                const result = await spotifydl(url);
                const audioResponse = await axios.get(result.link, { responseType: 'arraybuffer' });
                const audioBuffer = Buffer.from(audioResponse.data);

                const safeTitle = `${result.artist} - ${result.title}`.replace(/[^a-zA-Z0-9\s\-_.]/g, '').substring(0, 50);
                const filename = `${safeTitle || 'spotify_audio'}.mp3`;

                const uploadUrl = await uploadTop4Top(audioBuffer, filename);

                await processingMsg.delete().catch(() => {});

                const embed = new EmbedBuilder()
                    .setTitle(`🎶 ${result.artist} - ${result.title}`)
                    .setDescription(`**🔗 Download:** [Click Here](${uploadUrl})`)
                    .setColor('#1DB954')
                    .setFooter({ text: 'Spotify MP3 Downloader • Powered by Armaaa28' })
                    .setTimestamp();

                await message.channel.send({ embeds: [embed] });

            } catch (error) {
                console.error('Spotify download error:', error);
                await sendAutoDeleteMessage(message.channel, `❌ **Spotify Download Gagal:** ${error.message}`);
            }
        }

        // TikTok MP3 Download command: $tiktok-dl <tiktok-url>
        else if (actualCommand === 'tiktok-dl') {
            if (args.length < 1) {
                await sendAutoDeleteMessage(message.channel, '**Format:** `$tiktok-dl <tiktok-url>`\n**Example:** `$tiktok-dl https://www.tiktok.com/@username/video/1234567890`');
                return;
            }

            const url = args[0];

            if (!/^(https?:\/\/)?(www\.)?(vm|vt)?\.?tiktok\.com\/[^\s]+$/i.test(url)) {
                await sendAutoDeleteMessage(message.channel, '❌ **URL TikTok tidak valid!** Pastikan format URL benar.');
                return;
            }

            try {
                const processingMsg = await message.channel.send('🎵 **Mendownload dari TikTok...**');

                const result = await ttmp3dl(url);
                if (!result.link) {
                    throw new Error('Audio tidak tersedia atau video tidak memiliki audio');
                }

                const audioResponse = await axios.get(result.link, { responseType: 'arraybuffer' });
                const audioBuffer = Buffer.from(audioResponse.data);

                const safeTitle = result.title.replace(/[^a-zA-Z0-9\s\-_.]/g, '').substring(0, 50);
                const filename = `${safeTitle || 'tiktok_audio'}.mp3`;

                const uploadUrl = await uploadTop4Top(audioBuffer, filename);

                await processingMsg.delete().catch(() => {});

                const embed = new EmbedBuilder()
                    .setTitle(`🎵 ${result.title}`)
                    .setDescription(`**🔗 Download:** [Click Here](${uploadUrl})`)
                    .setColor('#000000')
                    .setFooter({ text: 'TikTok MP3 Downloader • Powered by Armaaa28' })
                    .setTimestamp();

                await message.channel.send({ embeds: [embed] });

            } catch (error) {
                console.error('TikTok download error:', error);
                await sendAutoDeleteMessage(message.channel, `❌ **TikTok Download Gagal:** ${error.message}`);
            }
        }

        // SoundCloud MP3 Download command: $soundcloud-dl <soundcloud-url>
        else if (actualCommand === 'soundcloud-dl') {
            if (args.length < 1) {
                await sendAutoDeleteMessage(message.channel, '**Format:** `$soundcloud-dl <soundcloud-url>`\n**Example:** `$soundcloud-dl https://soundcloud.com/artist/track`');
                return;
            }

            const url = args[0];

            if (!/^(https?:\/\/)?(www\.)?(soundcloud\.com|snd\.sc)\/[\w\-./?%&=+#]+$/i.test(url)) {
                await sendAutoDeleteMessage(message.channel, '❌ **URL SoundCloud tidak valid!** Pastikan format URL benar.');
                return;
            }

            try {
                const processingMsg = await message.channel.send('🔊 **Mendownload dari SoundCloud...**');

                const result = await soundclouddl(url);
                const audioResponse = await axios.get(result.link, { responseType: 'arraybuffer' });
                const audioBuffer = Buffer.from(audioResponse.data);

                const safeTitle = result.title.replace(/[^a-zA-Z0-9\s\-_.]/g, '').substring(0, 50);
                const filename = `${safeTitle || 'soundcloud_audio'}.mp3`;

                const uploadUrl = await uploadTop4Top(audioBuffer, filename);

                await processingMsg.delete().catch(() => {});

                const embed = new EmbedBuilder()
                    .setTitle(`🔊 ${result.title}`)
                    .setDescription(`**🔗 Download:** [Click Here](${uploadUrl})`)
                    .setColor('#FF5500')
                    .setFooter({ text: 'SoundCloud MP3 Downloader • Powered by Armaaa28' })
                    .setTimestamp();

                await message.channel.send({ embeds: [embed] });

            } catch (error) {
                console.error('SoundCloud download error:', error);
                await sendAutoDeleteMessage(message.channel, `❌ **SoundCloud Download Gagal:** ${error.message}`);
            }
        }

        // SA-MP Server List command: $samp-list
        else if (actualCommand === 'samp-list') {
            try {
                const processingMsg = await message.channel.send('🔄 **Mengambil daftar server SA-MP Indonesia...**');

                const servers = await listServer(10);

                if (!servers.length) {
                    await processingMsg.delete().catch(() => {});
                    await sendAutoDeleteMessage(message.channel, '❌ **Gagal mengambil data server SA-MP!** Server mungkin sedang down.');
                    return;
                }

                await processingMsg.delete().catch(() => {});

                const embed = new EmbedBuilder()
                    .setTitle('🎮 SA-MP Server List Indonesia')
                    .setColor('#00bfff')
                    .addFields(servers.map(s => ({ name: s.name, value: s.value, inline: false })))
                    .setFooter({ text: 'SA-MP Indonesia • Data dari sa-mp.co.id' })
                    .setTimestamp();

                await message.channel.send({ embeds: [embed] });

            } catch (error) {
                console.error('SA-MP list error:', error);
                await sendAutoDeleteMessage(message.channel, `❌ **SA-MP List Gagal:** ${error.message}`);
            }
        }

        // Set avatar command - IMPROVED
        else if (actualCommand === 'set-avatar') {
            const isStaffUser = await isStaff(message.member);
            if (!isStaffUser) {
                await sendAutoDeleteMessage(message.channel, '❌ Hanya staff (Administrator atau Owner) yang dapat menggunakan command ini!');
                return;
            }

            if (args.length < 1) {
                await sendAutoDeleteMessage(message.channel, '**Format:** `$set-avatar <image-url>`\n**Example:** `$set-avatar https://example.com/avatar.png`');
                return;
            }

            const imageUrl = args[0];

            if (!imageUrl.startsWith('http')) {
                await sendAutoDeleteMessage(message.channel, '❌ URL gambar tidak valid! Harus dimulai dengan http/https');
                return;
            }

            try {
                const processingMessage = await message.channel.send('🔄 **Mengubah avatar bot...**');

                // Use axios instead of custom fetch for better reliability
                const response = await axios.get(imageUrl, {
                    responseType: 'arraybuffer',
                    timeout: 10000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                const buffer = Buffer.from(response.data);

                // Validate image type
                const contentType = response.headers['content-type'];
                if (!contentType || !contentType.startsWith('image/')) {
                    await processingMessage.delete().catch(() => {});
                    await sendAutoDeleteMessage(message.channel, '❌ URL bukan gambar yang valid! Harus berupa file gambar.');
                    return;
                }

                if (buffer.length > 8 * 1024 * 1024) {
                    await processingMessage.delete().catch(() => {});
                    await sendAutoDeleteMessage(message.channel, '❌ Ukuran gambar terlalu besar! Maksimal 8MB.');
                    return;
                }

                if (buffer.length < 1024) {
                    await processingMessage.delete().catch(() => {});
                    await sendAutoDeleteMessage(message.channel, '❌ Gambar terlalu kecil atau corrupt!');
                    return;
                }

                await client.user.setAvatar(buffer);
                await processingMessage.delete().catch(() => {});

                await sendAutoDeleteMessage(message.channel, '✅ **Avatar bot berhasil diubah!**\n*Perubahan mungkin butuh beberapa menit untuk terlihat.*', 10000);

            } catch (error) {
                console.error('Set avatar error:', error);

                let errorMessage = '❌ Gagal mengubah avatar bot! ';

                if (error.code === 'ECONNABORTED') {
                    errorMessage += 'Timeout - URL terlalu lama merespons.';
                } else if (error.response && error.response.status === 404) {
                    errorMessage += 'Gambar tidak ditemukan (404).';
                } else if (error.response && error.response.status === 403) {
                    errorMessage += 'Akses ditolak ke gambar (403).';
                } else if (error.message.includes('Invalid avatar')) {
                    errorMessage += 'Format gambar tidak didukung Discord.';
                } else {
                    errorMessage += error.message;
                }

                await sendAutoDeleteMessage(message.channel, errorMessage);
            }
        }

        // Set status command - STAFF ONLY
        else if (actualCommand === 'set-status') {
            const isStaffUser = await isStaff(message.member);
            if (!isStaffUser) {
                await sendAutoDeleteMessage(message.channel, '❌ Hanya staff (Administrator atau Owner) yang dapat menggunakan command ini!');
                return;
            }
            if (args.length < 2) {
                const reply = await message.reply('**Format:** `$set-status <streaming/watching/playing/listening> <text>`\n**Example:** `$set-status playing Minecraft`\n**Quick:** `$st playing Game`');
                setTimeout(() => reply.delete().catch(() => {}), 5000);
                return;
            }

            const type = args[0].toLowerCase();
            const text = args.slice(1).join(' ');
            const validTypes = ['streaming', 'watching', 'playing', 'listening'];

            if (!validTypes.includes(type)) {
                await sendAutoDeleteMessage(message.channel, '❌ Invalid type! Use: streaming, watching, playing, listening');
                return;
            }

            const activityTypes = {
                'playing': 0,
                'streaming': 1,
                'listening': 2,
                'watching': 3
            };

            try {
                await client.user.setActivity(text, { type: activityTypes[type] });
                const reply = await message.reply(`✅ Bot status updated: **${type}** ${text}`);
                setTimeout(() => reply.delete().catch(() => {}), 5000);
            } catch (error) {
                const reply = await message.reply('❌ Failed to update status!');
                setTimeout(() => reply.delete().catch(() => {}), 5000);
            }
        }

        // Clear status command
        else if (actualCommand === 'set-status-clear') {
            try {
                await client.user.setActivity(null);
                await sendAutoDeleteMessage(message.channel, '✅ Bot status cleared!');
            } catch (error) {
                await sendAutoDeleteMessage(message.channel, '❌ Failed to clear status!');
            }
        }

        // Set channel command - TERPISAH UNTUK SETIAP TIPE
        else if (actualCommand === 'set-channel') {
            if (args.length < 2) {
                await sendAutoDeleteMessage(message.channel, '**Format:** `$set-channel <type> <channel-id>`\n**Types:** keylogger, top4top\n**Example:** `$set-channel keylogger #keylogger-check`\n**Quick:** `$sc keylogger #channel`');
                return;
            }

            const type = args[0].toLowerCase();
            const channelId = args[1].replace(/[<#>]/g, '');
            const channel = client.channels.cache.get(channelId);

            if (!channel) {
                await sendAutoDeleteMessage(message.channel, '❌ Channel not found!');
                return;
            }

            const validTypes = ['keylogger', 'top4top'];
            if (!validTypes.includes(type)) {
                await sendAutoDeleteMessage(message.channel, '❌ Invalid type! Use: keylogger, top4top');
                return;
            }

            if (type === 'keylogger') {
                const keyloggerChannels = await db.get('keylogger_channels') || [];
                if (!keyloggerChannels.includes(channelId)) {
                    keyloggerChannels.push(channelId);
                    await db.set('keylogger_channels', keyloggerChannels);
                }
                await sendAutoDeleteMessage(message.channel, `✅ Keylogger detection channel set to ${channel}! Upload .lua files for scanning.`);
            } else if (type === 'top4top') {
                const top4topChannels = await db.get('top4top_channels') || [];
                if (!top4topChannels.includes(channelId)) {
                    top4topChannels.push(channelId);
                    await db.set('top4top_channels', top4topChannels);
                }
                await sendAutoDeleteMessage(message.channel, `✅ Top4Top upload channel set to ${channel}! Upload any files for Top4Top.io hosting.`);
            }
        }

        // Set category command
        else if (actualCommand === 'set-category') {
            if (args.length < 2) {
                await sendAutoDeleteMessage(message.channel, '**Format:** `$set-category <type> <category-id>`\n**Types:** find, sell\n**Example:** `$set-category find 123456789`');
                return;
            }

            const type = args[0].toLowerCase();
            const categoryId = args[1].replace(/[<#>]/g, '');
            const category = client.channels.cache.get(categoryId);

            if (!category || category.type !== ChannelType.GuildCategory) {
                await sendAutoDeleteMessage(message.channel, '❌ Category not found or invalid!');
                return;
            }

            const validTypes = ['find', 'sell'];
            if (!validTypes.includes(type)) {
                await sendAutoDeleteMessage(message.channel, '❌ Invalid type! Use: find, sell');
                return;
            }

            const marketCategories = await db.get('market_categories') || {};
            marketCategories[type] = categoryId;
            await db.set('market_categories', marketCategories);

            const typeDescriptions = {
                'find': 'FIND listings will create contact channels in this category',
                'sell': 'SELL listings will create contact channels in this category'
            };

            await sendAutoDeleteMessage(message.channel, `✅ **${type.toUpperCase()}** category set to **${category.name}**!\n${typeDescriptions[type]}`);
        }

        // Set invisible command - FIXED untuk multi-channel
        else if (actualCommand === 'set-invisible') {
            if (args.length < 1) {
                await sendAutoDeleteMessage(message.channel, '**Format:** `$set-invisible <channel-id1> <channel-id2> <channel-id3>` atau `$set-invisible <channel-id1,channel-id2,channel-id3>`\n**Example:** `$set-invisible #market1 #market2 #market3`\n**Quick:** `$iv #market1 #market2`');
                return;
            }

            let channelIds = [];

            // Check if using comma-separated format
            if (args.length === 1 && args[0].includes(',')) {
                channelIds = args[0].split(',').map(id => id.replace(/[<#>]/g, '').trim());
            } else {
                // Space-separated format
                channelIds = args.map(id => id.replace(/[<#>]/g, '').trim());
            }

            let invisibleConfigs = await db.get('invisible_configs') || [];
            let successChannels = [];
            let failedChannels = [];
            let alreadyConfigured = [];

            for (const channelId of channelIds) {
                const channel = client.channels.cache.get(channelId);

                if (!channel) {
                    failedChannels.push(channelId);
                    continue;
                }

                const existingIndex = invisibleConfigs.findIndex(config => config.channelId === channelId);
                if (existingIndex >= 0) {
                    alreadyConfigured.push(channel);
                    continue;
                }

                invisibleConfigs.push({ channelId });
                successChannels.push(channel);
            }

            await db.set('invisible_configs', invisibleConfigs);

            let responseText = `🕶️ **Anonymous Market - Dark Web System Activated!**\n\n`;

            if (successChannels.length > 0) {
                responseText += `**✅ Successfully configured (${successChannels.length}):**\n`;
                for (const channel of successChannels) {
                    responseText += `• ${channel}\n`;
                }
            }

            if (alreadyConfigured.length > 0) {
                responseText += `\n**ℹ️ Already configured (${alreadyConfigured.length}):**\n`;
                for (const channel of alreadyConfigured) {
                    responseText += `• ${channel}\n`;
                }
            }

            if (failedChannels.length > 0) {
                responseText += `\n**❌ Failed channels (${failedChannels.length}):**\n`;
                for (const channelId of failedChannels) {
                    responseText += `• ${channelId} (not found)\n`;
                }
            }

            responseText += `\n**Features:**\n• Anonymous SELL/FIND listings\n• Auto-categorized contact channels\n• Enhanced security\n• Delete orderan system`;

            await sendAutoDeleteMessage(message.channel, responseText, 15000);
        }

        // Set anti-link command - untuk multi-channel
        else if (actualCommand === 'set-antilink' || actualCommand === 'antilink' || actualCommand === 'al') {
            if (args.length < 1) {
                await sendAutoDeleteMessage(message.channel, '**Format:** `*set-antilink <channel-id1> <channel-id2>` atau `*set-antilink <channel-id1,channel-id2>`\n**Example:** `*set-antilink #market1 #market2`\n**Quick:** `*al #market`\n**Remove:** `*remove-antilink #channel`');
                return;
            }

            let channelIds = [];

            if (args.length === 1 && args[0].includes(',')) {
                channelIds = args[0].split(',').map(id => id.replace(/[<#>]/g, '').trim());
            } else {
                channelIds = args.map(id => id.replace(/[<#>]/g, '').trim());
            }

            let antiLinkConfigs = await db.get('anti_link_configs') || [];
            let successChannels = [];
            let failedChannels = [];
            let alreadyConfigured = [];

            for (const channelId of channelIds) {
                const channel = client.channels.cache.get(channelId);

                if (!channel) {
                    failedChannels.push(channelId);
                    continue;
                }

                const existingIndex = antiLinkConfigs.findIndex(config => config.channelId === channelId);
                if (existingIndex >= 0) {
                    alreadyConfigured.push(channel);
                    continue;
                }

                antiLinkConfigs.push({ channelId });
                successChannels.push(channel);
            }

            await db.set('anti_link_configs', antiLinkConfigs);

            let responseText = `🔗🚫 **Anti-Link System Activated!**\n\n`;

            if (successChannels.length > 0) {
                responseText += `**✅ Successfully configured (${successChannels.length}):**\n`;
                for (const channel of successChannels) {
                    responseText += `• ${channel}\n`;
                }
            }

            if (alreadyConfigured.length > 0) {
                responseText += `\n**ℹ️ Already configured (${alreadyConfigured.length}):**\n`;
                for (const channel of alreadyConfigured) {
                    responseText += `• ${channel}\n`;
                }
            }

            if (failedChannels.length > 0) {
                responseText += `\n**❌ Failed channels (${failedChannels.length}):**\n`;
                for (const channelId of failedChannels) {
                    responseText += `• ${channelId} (not found)\n`;
                }
            }

            responseText += `\n**Features:**\n• Auto-delete links\n• Warning message\n• Works with Anonymous Market`;

            await sendAutoDeleteMessage(message.channel, responseText, 15000);
        }

        // Remove anti-link command
        else if (actualCommand === 'remove-antilink' || actualCommand === 'ral') {
            if (args.length < 1) {
                await sendAutoDeleteMessage(message.channel, '**Format:** `*remove-antilink <channel-id>` atau `*remove-antilink all`\n**Example:** `*remove-antilink #market`\n**Quick:** `*ral #market`');
                return;
            }

            let antiLinkConfigs = await db.get('anti_link_configs') || [];

            if (args[0].toLowerCase() === 'all') {
                await db.set('anti_link_configs', []);
                await sendAutoDeleteMessage(message.channel, '✅ **All anti-link configurations removed!**');
                return;
            }

            const channelId = args[0].replace(/[<#>]/g, '');
            const existingIndex = antiLinkConfigs.findIndex(config => config.channelId === channelId);

            if (existingIndex < 0) {
                await sendAutoDeleteMessage(message.channel, '❌ Channel tidak dikonfigurasi untuk anti-link!');
                return;
            }

            antiLinkConfigs.splice(existingIndex, 1);
            await db.set('anti_link_configs', antiLinkConfigs);

            const channel = client.channels.cache.get(channelId);
            await sendAutoDeleteMessage(message.channel, `✅ **Anti-link removed** from ${channel || channelId}!`);
        }

        // Set MediaFire channel command
        else if (actualCommand === 'mediafire' || actualCommand === 'mf') {
            if (args.length < 1) {
                await sendAutoDeleteMessage(message.channel, '**Format:** `*mediafire <channel-id>` atau `*mediafire <channel-id1,channel-id2>`\n**Example:** `*mediafire #download-zone`\n**Quick:** `*mf #download`\n**Remove:** `*remove-mediafire #channel`');
                return;
            }

            let channelIds = [];

            if (args.length === 1 && args[0].includes(',')) {
                channelIds = args[0].split(',').map(id => id.replace(/[<#>]/g, '').trim());
            } else {
                channelIds = args.map(id => id.replace(/[<#>]/g, '').trim());
            }

            let mediafireChannels = await db.get('mediafire_channels') || [];
            let successChannels = [];
            let failedChannels = [];
            let alreadyConfigured = [];

            for (const channelId of channelIds) {
                const channel = client.channels.cache.get(channelId);

                if (!channel) {
                    failedChannels.push(channelId);
                    continue;
                }

                if (mediafireChannels.includes(channelId)) {
                    alreadyConfigured.push(channel);
                    continue;
                }

                mediafireChannels.push(channelId);
                successChannels.push(channel);
            }

            await db.set('mediafire_channels', mediafireChannels);

            let responseText = `📥 **MediaFire Downloader Activated!**\n\n`;

            if (successChannels.length > 0) {
                responseText += `**✅ Successfully configured (${successChannels.length}):**\n`;
                for (const channel of successChannels) {
                    responseText += `• ${channel}\n`;
                }
            }

            if (alreadyConfigured.length > 0) {
                responseText += `\n**ℹ️ Already configured (${alreadyConfigured.length}):**\n`;
                for (const channel of alreadyConfigured) {
                    responseText += `• ${channel}\n`;
                }
            }

            if (failedChannels.length > 0) {
                responseText += `\n**❌ Failed channels (${failedChannels.length}):**\n`;
                for (const channelId of failedChannels) {
                    responseText += `• ${channelId} (not found)\n`;
                }
            }

            responseText += `\n**Cara Pakai:**\n• Kirim link MediaFire di channel tersebut\n• Bot akan otomatis download dan kirim file\n• Maks 25MB untuk upload ke Discord`;

            await sendAutoDeleteMessage(message.channel, responseText, 15000);
        }

        // Remove MediaFire channel command
        else if (actualCommand === 'remove-mediafire' || actualCommand === 'rmf') {
            if (args.length < 1) {
                await sendAutoDeleteMessage(message.channel, '**Format:** `*remove-mediafire <channel-id>` atau `*remove-mediafire all`\n**Example:** `*remove-mediafire #download`\n**Quick:** `*rmf #download`');
                return;
            }

            let mediafireChannels = await db.get('mediafire_channels') || [];

            if (args[0].toLowerCase() === 'all') {
                await db.set('mediafire_channels', []);
                await sendAutoDeleteMessage(message.channel, '✅ **All MediaFire channels removed!**');
                return;
            }

            const channelId = args[0].replace(/[<#>]/g, '');
            const existingIndex = mediafireChannels.indexOf(channelId);

            if (existingIndex < 0) {
                await sendAutoDeleteMessage(message.channel, '❌ Channel tidak dikonfigurasi untuk MediaFire!');
                return;
            }

            mediafireChannels.splice(existingIndex, 1);
            await db.set('mediafire_channels', mediafireChannels);

            const channel = client.channels.cache.get(channelId);
            await sendAutoDeleteMessage(message.channel, `✅ **MediaFire removed** from ${channel || channelId}!`);
        }

        // Lock channel command
        else if (actualCommand === 'lock') {
            if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
                await sendAutoDeleteMessage(message.channel, '❌ You need Manage Channels permission to use this command!');
                return;
            }

            try {
                await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                    SendMessages: false
                });

                const embed = new EmbedBuilder()
                    .setTitle('🔒 Channel Locked')
                    .setDescription(`Channel has been locked by ${message.author}`)
                    .setColor('#ff0000')
                    .setTimestamp();

                await sendAutoDeleteMessage(message.channel, { embeds: [embed] });
            } catch (error) {
                await sendAutoDeleteMessage(message.channel, '❌ Failed to lock channel!');
            }
        }

        // Unlock channel command
        else if (actualCommand === 'unlock') {
            if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
                await sendAutoDeleteMessage(message.channel, '❌ You need Manage Channels permission to use this command!');
                return;
            }

            try {
                await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                    SendMessages: true
                });

                const embed = new EmbedBuilder()
                    .setTitle('🔓 Channel Unlocked')
                    .setDescription(`Channel has been unlocked by ${message.author}`)
                    .setColor('#00ff00')
                    .setTimestamp();

                await sendAutoDeleteMessage(message.channel, { embeds: [embed] });
            } catch (error) {
                await sendAutoDeleteMessage(message.channel, '❌ Failed to unlock channel!');
            }
        }

        // Show channel command
        else if (actualCommand === 'show') {
            if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
                await sendAutoDeleteMessage(message.channel, '❌ You need Manage Channels permission to use this command!');
                return;
            }

            try {
                await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                    ViewChannel: true
                });

                await sendAutoDeleteMessage(message.channel, '✅ Channel is now visible to everyone!');
            } catch (error) {
                await sendAutoDeleteMessage(message.channel, '❌ Failed to show channel!');
            }
        }

        // Hide channel command
        else if (actualCommand === 'hide-channel') {
            if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
                await sendAutoDeleteMessage(message.channel, '❌ You need Manage Channels permission to use this command!');
                return;
            }

            try {
                await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                    ViewChannel: false
                });

                await sendAutoDeleteMessage(message.channel, '✅ Channel is now hidden from everyone!');
            } catch (error) {
                await sendAutoDeleteMessage(message.channel, '❌ Failed to hide channel!');
            }
        }

        // Set owner command
        else if (actualCommand === 'set-owner') {
            const isOwnerUser = await isOwner(message.author.id, message.guild.id);
            const hasAdminPerms = message.member.permissions.has(PermissionFlagsBits.Administrator);

            // Only allow if user is already an owner OR has admin permissions (for initial setup)
            if (!isOwnerUser && !hasAdminPerms) {
                await sendAutoDeleteMessage(message.channel, '❌ Hanya Owner atau Administrator yang dapat menggunakan command ini!');
                return;
            }

            if (args.length < 1) {
                await sendAutoDeleteMessage(message.channel, '**Format:** `$set-owner <user-id/mention/@role>`\n**Example:** `$set-owner @user` atau `$set-owner @role`');
                return;
            }

            const owners = await db.get(`owners.${message.guild.id}`) || [];
            let addedUsers = [];
            let failedUsers = [];

            for (const arg of args) {
                let targetId = arg.replace(/[<@!&>]/g, '');

                // Check if it's a role mention
                const role = message.guild.roles.cache.get(targetId);
                if (role) {
                    // Add all members with this role
                    const membersWithRole = role.members.map(member => member.id);
                    for (const memberId of membersWithRole) {
                        if (!owners.includes(memberId)) {
                            owners.push(memberId);
                            const user = await client.users.fetch(memberId).catch(() => null);
                            addedUsers.push(user ? user.username : memberId);
                        }
                    }
                } else {
                    // Check if it's a user
                    try {
                        const user = await client.users.fetch(targetId);
                        if (!owners.includes(targetId)) {
                            owners.push(targetId);
                            addedUsers.push(user.username);
                        }
                    } catch (error) {
                        failedUsers.push(targetId);
                    }
                }
            }

            await db.set(`owners.${message.guild.id}`, owners);

            let response = `✅ **Owner System Updated!**\n\n`;
            if (addedUsers.length > 0) {
                response += `**➕ Added owners:**\n• ${addedUsers.join('\n• ')}\n`;
            }
            if (failedUsers.length > 0) {
                response += `\n**❌ Failed to add:**\n• ${failedUsers.join('\n• ')}`;
            }

            await sendAutoDeleteMessage(message.channel, response);
        }

        // Delete owner command
        else if (actualCommand === 'delete-owner') {
            const isOwnerUser = await isOwner(message.author.id, message.guild.id);
            const hasAdminPerms = message.member.permissions.has(PermissionFlagsBits.Administrator);

            // Only allow if user is already an owner OR has admin permissions
            if (!isOwnerUser && !hasAdminPerms) {
                await sendAutoDeleteMessage(message.channel, '❌ Hanya Owner atau Administrator yang dapat menggunakan command ini!');
                return;
            }

            if (args.length < 1) {
                await sendAutoDeleteMessage(message.channel, '**Format:** `$delete-owner <user-id/mention>`\n**Example:** `$delete-owner @user`');
                return;
            }

            const owners = await db.get(`owners.${message.guild.id}`) || [];
            let removedUsers = [];
            let notFoundUsers = [];

            for (const arg of args) {
                const targetId = arg.replace(/[<@!>]/g, '');
                const index = owners.indexOf(targetId);

                if (index > -1) {
                    owners.splice(index, 1);
                    const user = await client.users.fetch(targetId).catch(() => null);
                    removedUsers.push(user ? user.username : targetId);
                } else {
                    notFoundUsers.push(targetId);
                }
            }

            await db.set(`owners.${message.guild.id}`, owners);

            let response = `✅ **Owner System Updated!**\n\n`;
            if (removedUsers.length > 0) {
                response += `**➖ Removed owners:**\n• ${removedUsers.join('\n• ')}\n`;
            }
            if (notFoundUsers.length > 0) {
                response += `\n**❌ Not found in owner list:**\n• ${notFoundUsers.join('\n• ')}`;
            }

            await sendAutoDeleteMessage(message.channel, response);
        }

        // List owners command
        else if (actualCommand === 'list-owner') {
            const isStaffUser = await isStaff(message.member);
            if (!isStaffUser) {
                await sendAutoDeleteMessage(message.channel, '❌ Hanya staff (Administrator atau Owner) yang dapat menggunakan command ini!');
                return;
            }

            const owners = await db.get(`owners.${message.guild.id}`) || [];

            if (owners.length === 0) {
                await sendAutoDeleteMessage(message.channel, '📝 **Tidak ada owner yang terdaftar di server ini.**');
                return;
            }

            let ownersList = `👑 **Bot Owners List (${owners.length} total)**\n\n`;

            for (let i = 0; i < owners.length; i++) {
                const ownerId = owners[i];
                try {
                    const user = await client.users.fetch(ownerId);
                    ownersList += `**${i + 1}.** ${user.username} (${user.id})\n`;
                } catch (error) {
                    ownersList += `**${i + 1}.** Unknown User (${ownerId})\n`;
                }
            }

            await sendAutoDeleteMessage(message.channel, ownersList, 15000);
        }

        // List colors command
        else if (actualCommand === 'list-colors') {
            const isStaffUser = await isStaff(message.member);
            if (!isStaffUser) {
                await sendAutoDeleteMessage(message.channel, '❌ Hanya staff (Administrator atau Owner) yang dapat menggunakan command ini!');
                return;
            }

            const colors = await db.get('embed_colors') || {};

            let colorsList = `🎨 **Current Embed Colors Configuration**\n\n`;

            // Premium colors section with emojis and hex values
            colorsList += `**💎 Premium Colors Available:**\n`;
            colorsList += `🥇 **Gold:** \`#FFD700\` - Premium luxury golden\n`;
            colorsList += `🥈 **Silver:** \`#C0C0C0\` - Premium elegant metallic\n`;
            colorsList += `🟣 **Purple:** \`#8A2BE2\` - Premium royal violet\n`;
            colorsList += `💎 **Diamond:** \`#B9F2FF\` - Premium exclusive crystal\n`;
            colorsList += `🟢 **Emerald:** \`#50C878\` - Premium nature green\n`;
            colorsList += `🔴 **Ruby:** \`#E0115F\` - Premium passionate red\n`;
            colorsList += `🔵 **Sapphire:** \`#0F52BA\` - Premium deep blue\n`;
            colorsList += `⚪ **Platinum:** \`#E5E4E2\` - Premium sophisticated\n`;
            colorsList += `🌸 **Rose-Gold:** \`#E8B4A0\` - Premium modern pink\n`;
            colorsList += `🟡 **Amber:** \`#FFBF00\` - Premium warm honey\n`;
            colorsList += `🟩 **Jade:** \`#00A86B\` - Premium imperial green\n`;
            colorsList += `⚫ **Onyx:** \`#353839\` - Premium dark elegant\n`;
            colorsList += `⚪ **Pearl:** \`#F8F6F0\` - Premium pure white\n`;
            colorsList += `🌈 **Opal:** \`#A8C3BC\` - Premium mystical\n`;
            colorsList += `🧡 **Coral:** \`#FF7F50\` - Premium ocean vibrant\n`;
            colorsList += `🔴 **Crimson:** \`#DC143C\` - Premium bold red\n`;
            colorsList += `💙 **Azure:** \`#007FFF\` - Premium sky blue\n`;
            colorsList += `🍃 **Mint:** \`#98FB98\` - Premium fresh green\n`;
            colorsList += `💜 **Lavender:** \`#E6E6FA\` - Premium soft purple\n`;
            colorsList += `🌊 **Turquoise:** \`#40E0D0\` - Premium tropical\n`;
            colorsList += `💙 **Cyan:** \`#00FFFF\` - Premium electric blue\n\n`;

            // Current configuration with emojis
            colorsList += `**⚙️ Current Configuration:**\n`;
            const colorTypes = ['takerole', 'ticket', 'testimoni', 'custom', 'daily', 'giveaway', 'keylogger', 'top4top'];
            const typeEmojis = {
                'takerole': '🫐',
                'ticket': '🎫',
                'testimoni': '⭐',
                'custom': '🎨',
                'daily': '📅',
                'giveaway': '🎉',
                'keylogger': '🔍',
                'top4top': '📤'
            };

            for (const type of colorTypes) {
                const color = colors[type] || '#0099ff';
                const emoji = typeEmojis[type] || '📌';
                colorsList += `${emoji} **${type}:** \`${color}\`\n`;
            }

            colorsList += `\n**📋 Available Types for Configuration:**\n`;
            colorsList += `• **all** - Set semua embed colors sekaligus\n`;
            colorsList += `• **takerole** - Role system embeds\n`;
            colorsList += `• **ticket** - Ticket system embeds\n`;
            colorsList += `• **testimoni** - Testimonial embeds\n`;
            colorsList += `• **custom** - Custom embed messages\n`;
            colorsList += `• **daily** - Daily scheduled messages\n`;
            colorsList += `• **giveaway** - Giveaway embeds\n`;
            colorsList += `• **keylogger** - Keylogger checker embeds\n`;
            colorsList += `• **top4top** - Top4Top upload embeds\n\n`;

            colorsList += `**💡 Usage Examples:**\n`;
            colorsList += `\`$set-colors all gold\` - Set all to Gold\n`;
            colorsList += `\`$set-colors ticket ruby\` - Set ticket to Ruby\n`;
            colorsList += `\`$set-colors giveaway sapphire\` - Set giveaway to Sapphire\n`;
            colorsList += `\`$set-colors daily rose-gold\` - Set daily to Rose-Gold`;

            // Send with cyan color embed
            const embed = new EmbedBuilder()
                .setTitle('🎨 Embed Colors Configuration')
                .setDescription(colorsList)
                .setColor('#00FFFF') // Cyan color
                .setTimestamp();

            await message.channel.send({ embeds: [embed] });
        }

        // Set colors command - IMPROVED with single argument support
        else if (actualCommand === 'set-colors') {
            const isStaffUser = await isStaff(message.member);
            if (!isStaffUser) {
                await sendAutoDeleteMessage(message.channel, '❌ Hanya staff (Administrator atau Owner) yang dapat menggunakan command ini!');
                return;
            }

            if (args.length < 1) {
                await sendAutoDeleteMessage(message.channel, '**Format 1:** `$set-colors <color>` - Set all colors\n**Format 2:** `$set-colors <type> <color>` - Set specific type\n**Types:** all, verify, midman, ticket, testimoni, custom, daily, giveaway, keylogger, top4top\n**Premium Colors:** gold, silver, purple, diamond, emerald, ruby, sapphire, platinum, rose-gold, amber, jade, onyx, pearl, opal, coral, crimson, azure, mint, lavender, turquoise, cyan\n**Example:** `$set-colors azure` atau `$set-colors ticket gold`');
                return;
            }

            // Premium color presets - LENGKAP
            const premiumColors = {
                'gold': '#FFD700',
                'silver': '#C0C0C0',
                'purple': '#8A2BE2',
                'diamond': '#B9F2FF',
                'emerald': '#50C878',
                'ruby': '#E0115F',
                'sapphire': '#0F52BA',
                'platinum': '#E5E4E2',
                'rose-gold': '#E8B4A0',
                'amber': '#FFBF00',
                'jade': '#00A86B',
                'onyx': '#353839',
                'pearl': '#F8F6F0',
                'opal': '#A8C3BC',
                'coral': '#FF7F50',
                'crimson': '#DC143C',
                'azure': '#007FFF',
                'mint': '#98FB98',
                'lavender': '#E6E6FA',
                'turquoise': '#40E0D0',
                'cyan': '#00FFFF'
            };

            const validTypes = ['all', 'verify', 'midman', 'ticket', 'testimoni', 'custom', 'daily', 'giveaway', 'keylogger', 'top4top'];

            let type, color;

            // Check if single argument (color only - set all)
            if (args.length === 1) {
                const arg = args[0].toLowerCase();

                // Check if it's a premium color or hex color
                if (premiumColors[arg] || arg.startsWith('#')) {
                    type = 'all';
                    color = arg;
                } else if (validTypes.includes(arg)) {
                    await sendAutoDeleteMessage(message.channel, '❌ Format tidak lengkap! Gunakan: `$set-colors <type> <color>` atau `$set-colors <color>` untuk set semua');
                    return;
                } else {
                    await sendAutoDeleteMessage(message.channel, '❌ Warna tidak dikenal! Gunakan premium colors atau format #RRGGBB\n**Premium Colors:** gold, silver, purple, diamond, emerald, ruby, sapphire, platinum, rose-gold, amber, jade, onyx, pearl, opal, coral, crimson, azure, mint, lavender, turquoise, cyan');
                    return;
                }
            } else {
                // Two arguments (type and color)
                type = args[0].toLowerCase();
                color = args[1].toLowerCase();
            }

            // Validate type
            if (!validTypes.includes(type)) {
                await sendAutoDeleteMessage(message.channel, `❌ Tipe tidak valid! Gunakan: ${validTypes.join(', ')}`);
                return;
            }

            // Process color
            let finalColor = color;
            if (premiumColors[color]) {
                finalColor = premiumColors[color];
            } else if (color.startsWith('#')) {
                // Validate hex color
                const discordColor = hexToDiscordColor(color);
                if (!discordColor) {
                    await sendAutoDeleteMessage(message.channel, '❌ Format warna tidak valid! Gunakan format #RRGGBB (6 digit)');
                    return;
                }
                finalColor = color; // Keep original hex format for storage
            } else {
                await sendAutoDeleteMessage(message.channel, '❌ Format warna tidak valid! Gunakan premium colors atau format #RRGGBB\n**Premium Colors:** gold, silver, purple, diamond, emerald, ruby, sapphire, platinum, rose-gold, amber, jade, onyx, pearl, opal, coral, crimson, azure, mint, lavender, turquoise, cyan');
                return;
            }

            const colors = await db.get('embed_colors') || {};
            const colorName = premiumColors[color] ? color.toUpperCase() : finalColor;

            if (type === 'all') {
                // Set all colors
                const allTypes = ['verify', 'midman', 'ticket', 'testimoni', 'custom', 'daily', 'giveaway', 'keylogger', 'top4top'];
                for (const colorType of allTypes) {
                    colors[colorType] = finalColor;
                }
                await db.set('embed_colors', colors);
                await sendAutoDeleteMessage(message.channel, `✅ **Semua embed colors berhasil diubah ke** \`${colorName}\`!\n\n💎 **Premium color applied to all embeds!**`);
            } else {
                // Set specific color
                colors[type] = finalColor;
                await db.set('embed_colors', colors);
                await sendAutoDeleteMessage(message.channel, `✅ **${type} color berhasil diubah ke** \`${colorName}\`!${premiumColors[color] ? '\n\n💎 **Premium color applied!**' : ''}`);
            }
        }

        // Enhanced help command with pagination and updated pages - STAFF ONLY
        else if (actualCommand === 'help') {
            const isStaffUser = await isStaff(message.member);
            if (!isStaffUser) {
                await sendAutoDeleteMessage(message.channel, '❌ Hanya staff (Administrator atau Owner) yang dapat menggunakan command ini!');
                return;
            }
            const pages = [
                {
                    title: '🎯 Bot Commands - Halaman 1/5',
                    description: '**🔒 Channel Management & Basic Commands**',
                    fields: [
                        { name: '🔐 Channel Control', value: '`$lock` - Lock channel\n`$unlock` - Unlock channel\n`$show` - Show channel\n`$hide-channel` - Hide channel', inline: true },
                        { name: '🧹 Moderation', value: '`$clear <amount>` - Clear messages (max 100)\n**Quick:** `$clr <amount>`', inline: true },
                        { name: '👑 Owner System', value: '`$set-owner <user/role>` - Add owners\n`$delete-owner <user>` - Remove owners\n`$list-owner` - List all owners', inline: true }
                    ]
                },
                {
                    title: '🎯 Bot Commands - Halaman 2/5',
                    description: '**🎨 Customization & Colors**',
                    fields: [
                        { name: '🎨 Color System', value: '`$set-colors <type> <color>` - Set embed colors\n`$list-colors` - View current colors\n**Types:** all, verify, midman, ticket, daily, giveaway', inline: false },
                        { name: '🤖 Bot Customization', value: '`$set-status <type> <text>` - Set bot status (**Quick:** `$st`)\n`$set-status-clear` - Clear status (**Quick:** `$stc`)\n`$set-avatar <image-url>` - Change bot avatar', inline: false },
                        { name: '🎨 Custom Messages', value: '`$send-embed <title> <text> [footer] [channel] [image]` (**Quick:** `$se`)\nCreate beautiful custom embed messages', inline: false }
                    ]
                },
                {
                    title: '🎯 Bot Commands - Halaman 3/5',
                    description: '**🛡️ Security & File Systems**',
                    fields: [
                        { name: '🔍 Keylogger Checker', value: '`$set-channel keylogger <channel>` - Set keylogger channel\nUpload `.lua` files for automatic analysis\n**Quick:** `$sc keylogger #channel`', inline: false },
                        { name: '📤 Top4Top Upload', value: '`$set-channel top4top <channel>` - Set upload channel\nUpload any files for Top4Top hosting\n**Quick:** `$sc top4top #channel`', inline: false },
                        { name: '✅ Verify System', value: '`$set-verify <channel> <role> [title] [text] [image]` (**Quick:** `$sv`)\nSecure user verification with role assignment', inline: false }
                    ]
                },
                {
                    title: '🎯 Bot Commands - Halaman 4/5',
                    description: '**🎫 Ticket & Trading Systems**',
                    fields: [
                        { name: '🛡️ Middleman Service', value: '`$set-midman <channel> <category> [title] [image]` (**Quick:** `$sm`)\nProfessional secure trading system with pricing tiers\nSupports claim/close functionality for staff', inline: false },
                        { name: '🕶️ Invisible Market', value: '`$set-invisible <channels>` - Setup anonymous market (**Quick:** `$iv`)\n`$set-category <type> <category>` - Set categories (find/sell)\nAuto-categorized contact channels', inline: false },
                        { name: '🧵 Auto Thread', value: '`$auto-thread <channel> <type>` (**Quick:** `$at`)\n**Types:** jual-beli, file, find-tcw\nAuto-creates threads for messages', inline: false }
                    ]
                },
                {
                    title: '🎯 Bot Commands - Halaman 5/5',
                    description: '**📅 Scheduling & Database Management**',
                    fields: [
                        { name: '📅 Daily Messages', value: '`$daily <channel> <time> <title> <text> [image]`\n`$daily-list` - View configs (**Quick:** `$dl`)\n`$daily-test [index]` - Test message (**Quick:** `$dt`)\n`$daily-clear [index]` - Remove config (**Quick:** `$dc`)', inline: false },
                        { name: '🎉 Giveaway System', value: '`$send-giveaway <channel> <title> <text> <duration> <winners>`\n`$reroll <message-id>` - Reroll winners\n**Duration:** 1m, 1h, 1d formats', inline: false },
                        { name: '💾 Database Management', value: '`$save-database <nama>` - Backup configs (**Quick:** `$sd`)\n`$load-database <nama>` - Restore backup (**Quick:** `$ld`)\n`$export-database <nama>` - Export to JSON file (sent to DM)\n`$import-database` + upload JSON - Import & merge configs\n`$list-database` - View backups (**Quick:** `$lsd`)\n`$delete-database <nama>` - Delete backup (**Quick:** `$dd`)\n`$set-auto-load <nama|off>` - Auto-load on restart\n`$auto-load-status` - Check auto-load status', inline: false }
                    ]
                }
            ];

            let currentPage = 0;
            const embed = new EmbedBuilder()
                .setTitle(pages[currentPage].title)
                .setDescription(pages[currentPage].description)
                .addFields(pages[currentPage].fields)
                .setColor(0x0099ff)
                .setFooter({ text: 'Use buttons to navigate pages' })
                .setTimestamp();

            const prevButton = new ButtonBuilder()
                .setCustomId('help_prev')
                .setLabel('◀️ Previous')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(currentPage === 0);

            const nextButton = new ButtonBuilder()
                .setCustomId('help_next')
                .setLabel('Next ▶️')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage === pages.length - 1);

            const row = new ActionRowBuilder().addComponents(prevButton, nextButton);

            const helpMessage = await message.channel.send({ embeds: [embed], components: [row] });

            // Store help data for navigation
            await db.set(`help_${helpMessage.id}`, { pages, currentPage, userId: message.author.id });

            // Auto-delete after 5 minutes
            setTimeout(async () => {
                try {
                    await helpMessage.delete();
                    await db.delete(`help_${helpMessage.id}`);
                } catch (error) {
                    console.error('Error deleting help message:', error);
                }
            }, 300000);
        }

        // Enhanced auto-thread command
        else if (actualCommand === 'auto-thread') {
            if (args.length < 1) {
                await sendAutoDeleteMessage(message.channel, '**Format:** `$auto-thread <channel-id>`\n**Example:** `$auto-thread #market`\n**Quick:** `$at #market`\n**Info:** Semua pesan akan otomatis dibuatkan thread');
                return;
            }

            const channelId = args[0].replace(/[<#>]/g, '');

            const channel = client.channels.cache.get(channelId);
            if (!channel) {
                await sendAutoDeleteMessage(message.channel, '❌ Channel not found!');
                return;
            }

            const autoThreads = await db.get('auto_thread_channels') || [];
            const existingIndex = autoThreads.findIndex(config => config.channelId === channelId);

            if (existingIndex >= 0) {
                await sendAutoDeleteMessage(message.channel, `⚠️ Channel ${channel} sudah dikonfigurasi untuk auto-thread!`);
                return;
            }

            autoThreads.push({ channelId });
            await db.set('auto_thread_channels', autoThreads);

            await sendAutoDeleteMessage(message.channel, `✅ **Auto-thread activated** for ${channel}!\n\n**Mode:** Semua pesan akan otomatis dibuatkan thread\n**Format thread:** Auto Thread - username`);
        }

        // Professional Middleman Ticket System
        else if (actualCommand === 'set-midman') {
            const isStaffUser = await isStaff(message.member);
            if (!isStaffUser) {
                await sendAutoDeleteMessage(message.channel, '❌ Hanya staff (Administrator atau Owner) yang dapat menggunakan command ini!');
                return;
            }

            if (args.length < 2) {
                await sendAutoDeleteMessage(message.channel, '**Format:** `$set-midman <channel> <category> [title] [image-url]`\n**Example:** `$set-midman #midman 123456789 "ReadyMart Midman"`\n**Quick:** `$sm #midman 123456`');
                return;
            }

            const channelId = args[0].replace(/[<#>]/g, '');
            const categoryId = args[1].replace(/[<#>]/g, '');

            const channel = client.channels.cache.get(channelId);
            const category = client.channels.cache.get(categoryId);

            if (!channel || !category) {
                await sendAutoDeleteMessage(message.channel, '❌ Channel atau category tidak ditemukan!');
                return;
            }

            let title = 'ReadyMart Midman';
            let imageUrl = 'https://i.postimg.cc/6p8qC6Lv/readymart-logo.png';

            if (args.length > 2) {
                const remainingArgs = args.slice(2);

                if (remainingArgs[remainingArgs.length - 1]?.startsWith('http')) {
                    imageUrl = remainingArgs.pop();
                }

                if (remainingArgs.length >= 1) {
                    title = remainingArgs.join(' ');
                }
            }

            const text = `Jangan lupa gunakan jasa midman, agar terhindar dari penipuan.

## HARGA JASA MIDMAN

**[+] Midman/Rekber/Berber**

Rp 0 > Rp 50.000 = Rp 2.000
Rp 50.001 > 100.000 = Rp 3.000
Rp 100.001 > Rp 500.000 = Rp 5.000
Rp 500.001 > Seterusnya = Rp 6.000

Klik tombol **Create Ticket** di bawah untuk memulai transaksi aman!`;

            const colorHex = await db.get(`embed_colors.midman`) || '#00A8E8';
            const color = hexToDiscordColor(colorHex) || 0x00A8E8;

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(text)
                .setColor(color)
                .setImage(imageUrl)
                .setTimestamp();

            const midmanButton = new ButtonBuilder()
                .setCustomId('create_midman_ticket')
                .setLabel('🎫 Create Ticket')
                .setStyle(ButtonStyle.Primary);

            const row = new ActionRowBuilder().addComponents(midmanButton);

            await db.set(`midman_config.${message.guild.id}`, {
                channelId: channel.id,
                categoryId: category.id,
                title,
                text,
                imageUrl
            });

            await channel.send({ embeds: [embed], components: [row] });
            await sendAutoDeleteMessage(message.channel, `✅ **Sistem middleman** berhasil dikonfigurasi!\n**Channel:** ${channel}\n**Category:** ${category.name}\n**Title:** ${title}`);
        }

        // Enhanced verify system
        else if (actualCommand === 'set-verify') {
            const isStaffUser = await isStaff(message.member);
            if (!isStaffUser) {
                await sendAutoDeleteMessage(message.channel, '❌ Hanya staff (Administrator atau Owner) yang dapat menggunakan command ini!');
                return;
            }

            if (args.length < 3) {
                await sendAutoDeleteMessage(message.channel, '**Format:** `$set-verify <channel> <role> [title] [text] [image-url]`\n**Example:** `$set-verify #verify @Member "Server Verification" "Click to verify yourself"`\n**Quick:** `$sv #verify @Member`');
                return;
            }

            const channelId = args[0].replace(/[<#>]/g, '');
            const roleId = args[1].replace(/[<@&>]/g, '');

            const channel = client.channels.cache.get(channelId);
            const role = message.guild.roles.cache.get(roleId);

            if (!channel || !role) {
                await sendAutoDeleteMessage(message.channel, '❌ Channel atau role tidak ditemukan!');
                return;
            }

            // Parse optional parameters
            let title = 'Server Verification';
            let text = '🛡️ **Selamat datang di server kami!**\n\nKlik tombol di bawah untuk verifikasi dan mendapatkan akses penuh ke server.\n\n**Dengan verifikasi, Anda akan:**\n• Mendapat akses ke semua channel\n• Dapat berinteraksi dengan member lain\n• Menikmati semua fitur server\n\n**Klik "Verify" untuk melanjutkan!**';
            let imageUrl = null;

            if (args.length > 2) {
                const remainingArgs = args.slice(2);

                // Check for image URL
                if (remainingArgs[remainingArgs.length - 1]?.startsWith('http')) {
                    imageUrl = remainingArgs.pop();
                }

                // Parse title and text if provided
                if (remainingArgs.length >= 1) {
                    if (remainingArgs[0].startsWith('"')) {
                        let quotedTitle = remainingArgs[0].substring(1);
                        let titleEnd = 1;

                        while (titleEnd < remainingArgs.length && !quotedTitle.endsWith('"')) {
                            quotedTitle += ' ' + remainingArgs[titleEnd];
                            titleEnd++;
                        }

                        title = quotedTitle.endsWith('"') ? quotedTitle.slice(0, -1) : quotedTitle;

                        if (titleEnd < remainingArgs.length) {
                            text = remainingArgs.slice(titleEnd).join(' ');
                        }
                    } else {
                        title = remainingArgs[0];
                        if (remainingArgs.length > 1) {
                            text = remainingArgs.slice(1).join(' ');
                        }
                    }
                }
            }

            const colorHex = await db.get(`embed_colors.verify`) || '#007FFF';
            const color = hexToDiscordColor(colorHex) || 0x007FFF;

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(text)
                .setColor(color)
                .setTimestamp();

            if (imageUrl && imageUrl.startsWith('http')) {
                embed.setImage(imageUrl);
            }

            const verifyButton = new ButtonBuilder()
                .setCustomId(`verify_user_${role.id}`)
                .setLabel('✅ Verify')
                .setStyle(ButtonStyle.Success);

            const row = new ActionRowBuilder().addComponents(verifyButton);

            // Save verify config
            await db.set(`verify_config.${message.guild.id}`, {
                channelId: channel.id,
                roleId: role.id,
                title,
                text,
                imageUrl
            });

            await channel.send({ embeds: [embed], components: [row] });
            await sendAutoDeleteMessage(message.channel, `✅ **Sistem verifikasi** berhasil dikonfigurasi!\n**Channel:** ${channel}\n**Role:** ${role}\n**Title:** ${title}`);
        }

        // Enhanced send-embed with image support - STAFF ONLY
        else if (actualCommand === 'send-embed') {
            const isStaffUser = await isStaff(message.member);
            if (!isStaffUser) {
                await sendAutoDeleteMessage(message.channel, '❌ Hanya staff (Administrator atau Owner) yang dapat menggunakan command ini!');
                return;
            }
            if (args.length < 2) {
                await sendAutoDeleteMessage(message.channel, '**Format:** `$send-embed <title> <text> [footer] [channel-id] [image-url]`\n**Example:** `$send-embed "Welcome" "Welcome message" "Footer text" #general https://image.url`\n**Quick:** `$se "Title" "Text"`');
                return;
            }

            let title, text, footer = null, channelId = null, imageUrl = null;
            let currentIndex = 0;

            // Check for image URL in last argument
            if (args[args.length - 1].startsWith('http')) {
                imageUrl = args[args.length - 1];
                args.pop();
            }

            // Parse title
            if (args[currentIndex].startsWith('"')) {
                let quotedTitle = args[currentIndex].substring(1);
                currentIndex++;

                while (currentIndex < args.length && !quotedTitle.endsWith('"')) {
                    quotedTitle += ' ' + args[currentIndex];
                    currentIndex++;
                }

                title = quotedTitle.endsWith('"') ? quotedTitle.slice(0, -1) : quotedTitle;
            } else {
                title = args[currentIndex];
                currentIndex++;
            }

            // Parse text
            if (currentIndex < args.length) {
                if (args[currentIndex].startsWith('"')) {
                    let quotedText = args[currentIndex].substring(1);
                    currentIndex++;

                    while (currentIndex < args.length && !quotedText.endsWith('"')) {
                        quotedText += ' ' + args[currentIndex];
                        currentIndex++;
                    }

                    text = quotedText.endsWith('"') ? quotedText.slice(0, -1) : quotedText;
                } else {
                    text = args[currentIndex];
                    currentIndex++;
                }
            }

            // Parse footer and channel
            if (currentIndex < args.length && !args[currentIndex].includes('#')) {
                footer = args[currentIndex];
                currentIndex++;
            }

            if (currentIndex < args.length) {
                channelId = args[currentIndex].replace(/[<#>]/g, '');
            }

            const targetChannel = channelId ? client.channels.cache.get(channelId) : message.channel;

            if (!targetChannel) {
                await sendAutoDeleteMessage(message.channel, '❌ Channel not found!');
                return;
            }

            const colorHex = await db.get(`embed_colors.custom`) || '#0099ff';
            const color = hexToDiscordColor(colorHex) || 0x0099ff;
            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(text)
                .setColor(color)
                .setTimestamp();

            if (footer) embed.setFooter({ text: footer });
            if (imageUrl && imageUrl.startsWith('http')) embed.setImage(imageUrl);

            await targetChannel.send({ embeds: [embed] });
            await sendAutoDeleteMessage(message.channel, '✅ **Custom embed** berhasil dikirim!');
        }

        // Clear command: $clear <amount>
        else if (actualCommand === 'clear') {
            // Check if user has admin permission or manage messages
            if (!message.member.permissions.has(PermissionFlagsBits.Administrator) &&
                !message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
                await sendAutoDeleteMessage(message.channel, '❌ Anda tidak memiliki permission untuk menghapus pesan! Butuh Admin atau Manage Messages permission.');
                return;
            }

            if (args.length < 1) {
                await sendAutoDeleteMessage(message.channel, 'Format: `$clear <jumlah>` (maksimal 100)\n**Quick:** `$clr <jumlah>`');
                return;
            }

            const amount = parseInt(args[0]);
            if (isNaN(amount) || amount < 1 || amount > 100) {
                await sendAutoDeleteMessage(message.channel, '❌ Jumlah harus berupa angka antara 1-100! (Discord limit)');
                return;
            }

            try {
                let deletedCount = 0;
                let totalToDelete = amount;

                // Process in batches of 100 (Discord limit)
                while (totalToDelete > 0) {
                    const batchSize = Math.min(totalToDelete, 100);
                    const messages = await message.channel.messages.fetch({ limit: batchSize });

                    if (messages.size === 0) break;

                    // Filter messages that are less than 14 days old (Discord limitation)
                    const twoWeeksAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
                    const recentMessages = messages.filter(msg => msg.createdTimestamp > twoWeeksAgo);
                    const oldMessages = messages.filter(msg => msg.createdTimestamp <= twoWeeksAgo);

                    // Bulk delete recent messages (faster)
                    if (recentMessages.size > 1) {
                        await message.channel.bulkDelete(recentMessages);
                        deletedCount += recentMessages.size;
                    } else if (recentMessages.size === 1) {
                        await recentMessages.first().delete();
                        deletedCount += 1;
                    }

                    // Individually delete old messages (slower but necessary)
                    for (const msg of oldMessages.values()) {
                        try {
                            await msg.delete();
                            deletedCount++;
                            await new Promise(resolve => setTimeout(resolve, 100));
                        } catch (err) {
                            console.error('Error deleting old message:', err);
                        }
                    }

                    totalToDelete -= batchSize;
                    if (messages.size < batchSize) break; // No more messages to delete
                }

                await sendAutoDeleteMessage(message.channel, `✅ Berhasil menghapus ${deletedCount} pesan!`, 3000);

            } catch (error) {
                console.error('Clear error:', error);
                await sendAutoDeleteMessage(message.channel, '❌ Gagal menghapus pesan! Pastikan bot memiliki permission Administrator atau Manage Messages.');
            }
        }

        // Daily command: $daily <channel-id> <time> <title> <text> [image-url]
        else if (actualCommand === 'daily') {
            if (args.length < 4) {
                await sendAutoDeleteMessage(message.channel, 'Format: `$daily <channel-id> <jam> <title> <text> [image-url]`');
                return;
            }

            const channelId = args[0].replace(/[<#>]/g, '');
            const time = args[1];

            // Parse title, text, dan imageUrl dengan benar
            let title, text, imageUrl = null;
            const remainingArgs = args.slice(2);

            // Check if last argument is an image URL
            const lastArg = remainingArgs[remainingArgs.length - 1];
            if (lastArg && lastArg.startsWith('http') && (lastArg.includes('.jpg') || lastArg.includes('.png') || lastArg.includes('.gif') || lastArg.includes('.jpeg') || lastArg.includes('.webp'))) {
                imageUrl = lastArg;
                remainingArgs.pop(); // Remove image URL from text parsing
            }

            if (remainingArgs[0].startsWith('"')) {
                // Handle quoted title
                let titleEnd = 0;
                let quotedTitle = remainingArgs[0].substring(1);

                if (quotedTitle.endsWith('"')) {
                    title = quotedTitle.slice(0, -1);
                    titleEnd = 1;
                } else {
                    for (let i = 1; i < remainingArgs.length; i++) {
                        quotedTitle += ' ' + remainingArgs[i];
                        if (remainingArgs[i].endsWith('"')) {
                            title = quotedTitle.slice(0, -1);
                            titleEnd = i + 1;
                            break;
                        }
                    }
                }
                text = remainingArgs.slice(titleEnd).join(' ');
            } else {
                // Split by finding natural break
                const allText = remainingArgs.join(' ');
                const separators = [' - ', ' | ', '. ', '! ', '? ', ' : '];
                let splitIndex = -1;

                for (const sep of separators) {
                    const index = allText.indexOf(sep);
                    if (index !== -1) {
                        splitIndex = index;
                        break;
                    }
                }

                if (splitIndex !== -1) {
                    title = allText.substring(0, splitIndex);
                    text = allText.substring(splitIndex + 3);
                } else {
                    const words = remainingArgs;
                    const titleWords = Math.min(4, Math.ceil(words.length / 2));
                    title = words.slice(0, titleWords).join(' ');
                    text = words.slice(titleWords).join(' ');
                }
            }

            const channel = client.channels.cache.get(channelId);
            if (!channel) {
                await sendAutoDeleteMessage(message.channel, 'Channel tidak ditemukan!');
                return;
            }

            // Validate time format
            const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
            if (!timeRegex.test(time)) {
                await sendAutoDeleteMessage(message.channel, 'Format waktu salah! Gunakan HH:MM (contoh: 08:00 atau 16:49)');
                return;
            }

            const dailyConfigs = await db.get('daily_configs') || [];
            dailyConfigs.push({ channelId, time, title, text, imageUrl, lastSent: null });
            await db.set('daily_configs', dailyConfigs);

            let response = `✅ Daily message berhasil diatur untuk ${channel} pada jam ${time}\nTitle: ${title}\nText: ${text}`;
            if (imageUrl) response += `\nImage: ${imageUrl}`;
            await sendAutoDeleteMessage(message.channel, response);
        }

        // Add member: $add-member <user>
        else if (actualCommand === 'add-member') {
            if (args.length < 1) {
                await sendAutoDeleteMessage(message.channel, 'Format: `$add-member <user>`');
                return;
            }

            if (!message.channel.name.startsWith('ticket-')) {
                await sendAutoDeleteMessage(message.channel, 'Command ini hanya bisa digunakan di ticket channel!');
                return;
            }

            const userId = args[0].replace(/[<@!>]/g, '');

            try {
                // Fetch member from guild even if not in channel
                const member = await message.guild.members.fetch(userId);

                if (!member) {
                    await sendAutoDeleteMessage(message.channel, 'User tidak ditemukan di server!');
                    return;
                }

                await message.channel.permissionOverwrites.create(member.user, {
                    ViewChannel: true,
                    SendMessages: true,
                    ReadMessageHistory: true
                });

                await sendAutoDeleteMessage(message.channel, `✅ ${member.user} berhasil ditambahkan ke ticket ini!`);
            } catch (error) {
                await sendAutoDeleteMessage(message.channel, '❌ User tidak ditemukan di server atau terjadi error!');
            }
        }

        // Set testimoni: $set-testimoni <channel-id>
        else if (actualCommand === 'set-testimoni') {
            if (args.length < 1) {
                await sendAutoDeleteMessage(message.channel, 'Format: `$set-testimoni <channel-id>`');
                return;
            }

            const channelId = args[0].replace(/[<#>]/g, '');
            const channel = client.channels.cache.get(channelId);

            if (!channel) {
                await sendAutoDeleteMessage(message.channel, 'Channel tidak ditemukan!');
                return;
            }

            await db.set(`testimoni_channel.${message.guild.id}`, channel.id);
            await sendAutoDeleteMessage(message.channel, `✅ Channel testimoni berhasil diatur ke ${channel}`);
        }

        // Send testimoni: $send-testi
        else if (actualCommand === 'send-testi') {
            try {
                const channelId = await db.get(`testimoni_channel.${message.guild.id}`);
                if (!channelId) {
                    await sendAutoDeleteMessage(message.channel, 'Channel testimoni belum diatur!');
                    return;
                }

                const testiData = await db.get(`testimoni_data.${message.guild.id}`) || {};
                if (!testiData.title) {
                    await sendAutoDeleteMessage(message.channel, 'Data testimoni belum diatur! Gunakan `$update-testi` terlebih dahulu.');
                    return;
                }

                const channel = client.channels.cache.get(channelId);
                if (!channel) {
                    await sendAutoDeleteMessage(message.channel, 'Channel testimoni tidak ditemukan!');
                    return;
                }

                const colorHex = await db.get(`embed_colors.testimoni`) || '#0099ff';
                const color = hexToDiscordColor(colorHex) || 0x0099ff;
                const embed = new EmbedBuilder()
                    .setTitle(testiData.title)
                    .setDescription(testiData.text)
                    .setColor(color)
                    .setTimestamp();

                if (testiData.footer) {
                    embed.setFooter({ text: testiData.footer });
                }

                // Only set image if it's a valid URL
                if (testiData.image && testiData.image.startsWith('http')) {
                    embed.setImage(testiData.image);
                }

                const reply = await channel.send({ embeds: [embed] });

                // Auto delete after 5 seconds
                setTimeout(() => {
                    reply.delete().catch(() => {});
                }, 5000);

                await sendAutoDeleteMessage(message.channel, '✅ Testimoni berhasil dikirim!');
            } catch (error) {
                console.error('Send testi error:', error);
                await sendAutoDeleteMessage(message.channel, '❌ Terjadi error saat mengirim testimoni! Pastikan data testimoni valid.');
            }
        }

        // Update testimoni: $update-testi <text> <title> <image-url> <footer>
        else if (actualCommand === 'update-testi') {
            if (args.length < 4) {
                await sendAutoDeleteMessage(message.channel, 'Format: `$update-testi <text> <title> <image-url> <footer>`');
                return;
            }

            const text = args[0];
            const title = args[1];
            const image = args[2];
            const footer = args.slice(3).join(' ');

            await db.set(`testimoni_data.${message.guild.id}`, {
                title, text, image, footer
            });

            await sendAutoDeleteMessage(message.channel, '✅ Data testimoni berhasil diupdate!');
        }

        // Debug daily configs: $daily-list
        else if (actualCommand === 'daily-list') {
            const dailyConfigs = await db.get('daily_configs') || [];

            if (dailyConfigs.length === 0) {
                await sendAutoDeleteMessage(message.channel, '❌ Belum ada daily configs yang tersimpan!');
                return;
            }

            // Get current WIB time for reference
            const now = new Date();
            const wibTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
            const currentTimeStr = `${wibTime.getHours().toString().padStart(2, '0')}:${wibTime.getMinutes().toString().padStart(2, '0')}`;
            const currentDateStr = `${wibTime.getFullYear()}-${(wibTime.getMonth() + 1).toString().padStart(2, '0')}-${wibTime.getDate().toString().padStart(2, '0')}`;

            let configList = `**📅 Daily Configs (${currentTimeStr} WIB)**\n\n`;

            for (let i = 0; i < dailyConfigs.length; i++) {
                const config = dailyConfigs[i];
                const channel = client.channels.cache.get(config.channelId);
                const channelName = channel ? `#${channel.name}` : `Unknown`;
                const sentToday = config.lastSentDate === currentDateStr ? '✅' : '⏳';

                configList += `**${i + 1}.** ${channelName} | ${config.time} | ${sentToday}\n`;
                configList += `📝 ${config.title}\n`;
                if (config.imageUrl) configList += `🖼️ Image included\n`;
                configList += `\n`;
            }

            if (configList.length > 2000) {
                // Simple split for long messages
                const chunks = configList.match(/[\s\S]{1,1900}/g) || [];
                for (const chunk of chunks) {
                    await sendAutoDeleteMessage(message.channel, chunk, 15000);
                }
            } else {
                await sendAutoDeleteMessage(message.channel, configList, 15000);
            }
        }

        // Clear daily configs: $daily-clear [index]
        else if (actualCommand === 'daily-clear') {
            if (args.length === 0) {
                // Clear all
                await db.set('daily_configs', []);
                await sendAutoDeleteMessage(message.channel, '✅ Semua daily configs berhasil dihapus!');
            } else {
                // Clear specific index
                const index = parseInt(args[0]) - 1;
                const dailyConfigs = await db.get('daily_configs') || [];

                if (index < 0 || index >= dailyConfigs.length) {
                    await sendAutoDeleteMessage(message.channel, '❌ Index tidak valid! Gunakan `$daily-list` untuk melihat daftar configs.');
                    return;
                }

                const removedConfig = dailyConfigs.splice(index, 1)[0];
                await db.set('daily_configs', dailyConfigs);

                await sendAutoDeleteMessage(message.channel, `✅ Daily config #${args[0]} berhasil dihapus!\n**Title:** ${removedConfig.title}\n**Time:** ${removedConfig.time}`);
            }
        }

        // Test daily message: $daily-test [index]
        else if (actualCommand === 'daily-test') {
            const dailyConfigs = await db.get('daily_configs') || [];

            if (dailyConfigs.length === 0) {
                await sendAutoDeleteMessage(message.channel, '❌ Belum ada daily configs! Gunakan `$daily` untuk membuat config.');
                return;
            }

            let configIndex = 0;
            if (args.length > 0) {
                configIndex = parseInt(args[0]) - 1;
                if (configIndex < 0 || configIndex >= dailyConfigs.length) {
                    await sendAutoDeleteMessage(message.channel, '❌ Index tidak valid! Gunakan `$daily-list` untuk melihat daftar configs.');
                    return;
                }
            }

            const config = dailyConfigs[configIndex];
            const channel = client.channels.cache.get(config.channelId);

            if (!channel) {
                await sendAutoDeleteMessage(message.channel, '❌ Channel tidak ditemukan untuk config ini!');
                return;
            }

            try {
                const colorHex = await db.get(`embed_colors.daily`) || '#0099ff';
                const color = hexToDiscordColor(colorHex) || 0x0099ff;
                const wibTime = new Date(new Date().getTime() + (7 * 60 * 60 * 1000));
                const currentTimeStr = `${wibTime.getHours().toString().padStart(2, '0')}:${wibTime.getMinutes().toString().padStart(2, '0')}`;

                const embed = new EmbedBuilder()
                    .setTitle(`${config.title} [TEST]`)
                    .setDescription(config.text)
                    .setColor(color)
                    .setFooter({ text: `Test message sent at ${currentTimeStr} WIB` })
                    .setTimestamp();

                if (config.imageUrl && config.imageUrl.startsWith('http')) {
                    embed.setImage(config.imageUrl);
                }

                // Send test message WITHOUT auto-delete
                await channel.send({ embeds: [embed] });

                await sendAutoDeleteMessage(message.channel, `✅ Test message berhasil dikirim ke ${channel}!\n**Scheduled Time:** ${config.time}\n**Title:** ${config.title}`);

            } catch (error) {
                console.error('Test daily error:', error);
                await sendAutoDeleteMessage(message.channel, '❌ Gagal mengirim test message! Pastikan bot memiliki permission di channel tersebut.');
            }
        }

        // Send giveaway command
        else if (actualCommand === 'send-giveaway') {
            const isStaffUser = await isStaff(message.member);
            if (!isStaffUser) {
                await sendAutoDeleteMessage(message.channel, '❌ Hanya staff (Administrator atau Owner) yang dapat menggunakan command ini!');
                return;
            }

            if (args.length < 5) {
                await sendAutoDeleteMessage(message.channel, '**Format:** `$send-giveaway <channel> <title> <text> <duration> <winners>`\n**Duration:** 1m, 1h, 1d\n**Example:** `$send-giveaway #giveaways "Free Nitro" "Win Discord Nitro!" 1h 1`');
                return;
            }

            const channelId = args[0].replace(/[<#>]/g, '');

            // Parse title (handle quoted strings)
            let title, text, duration, winners;
            let currentIndex = 1;

            // Parse title
            if (args[currentIndex].startsWith('"')) {
                let quotedTitle = args[currentIndex].substring(1);
                currentIndex++;

                while (currentIndex < args.length && !quotedTitle.endsWith('"')) {
                    quotedTitle += ' ' + args[currentIndex];
                    currentIndex++;
                }

                title = quotedTitle.endsWith('"') ? quotedTitle.slice(0, -1) : quotedTitle;
            } else {
                title = args[currentIndex];
                currentIndex++;
            }

            // Parse text
            if (currentIndex < args.length) {
                if (args[currentIndex].startsWith('"')) {
                    let quotedText = args[currentIndex].substring(1);
                    currentIndex++;

                    while (currentIndex < args.length && !quotedText.endsWith('"')) {
                        quotedText += ' ' + args[currentIndex];
                        currentIndex++;
                    }

                    text = quotedText.endsWith('"') ? quotedText.slice(0, -1) : quotedText;
                } else {
                    text = args[currentIndex];
                    currentIndex++;
                }
            }

            // Get duration and winners
            duration = args[args.length - 2];
            winners = parseInt(args[args.length - 1]);

            const channel = client.channels.cache.get(channelId);
            if (!channel) {
                await sendAutoDeleteMessage(message.channel, '❌ Channel not found!');
                return;
            }

            if (isNaN(winners) || winners < 1 || winners > 20) {
                await sendAutoDeleteMessage(message.channel, '❌ Winners harus berupa angka positif antara 1-20!');
                return;
            }

            // Parse duration
            const timeUnit = duration.slice(-1).toLowerCase();
            const timeValue = parseInt(duration.slice(0, -1));
            let durationMs = 0;

            switch (timeUnit) {
                case 'm':
                    durationMs = timeValue * 60 * 1000;
                    break;
                case 'h':
                    durationMs = timeValue * 60 * 60 * 1000;
                    break;
                case 'd':
                    durationMs = timeValue * 24 * 60 * 60 * 1000;
                    break;
                default:
                    await sendAutoDeleteMessage(message.channel, '❌ Invalid duration format! Use: 1m, 1h, 1d');
                    return;
            }

            const endTime = new Date(Date.now() + durationMs);
            const colorHex = await db.get(`embed_colors.giveaway`) || '#0099ff';
            const color = hexToDiscordColor(colorHex) || 0x0099ff;

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(`${text}\n\n**Ends:** <t:${Math.floor(endTime.getTime() / 1000)}:R>\n**Hosted by:** <@${message.author.id}>\n**Entries:** 0\n**Winners:** ${winners}`)
                .setColor(color)
                .setTimestamp();

            const button = new ButtonBuilder()
                .setCustomId('join_giveaway')
                .setLabel('🎉 Join Giveaway')
                .setStyle(ButtonStyle.Primary);

            const row = new ActionRowBuilder().addComponents(button);

            const giveawayMessage = await channel.send({ embeds: [embed], components: [row] });

            // Store giveaway data
            const giveawayData = {
                messageId: giveawayMessage.id,
                channelId: channel.id,
                host: message.author.id,
                title,
                text,
                endTime: endTime.getTime(),
                winners,
                participants: [],
                ended: false
            };

            await db.set(`giveaway.${giveawayMessage.id}`, giveawayData);

            // Set timeout to end giveaway
            setTimeout(() => {
                endGiveaway(giveawayMessage.id);
            }, durationMs);

            await sendAutoDeleteMessage(message.channel, `✅ **Giveaway created successfully!**\n**Channel:** ${channel}\n**Duration:** ${duration}\n**Winners:** ${winners}`);
        }

        // Reroll giveaway command
        else if (actualCommand === 'reroll') {
            const isStaffUser = await isStaff(message.member);
            if (!isStaffUser) {
                await sendAutoDeleteMessage(message.channel, '❌ Hanya staff (Administrator atau Owner) yang dapat menggunakan command ini!');
                return;
            }

            if (args.length < 1) {
                await sendAutoDeleteMessage(message.channel, '**Format:** `$reroll <message-id>`\n**Example:** `$reroll 1234567890123456789`');
                return;
            }

            const messageId = args[0];
            const giveawayData = await db.get(`giveaway.${messageId}`);

            if (!giveawayData || !giveawayData.ended) {
                await sendAutoDeleteMessage(message.channel, '❌ Giveaway not found or not ended yet!');
                return;
            }

            if (giveawayData.participants.length === 0) {
                await sendAutoDeleteMessage(message.channel, '❌ No participants in this giveaway!');
                return;
            }

            const winners = [];
            const participantsCopy = [...giveawayData.participants];

            for (let i = 0; i < Math.min(giveawayData.winners, participantsCopy.length); i++) {
                const randomIndex = Math.floor(Math.random() * participantsCopy.length);
                winners.push(participantsCopy.splice(randomIndex, 1)[0]);
            }

            const winnersText = winners.map(id => `<@${id}>`).join(', ');
            await message.channel.send(`🎉 **GIVEAWAY REROLLED!** New winners: ${winnersText}`);

            await sendAutoDeleteMessage(message.channel, `✅ **Giveaway rerolled successfully!**\n**New winners:** ${winnersText}`);
        }

        // Enhanced save database command
        else if (actualCommand === 'save-database') {
            const isStaffUser = await isStaff(message.member);
            if (!isStaffUser) {
                await sendAutoDeleteMessage(message.channel, '❌ Hanya staff (Administrator atau Owner) yang dapat menggunakan command ini!');
                return;
            }

            if (args.length < 1) {
                await sendAutoDeleteMessage(message.channel, '**Format:** `$save-database <nama-database>`\n**Example:** `$save-database backup-1`\n**Quick:** `$sd backup-1`');
                return;
            }

            const databaseName = args[0];

            try {
                const processingMsg = await message.channel.send('💾 **Menyimpan database...**');

                // Collect ALL bot configurations with detailed collection
                const configData = {
                    timestamp: new Date().toISOString(),
                    guildId: message.guild.id,
                    serverName: message.guild.name,
                    version: '2.0',
                    configs: {
                        // Guild-specific configs
                        owners: await db.get(`owners.${message.guild.id}`) || [],
                        ticket_config: await db.get(`ticket_config.${message.guild.id}`) || {},
                        midman_config: await db.get(`midman_config.${message.guild.id}`) || {},
                        verify_config: await db.get(`verify_config.${message.guild.id}`) || {},
                        testimoni_channel: await db.get(`testimoni_channel.${message.guild.id}`) || null,
                        testimoni_data: await db.get(`testimoni_data.${message.guild.id}`) || {},

                        // Global configs
                        embed_colors: await db.get('embed_colors') || {},
                        keylogger_channels: await db.get('keylogger_channels') || [],
                        top4top_channels: await db.get('top4top_channels') || [],
                        invisible_configs: await db.get('invisible_configs') || [],
                        market_categories: await db.get('market_categories') || {},
                        auto_thread_channels: await db.get('auto_thread_channels') || [],
                        daily_configs: await db.get('daily_configs') || [],
                        verify_configs: await db.get('verify_configs') || {},
                        midman_configs: await db.get('midman_configs') || {}
                    }
                };

                // Calculate total configurations
                let totalConfigs = 0;
                for (const [key, value] of Object.entries(configData.configs)) {
                    if (Array.isArray(value)) {
                        totalConfigs += value.length;
                    } else if (typeof value === 'object' && value !== null) {
                        totalConfigs += Object.keys(value).length;
                    } else if (value !== null && value !== undefined) {
                        totalConfigs += 1;
                    }
                }

                // Check if database name already exists
                const existingBackup = await db.get(`database_backup.${databaseName}`);
                let warningText = '';

                if (existingBackup) {
                    warningText = '\n\n⚠️ **Warning:** Database dengan nama ini sudah ada dan akan di-overwrite!';
                }

                // Save with enhanced error handling
                await db.set(`database_backup.${databaseName}`, configData);

                // Verify save by reading it back
                const verifyData = await db.get(`database_backup.${databaseName}`);
                if (!verifyData || !verifyData.configs) {
                    throw new Error('Verifikasi save gagal - data tidak dapat dibaca kembali');
                }

                await processingMsg.delete().catch(() => {});

                const embed = new EmbedBuilder()
                    .setTitle('💾 Database Berhasil Disimpan!')
                    .setDescription(`**📋 Database Name:** \`${databaseName}\`\n**🏠 Server:** ${message.guild.name}\n**📅 Timestamp:** <t:${Math.floor(Date.now() / 1000)}:F>\n**📊 Total Configs:** ${totalConfigs} items${warningText}\n\n**✅ Konfigurasi yang disimpan:**\n• 👑 ${configData.configs.owners.length} owners\n• 🎨 ${Object.keys(configData.configs.embed_colors).length} embed colors\n• 🔍 ${configData.configs.keylogger_channels.length} keylogger channels\n• 📤 ${configData.configs.top4top_channels.length} top4top channels\n• 🕶️ ${configData.configs.invisible_configs.length} invisible configs\n• 🧵 ${configData.configs.auto_thread_channels.length} auto-thread channels\n• 📅 ${configData.configs.daily_configs.length} daily configs\n• ✅ ${Object.keys(configData.configs.verify_config).length} verify configs\n• 🛡️ ${Object.keys(configData.configs.midman_config).length} midman configs`)
                    .setColor('#00ff00')
                    .setFooter({ text: `✅ Data tersimpan dan terverifikasi • Version ${configData.version}` })
                    .setTimestamp();

                await sendAutoDeleteMessage(message.channel, { embeds: [embed] }, 15000);

            } catch (error) {
                console.error('Save database error:', error);
                await sendAutoDeleteMessage(message.channel, `❌ **Gagal menyimpan database!**\n\n**Error:** ${error.message}\n**Solusi:** Coba gunakan nama database yang berbeda atau restart bot.`);
            }
        }

        // Enhanced load database command
        else if (actualCommand === 'load-database') {
            const isStaffUser = await isStaff(message.member);
            if (!isStaffUser) {
                await sendAutoDeleteMessage(message.channel, '❌ Hanya staff (Administrator atau Owner) yang dapat menggunakan command ini!');
                return;
            }

            if (args.length < 1) {
                await sendAutoDeleteMessage(message.channel, '**Format:** `$load-database <nama-database>`\n**Example:** `$load-database backup-1`\n**Quick:** `$ld backup-1`\n**Tip:** Gunakan `$list-database` untuk melihat daftar database');
                return;
            }

            const databaseName = args[0];

            try {
                const configData = await db.get(`database_backup.${databaseName}`);

                if (!configData || !configData.configs) {
                    await sendAutoDeleteMessage(message.channel, `❌ **Database backup tidak ditemukan!**\n\n**Database:** \`${databaseName}\`\n**Status:** Tidak ada atau corrupt\n\n**Solusi:**\n• Gunakan \`$list-database\` untuk melihat daftar yang tersedia\n• Pastikan nama database benar (case-sensitive)`);
                    return;
                }

                const processingMsg = await message.channel.send('🔄 **Memuat database backup...**');

                let restoredCount = 0;
                const restoredItems = [];

                // Enhanced restore with detailed logging
                const configMappings = [
                    { key: 'owners', target: `owners.${message.guild.id}`, name: 'Owners' },
                    { key: 'embed_colors', target: 'embed_colors', name: 'Embed Colors' },
                    { key: 'keylogger_channels', target: 'keylogger_channels', name: 'Keylogger Channels' },
                    { key: 'top4top_channels', target: 'top4top_channels', name: 'Top4Top Channels' },
                    { key: 'invisible_configs', target: 'invisible_configs', name: 'Invisible Configs' },
                    { key: 'market_categories', target: 'market_categories', name: 'Market Categories' },
                    { key: 'auto_thread_channels', target: 'auto_thread_channels', name: 'Auto Thread Channels' },
                    { key: 'daily_configs', target: 'daily_configs', name: 'Daily Configs' },
                    { key: 'verify_configs', target: 'verify_configs', name: 'Verify Configs' },
                    { key: 'midman_configs', target: 'midman_configs', name: 'Midman Configs' },
                    { key: 'anti_link_configs', target: 'anti_link_configs', name: 'Anti-Link Configs' }, // Added Anti-Link Configs
                    { key: 'ticket_config', target: `ticket_config.${message.guild.id}`, name: 'Ticket Config' },
                    { key: 'midman_config', target: `midman_config.${message.guild.id}`, name: 'Midman Config' },
                    { key: 'verify_config', target: `verify_config.${message.guild.id}`, name: 'Verify Config' },
                    { key: 'testimoni_channel', target: `testimoni_channel.${message.guild.id}`, name: 'Testimoni Channel' },
                    { key: 'testimoni_data', target: `testimoni_data.${message.guild.id}`, name: 'Testimoni Data' }
                ];

                for (const mapping of configMappings) {
                    const data = configData.configs[mapping.key];
                    if (data !== null && data !== undefined) {
                        if (Array.isArray(data) && data.length > 0) {
                            await db.set(mapping.target, data);
                            restoredItems.push(`✅ ${mapping.name} (${data.length} items)`);
                            restoredCount++;
                        } else if (typeof data === 'object' && Object.keys(data).length > 0) {
                            await db.set(mapping.target, data);
                            restoredItems.push(`✅ ${mapping.name} (${Object.keys(data).length} items)`);
                            restoredCount++;
                        } else if (typeof data !== 'object' && data !== null) {
                            await db.set(mapping.target, data);
                            restoredItems.push(`✅ ${mapping.name}`);
                            restoredCount++;
                        }
                    }
                }

                // Verify restoration
                let verifiedCount = 0;
                for (const mapping of configMappings) {
                    const restoredData = await db.get(mapping.target);
                    if (restoredData) verifiedCount++;
                }

                await processingMsg.delete().catch(() => {});

                const version = configData.version || '1.0';
                const embed = new EmbedBuilder()
                    .setTitle('📥 Database Berhasil Dimuat!')
                    .setDescription(`**📋 Database:** \`${databaseName}\`\n**🏠 Original Server:** ${configData.serverName}\n**📅 Backup Date:** <t:${Math.floor(new Date(configData.timestamp).getTime() / 1000)}:F>\n**📦 Version:** ${version}\n\n**📊 Statistik Restore:**\n• **Total Restored:** ${restoredCount} configurations\n• **Verified:** ${verifiedCount} active\n• **Success Rate:** ${Math.round((verifiedCount / restoredCount) * 100)}%\n\n**🔄 Konfigurasi yang berhasil di-restore:**\n${restoredItems.slice(0, 10).join('\n')}${restoredItems.length > 10 ? `\n... dan ${restoredItems.length - 10} lainnya` : ''}\n\n✅ **Database berhasil dimuat dan diverifikasi!**`)
                    .setColor('#00ff00')
                    .setFooter({ text: `✅ ${restoredCount} configs restored • ${verifiedCount} verified active` })
                    .setTimestamp();

                await sendAutoDeleteMessage(message.channel, { embeds: [embed] }, 20000);

            } catch (error) {
                console.error('Load database error:', error);
                await sendAutoDeleteMessage(message.channel, `❌ **Gagal memuat database!**\n\n**Error:** ${error.message}\n**Database:** \`${databaseName}\`\n\n**Solusi:**\n• Coba database lain dari \`$list-database\`\n• Restart bot jika masalah persisten\n• Hubungi developer jika error berlanjut`);
            }
        }

        // List database command (improved to scan all existing data)
        else if (actualCommand === 'list-database') {
            const isStaffUser = await isStaff(message.member);
            if (!isStaffUser) {
                await sendAutoDeleteMessage(message.channel, '❌ Hanya staff (Administrator atau Owner) yang dapat menggunakan command ini!');
                return;
            }

            try {
                const foundBackups = [];

                // Comprehensive scan for all database_backup entries
                // This will scan through different possible backup naming patterns
                const searchPatterns = [
                    // Common backup names
                    'backup-1', 'backup-2', 'backup-3', 'backup-4', 'backup-5', 'backup-6', 'backup-7', 'backup-8', 'backup-9', 'backup-10',
                    'backup-11', 'backup-12', 'backup-13', 'backup-14', 'backup-15', 'backup-16', 'backup-17', 'backup-18', 'backup-19', 'backup-20',
                    'backup-21', 'backup-22', 'backup-23', 'backup-24', 'backup-25', 'backup-26', 'backup-27', 'backup-28', 'backup-29', 'backup-30',

                    // Named backups
                    'daily-backup', 'weekly-backup', 'emergency-backup', 'config-backup', 'setup-backup',
                    'production-backup', 'test-backup', 'dev-backup', 'staging-backup', 'release-backup',
                    'main-backup', 'old-backup', 'new-backup', 'temp-backup', 'auto-backup', 'manual-backup',

                    // Auto-generated backups by date
                    ...Array.from({length: 31}, (_, i) => `auto-backup-2024-01-${String(i + 1).padStart(2, '0')}`),
                    ...Array.from({length: 31}, (_, i) => `auto-backup-2024-02-${String(i + 1).padStart(2, '0')}`),
                    ...Array.from({length: 31}, (_, i) => `auto-backup-2024-03-${String(i + 1).padStart(2, '0')}`),
                    ...Array.from({length: 31}, (_, i) => `auto-backup-2024-04-${String(i + 1).padStart(2, '0')}`),
                    ...Array.from({length: 31}, (_, i) => `auto-backup-2024-05-${String(i + 1).padStart(2, '0')}`),
                    ...Array.from({length: 31}, (_, i) => `auto-backup-2024-06-${String(i + 1).padStart(2, '0')}`),
                    ...Array.from({length: 31}, (_, i) => `auto-backup-2024-07-${String(i + 1).padStart(2, '0')}`),
                    ...Array.from({length: 31}, (_, i) => `auto-backup-2024-08-${String(i + 1).padStart(2, '0')}`),
                    ...Array.from({length: 31}, (_, i) => `auto-backup-2024-09-${String(i + 1).padStart(2, '0')}`),
                    ...Array.from({length: 31}, (_, i) => `auto-backup-2024-10-${String(i + 1).padStart(2, '0')}`),
                    ...Array.from({length: 31}, (_, i) => `auto-backup-2024-11-${String(i + 1).padStart(2, '0')}`),
                    ...Array.from({length: 31}, (_, i) => `auto-backup-2024-12-${String(i + 1).padStart(2, '0')}`),

                    // Custom patterns
                    'server-backup-1', 'server-backup-2', 'guild-backup-1', 'guild-backup-2',
                    'config-1', 'config-2', 'setup-1', 'setup-2', 'initial-1', 'final-1'
                ];

                // Check each pattern
                for (const backupName of searchPatterns) {
                    try {
                        const backupData = await db.get(`database_backup.${backupName}`);
                        if (backupData && backupData.configs) {
                            foundBackups.push({
                                name: backupName,
                                data: backupData,
                                found: true
                            });
                        }
                    } catch (error) {
                        // Continue scanning even if one fails
                        continue;
                    }
                }

                // Also check current database state as potential backup
                const currentConfigs = {
                    owners: await db.get(`owners.${message.guild.id}`) || [],
                    embed_colors: await db.get('embed_colors') || {},
                    keylogger_channels: await db.get('keylogger_channels') || [],
                    top4top_channels: await db.get('top4top_channels') || [],
                    invisible_configs: await db.get('invisible_configs') || [],
                    market_categories: await db.get('market_categories') || {},
                    auto_thread_channels: await db.get('auto_thread_channels') || [],
                    daily_configs: await db.get('daily_configs') || [],
                    verify_configs: await db.get('verify_configs') || {},
                    midman_configs: await db.get('midman_configs') || {}
                };

                // Count current active configs
                const currentConfigCount = Object.values(currentConfigs).reduce((count, config) => {
                    if (Array.isArray(config)) return count + config.length;
                    if (typeof config === 'object' && config !== null) return count + Object.keys(config).length;
                    return count;
                }, 0);

                if (foundBackups.length === 0 && currentConfigCount === 0) {
                    await sendAutoDeleteMessage(message.channel, '📂 **Tidak ada database backup yang ditemukan!**\n\n**Status:** Tidak ada konfigurasi tersimpan atau backup yang dibuat sebelumnya.\n\n**Solusi:**\n• Gunakan `$save-database <nama>` untuk membuat backup pertama\n• Setup konfigurasi bot terlebih dahulu', 15000);
                    return;
                }

                // Sort by timestamp (newest first)
                foundBackups.sort((a, b) => {
                    const timestampA = new Date(a.data.timestamp || 0).getTime();
                    const timestampB = new Date(b.data.timestamp || 0).getTime();
                    return timestampB - timestampA;
                });

                let backupList = `📂 **Database Backups Found: ${foundBackups.length}**\n\n`;

                if (currentConfigCount > 0) {
                    backupList += `🟢 **Current Active Configs:** ${currentConfigCount} items loaded\n\n`;
                }

                // Show backups with more detail
                for (let i = 0; i < foundBackups.length && i < 20; i++) {
                    const backup = foundBackups[i];
                    const configs = backup.data.configs || {};

                    const configDetails = [];
                    if (configs.owners?.length) configDetails.push(`👑${configs.owners.length}`);
                    if (configs.daily_configs?.length) configDetails.push(`📅${configs.daily_configs.length}`);
                    if (configs.invisible_configs?.length) configDetails.push(`🕶️${configs.invisible_configs.length}`);
                    if (Object.keys(configs.embed_colors || {}).length) configDetails.push(`🎨${Object.keys(configs.embed_colors).length}`);
                    if (configs.keylogger_channels?.length) configDetails.push(`🔍${configs.keylogger_channels.length}`);
                    if (configs.top4top_channels?.length) configDetails.push(`📤${configs.top4top_channels.length}`);

                    const totalConfigs = Object.values(configs).reduce((count, config) => {
                        if (Array.isArray(config)) return count + config.length;
                        if (typeof config === 'object' && config !== null) return count + Object.keys(config).length;
                        return count;
                    }, 0);

                    const backupDate = backup.data.timestamp ? new Date(backup.data.timestamp) : null;
                    const timeDisplay = backupDate ?
                        Math.floor((Date.now() - backupDate.getTime()) / (1000 * 60 * 60 * 24)) === 0 ?
                        'Today' : `${Math.floor((Date.now() - backupDate.getTime()) / (1000 * 60 * 60 * 24))}d ago`
                        : 'Unknown date';

                    backupList += `**${i + 1}.** \`${backup.name}\`\n`;
                    backupList += `📊 **${totalConfigs} configs** | 📅 ${timeDisplay}\n`;
                    backupList += `🏠 ${backup.data.serverName || 'Unknown Server'}\n`;
                    if (configDetails.length > 0) {
                        backupList += `📋 ${configDetails.join(', ')}\n`;
                    }
                    backupList += `\n`;
                }

                if (foundBackups.length > 20) {
                    backupList += `⚠️ **Showing first 20 of ${foundBackups.length} backups**\n\n`;
                }

                backupList += `**💡 Commands:**\n`;
                backupList += `• \`$load-database <nama>\` - Load backup\n`;
                backupList += `• \`$save-database <nama>\` - Create backup\n`;
                backupList += `• \`$delete-database <nama>\` - Delete backup\n`;
                backupList += `• \`$set-auto-load <nama>\` - Auto-load on restart`;

                const embed = new EmbedBuilder()
                    .setTitle('📂 Database Management System')
                    .setDescription(backupList)
                    .setColor('#0099ff')
                    .setFooter({ text: `Found ${foundBackups.length} backups • Current configs: ${currentConfigCount}` })
                    .setTimestamp();

                await message.channel.send({ embeds: [embed] });

            } catch (error) {
                console.error('List database error:', error);
                await sendAutoDeleteMessage(message.channel, `❌ **Error scanning database!** \n\n**Error:** ${error.message}\n\n**Solusi:** Coba gunakan \`$save-database test\` untuk membuat backup baru terlebih dahulu.`);
            }
        }

        // Export database to JSON file command
        else if (actualCommand === 'export-database') {
            const isStaffUser = await isStaff(message.member);
            if (!isStaffUser) {
                await sendAutoDeleteMessage(message.channel, '❌ Hanya staff (Administrator atau Owner) yang dapat menggunakan command ini!');
                return;
            }

            if (args.length < 1) {
                await sendAutoDeleteMessage(message.channel, '**Format:** `$export-database <nama-database>`\n**Example:** `$export-database backup-1`\n**Info:** File JSON akan dikirim ke DM Anda');
                return;
            }

            const databaseName = args[0];

            try {
                const processingMsg = await message.channel.send('📤 **Mengekspor database ke JSON...**');

                const configData = await db.get(`database_backup.${databaseName}`);

                if (!configData) {
                    await processingMsg.delete().catch(() => {});
                    await sendAutoDeleteMessage(message.channel, `❌ Database backup \`${databaseName}\` tidak ditemukan! Gunakan \`$list-database\` untuk melihat daftar yang tersedia.`);
                    return;
                }

                // Create JSON file
                const jsonContent = JSON.stringify(configData, null, 2);
                const buffer = Buffer.from(jsonContent, 'utf-8');
                const filename = `${databaseName}_${Date.now()}.json`;

                // Send to user DM
                const dmChannel = await message.author.createDM();

                const embed = new EmbedBuilder()
                    .setTitle('📤 Database Export Success!')
                    .setDescription(`**Database Name:** \`${databaseName}\`\n**Server:** ${configData.serverName}\n**Export Date:** <t:${Math.floor(Date.now() / 1000)}:F>\n**File Size:** ${(buffer.length / 1024).toFixed(2)} KB\n\n**📋 Total Configs:** ${Object.values(configData.configs).reduce((count, config) => {
                        if (Array.isArray(config)) return count + config.length;
                        if (typeof config === 'object' && config !== null) return count + Object.keys(config).length;
                        return count;
                    }, 0)} items\n\n✅ **Simpan file ini untuk import nanti menggunakan** \`$import-database\``)
                    .setColor('#00ff00')
                    .setTimestamp();

                await dmChannel.send({
                    embeds: [embed],
                    files: [{
                        attachment: buffer,
                        name: filename
                    }]
                });

                await processingMsg.delete().catch(() => {});
                await sendAutoDeleteMessage(message.channel, `✅ **Database berhasil diekspor!**\n**File:** \`${filename}\` telah dikirim ke DM Anda.\n**Size:** ${(buffer.length / 1024).toFixed(2)} KB`, 10000);

            } catch (error) {
                console.error('Export database error:', error);

                let errorMessage = '❌ **Gagal mengekspor database!**\n\n';
                if (error.code === 50007) {
                    errorMessage += '**Error:** Tidak dapat mengirim DM ke Anda.\n**Solusi:** Pastikan DM dari server members diaktifkan di Privacy Settings Discord Anda.';
                } else {
                    errorMessage += `**Error:** ${error.message}`;
                }

                await sendAutoDeleteMessage(message.channel, errorMessage);
            }
        }

        // Import database from JSON file command
        else if (actualCommand === 'import-database') {
            const isStaffUser = await isStaff(message.member);
            if (!isStaffUser) {
                await sendAutoDeleteMessage(message.channel, '❌ Hanya staff (Administrator atau Owner) yang dapat menggunakan command ini!');
                return;
            }

            if (message.attachments.size === 0) {
                await sendAutoDeleteMessage(message.channel, '**Format:** `$import-database` + **upload file JSON**\n**Example:** Ketik `$import-database` lalu attach file JSON yang sudah di-export\n**Info:** Semua konfigurasi dalam JSON akan digabungkan dengan database saat ini', 15000);
                return;
            }

            const attachment = message.attachments.first();

            if (!attachment.name.endsWith('.json')) {
                await sendAutoDeleteMessage(message.channel, '❌ **File harus berformat JSON!** Upload file dengan ekstensi `.json`');
                return;
            }

            try {
                const processingMsg = await message.channel.send('📥 **Mengimpor database dari JSON...**');

                // Download JSON file
                const response = await axios.get(attachment.url);
                const configData = response.data;

                // Validate JSON structure
                if (!configData.configs || typeof configData.configs !== 'object') {
                    await processingMsg.delete().catch(() => {});
                    await sendAutoDeleteMessage(message.channel, '❌ **Format JSON tidak valid!** File harus berisi struktur database yang benar.');
                    return;
                }

                let importedCount = 0;
                const importedItems = [];

                // Import configurations
                const configMappings = [
                    { key: 'owners', target: `owners.${message.guild.id}`, name: 'Owners' },
                    { key: 'embed_colors', target: 'embed_colors', name: 'Embed Colors' },
                    { key: 'keylogger_channels', target: 'keylogger_channels', name: 'Keylogger Channels' },
                    { key: 'top4top_channels', target: 'top4top_channels', name: 'Top4Top Channels' },
                    { key: 'invisible_configs', target: 'invisible_configs', name: 'Invisible Configs' },
                    { key: 'market_categories', target: 'market_categories', name: 'Market Categories' },
                    { key: 'auto_thread_channels', target: 'auto_thread_channels', name: 'Auto Thread Channels' },
                    { key: 'daily_configs', target: 'daily_configs', name: 'Daily Configs' },
                    { key: 'verify_configs', target: 'verify_configs', name: 'Verify Configs' },
                    { key: 'midman_configs', target: 'midman_configs', name: 'Midman Configs' },
                    { key: 'anti_link_configs', target: 'anti_link_configs', name: 'Anti-Link Configs' }, // Added Anti-Link Configs
                    { key: 'ticket_config', target: `ticket_config.${message.guild.id}`, name: 'Ticket Config' },
                    { key: 'midman_config', target: `midman_config.${message.guild.id}`, name: 'Midman Config' },
                    { key: 'verify_config', target: `verify_config.${message.guild.id}`, name: 'Verify Config' },
                    { key: 'testimoni_channel', target: `testimoni_channel.${message.guild.id}`, name: 'Testimoni Channel' },
                    { key: 'testimoni_data', target: `testimoni_data.${message.guild.id}`, name: 'Testimoni Data' }
                ];

                // Merge with existing data
                for (const mapping of configMappings) {
                    const importData = configData.configs[mapping.key];
                    if (importData !== null && importData !== undefined) {
                        // Get existing data
                        const existingData = await db.get(mapping.target);

                        if (Array.isArray(importData)) {
                            // Merge arrays (avoid duplicates)
                            const merged = existingData && Array.isArray(existingData)
                                ? [...new Set([...existingData, ...importData])]
                                : importData;

                            if (merged.length > 0) {
                                await db.set(mapping.target, merged);
                                importedItems.push(`✅ ${mapping.name} (${importData.length} items merged)`);
                                importedCount++;
                            }
                        } else if (typeof importData === 'object' && importData !== null) {
                            // Merge objects
                            const merged = existingData && typeof existingData === 'object'
                                ? { ...existingData, ...importData }
                                : importData;

                            if (Object.keys(merged).length > 0) {
                                await db.set(mapping.target, merged);
                                importedItems.push(`✅ ${mapping.name} (${Object.keys(importData).length} items merged)`);
                                importedCount++;
                            }
                        } else {
                            // Simple value
                            await db.set(mapping.target, importData);
                            importedItems.push(`✅ ${mapping.name}`);
                            importedCount++;
                        }
                    }
                }

                await processingMsg.delete().catch(() => {});

                const embed = new EmbedBuilder()
                    .setTitle('📥 Database Import Success!')
                    .setDescription(`**Original Server:** ${configData.serverName || 'Unknown'}\n**Imported Date:** <t:${Math.floor(Date.now() / 1000)}:F>\n**File:** \`${attachment.name}\`\n\n**📊 Import Statistics:**\n• **Total Imported:** ${importedCount} configurations\n• **Merge Mode:** Data digabungkan dengan existing configs\n\n**🔄 Configurations Imported:**\n${importedItems.slice(0, 10).join('\n')}${importedItems.length > 10 ? `\n... dan ${importedItems.length - 10} lainnya` : ''}\n\n✅ **Database berhasil diimport dan digabungkan!**`)
                    .setColor('#00ff00')
                    .setFooter({ text: `${importedCount} configs imported and merged` })
                    .setTimestamp();

                await sendAutoDeleteMessage(message.channel, { embeds: [embed] }, 20000);

            } catch (error) {
                console.error('Import database error:', error);

                let errorMessage = '❌ **Gagal mengimport database!**\n\n';
                if (error.message.includes('JSON')) {
                    errorMessage += '**Error:** File JSON corrupt atau tidak valid.\n**Solusi:** Pastikan file adalah hasil export dari `$export-database`';
                } else {
                    errorMessage += `**Error:** ${error.message}\n**Solusi:** Coba export ulang database atau hubungi developer`;
                }

                await sendAutoDeleteMessage(message.channel, errorMessage);
            }
        }

        // Delete database command
        else if (actualCommand === 'delete-database') {
            const isStaffUser = await isStaff(message.member);
            if (!isStaffUser) {
                await sendAutoDeleteMessage(message.channel, '❌ Hanya staff (Administrator atau Owner) yang dapat menggunakan command ini!');
                return;
            }

            if (args.length < 1) {
                await sendAutoDeleteMessage(message.channel, '**Format:** `$delete-database <nama-database>`\n**Example:** `$delete-database backup-1`\n**Tip:** Gunakan `$list-database` untuk melihat daftar database');
                return;
            }

            const databaseName = args[0];

            try {
                const configData = await db.get(`database_backup.${databaseName}`);

                if (!configData) {
                    await sendAutoDeleteMessage(message.channel, `❌ Database backup \`${databaseName}\` tidak ditemukan! Gunakan \`$list-database\` untuk melihat daftar yang tersedia.`);
                    return;
                }

                // Delete the backup
                await db.delete(`database_backup.${databaseName}`);

                const embed = new EmbedBuilder()
                    .setTitle('🗑️ Database Deleted Successfully!')
                    .setDescription(`**Database Name:** \`${databaseName}\`\n**Original Server:** ${configData.serverName}\n**Backup Date:** <t:${Math.floor(new Date(configData.timestamp).getTime() / 1000)}:F>\n\n✅ **Database backup berhasil dihapus!**`)
                    .setColor('#ff0000')
                    .setTimestamp();

                await sendAutoDeleteMessage(message.channel, { embeds: [embed] }, 10000);

            } catch (error) {
                console.error('Delete database error:', error);
                await sendAutoDeleteMessage(message.channel, '❌ Gagal menghapus database backup!');
            }
        }

        // Set auto-load database command
        else if (actualCommand === 'set-auto-load') {
            const isStaffUser = await isStaff(message.member);
            if (!isStaffUser) {
                await sendAutoDeleteMessage(message.channel, '❌ Hanya staff (Administrator atau Owner) yang dapat menggunakan command ini!');
                return;
            }

            if (args.length < 1) {
                await sendAutoDeleteMessage(message.channel, '**Format:** `$set-auto-load <database-name>` atau `$set-auto-load off`\n**Example:** `$set-auto-load backup-1`\n**Tip:** Database akan auto-load saat bot restart');
                return;
            }

            const databaseName = args[0];

            if (databaseName.toLowerCase() === 'off') {
                await db.delete('auto_load_database');
                await sendAutoDeleteMessage(message.channel, '✅ **Auto-load database dimatikan!** Bot tidak akan auto-load database saat restart.');
                return;
            }

            // Check if database exists
            const configData = await db.get(`database_backup.${databaseName}`);
            if (!configData) {
                await sendAutoDeleteMessage(message.channel, `❌ Database backup \`${databaseName}\` tidak ditemukan! Gunakan \`$list-database\` untuk melihat daftar yang tersedia.`);
                return;
            }

            await db.set('auto_load_database', {
                enabled: true,
                databaseName: databaseName,
                setBy: message.author.id,
                setAt: new Date().toISOString()
            });

            await sendAutoDeleteMessage(message.channel, `✅ **Auto-load database berhasil diatur!**\n\n**Database:** \`${databaseName}\`\n**Status:** Aktif\n**Info:** Bot akan otomatis memuat database ini saat restart\n\n**Matikan dengan:** \`$set-auto-load off\``);
        }

        // Check auto-load status command
        else if (actualCommand === 'auto-load-status') {
            const isStaffUser = await isStaff(message.member);
            if (!isStaffUser) {
                await sendAutoDeleteMessage(message.channel, '❌ Hanya staff (Administrator atau Owner) yang dapat menggunakan command ini!');
                return;
            }

            const autoLoadConfig = await db.get('auto_load_database');

            if (!autoLoadConfig || !autoLoadConfig.enabled) {
                await sendAutoDeleteMessage(message.channel, '📋 **Auto-load Database Status: DISABLED**\n\n**Info:** Bot tidak akan auto-load database saat restart\n**Aktifkan dengan:** `$set-auto-load <database-name>`');
                return;
            }

            const setByUser = await client.users.fetch(autoLoadConfig.setBy).catch(() => null);
            const setByName = setByUser ? setByUser.username : 'Unknown';

            await sendAutoDeleteMessage(message.channel, `📋 **Auto-load Database Status: ENABLED**\n\n**Database:** \`${autoLoadConfig.databaseName}\`\n**Set by:** ${setByName}\n**Set at:** <t:${Math.floor(new Date(autoLoadConfig.setAt).getTime() / 1000)}:F>\n\n**Matikan dengan:** \`$set-auto-load off\``, 10000);
        }

        else {
            await sendAutoDeleteMessage(message.channel, `❌ Command tidak dikenal! Ketik \`${PREFIX}help\` atau \`${PREFIX}h\` untuk melihat daftar command.`);
        }

    } catch (error) {
        console.error(error);
        await sendAutoDeleteMessage(message.channel, '❌ Terjadi error saat menjalankan command!');
    }
});

// Enhanced button interactions with auto-delete and select menu
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

    try {
        // Help navigation
        if (interaction.customId === 'help_prev' || interaction.customId === 'help_next') {
            const helpData = await db.get(`help_${interaction.message.id}`);
            if (!helpData || helpData.userId !== interaction.user.id) {
                const reply = await interaction.reply({ content: '❌ This help menu is not for you!', ephemeral: true });
                setTimeout(async () => {
                    try {
                        await interaction.deleteReply();
                    } catch (error) {
                        console.error('Error deleting interaction reply:', error);
                    }
                }, 5000);
                return;
            }

            if (interaction.customId === 'help_prev') {
                helpData.currentPage = Math.max(0, helpData.currentPage - 1);
            } else {
                helpData.currentPage = Math.min(helpData.pages.length - 1, helpData.currentPage + 1);
            }

            const currentPage = helpData.pages[helpData.currentPage];
            const embed = new EmbedBuilder()
                .setTitle(currentPage.title)
                .setDescription(currentPage.description)
                .addFields(currentPage.fields)
                .setColor(0x0099ff)
                .setFooter({ text: 'Use buttons to navigate pages' })
                .setTimestamp();

            const prevButton = new ButtonBuilder()
                .setCustomId('help_prev')
                .setLabel('◀️ Previous')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(helpData.currentPage === 0);

            const nextButton = new ButtonBuilder()
                .setCustomId('help_next')
                .setLabel('Next ▶️')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage === pages.length - 1);

            const row = new ActionRowBuilder().addComponents(prevButton, nextButton);

            await interaction.update({ embeds: [embed], components: [row] });
            await db.set(`help_${interaction.message.id}`, helpData);
        }

        // Delete invisible listing - STAFF ONLY untuk delete listing orang lain
        else if (interaction.customId.startsWith('delete_invisible_')) {
            const invisibleId = interaction.customId.split('_')[2];
            const invisibleData = await db.get(`invisible_messages.${invisibleId}`);

            if (!invisibleData) {
                const reply = await interaction.reply({ content: '❌ Listing not found or expired!', ephemeral: true });
                setTimeout(async () => {
                    try {
                        await interaction.deleteReply();
                    } catch (error) {
                        console.error('Error deleting interaction reply:', error);
                    }
                }, 5000);
                return;
            }

            // Enhanced staff check - Hanya pemilik listing atau staff yang bisa menghapus
            const isStaffUser = await isStaff(interaction.member);
            const isListingOwner = invisibleData.userId === interaction.user.id;

            if (!isListingOwner && !isStaffUser) {
                const reply = await interaction.reply({ content: '❌ **Akses ditolak!** Hanya staff (Administrator/Owner) yang dapat menghapus listing orang lain!', ephemeral: true });
                setTimeout(async () => {
                    try {
                        await interaction.deleteReply();
                    } catch (error) {
                        console.error('Error deleting interaction reply:', error);
                    }
                }, 5000);
                return;
            }

            try {
                // Delete from database
                await db.delete(`invisible_messages.${invisibleId}`);
                invisibleMessages.delete(invisibleId);

                // Delete the message
                await interaction.message.delete();

                const deletedBy = isListingOwner ? 'pemilik listing' : 'staff';
                const reply = await interaction.reply({ content: `🗑️ **Listing berhasil dihapus oleh ${deletedBy}!** \n\n**Listing ID:** \`${invisibleId}\`\n**Type:** ${invisibleData.type.toUpperCase()}\n**Content:** ${invisibleData.content}`, ephemeral: true });
                setTimeout(async () => {
                    try {
                        await interaction.deleteReply();
                    } catch (error) {
                        console.error('Error deleting interaction reply:', error);
                    }
                }, 5000);

            } catch (error) {
                console.error('Delete listing error:', error);
                const reply = await interaction.reply({ content: '❌ Gagal menghapus listing! Silakan coba lagi.', ephemeral: true });
                setTimeout(async () => {
                    try {
                        await interaction.deleteReply();
                    } catch (error) {
                        console.error('Error deleting interaction reply:', error);
                    }
                }, 5000);
            }
        }

        // Enhanced invisible market contact with SELECT MENU - No 24 hour message
        else if (interaction.customId.startsWith('contact_invisible_')) {
            const invisibleId = interaction.customId.split('_')[2];
            const invisibleData = await db.get(`invisible_messages.${invisibleId}`);

            if (!invisibleData) {
                const reply = await interaction.reply({ content: '❌ Listing not found or expired!', ephemeral: true });
                setTimeout(async () => {
                    try {
                        await interaction.deleteReply();
                    } catch (error) {
                        console.error('Error deleting interaction reply:', error);
                    }
                }, 5000);
                return;
            }

            // Create SELECT MENU for contact options
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId(`contact_menu_${invisibleId}`)
                .setPlaceholder('Pilih Menu')
                .addOptions([
                    {
                        label: 'Selesaikan Orderan',
                        description: 'Untuk menyelesaikan tiket orderan',
                        value: 'complete_order',
                        emoji: '✅'
                    },
                    {
                        label: 'Delete Order',
                        description: 'Hapus orderan dan channel ini',
                        value: 'delete_order',
                        emoji: '🗑️'
                    },
                    {
                        label: 'Informasi Orderan',
                        description: 'Lihat detail informasi orderan ini',
                        value: 'order_info',
                        emoji: '📋'
                    }
                ]);

            const row = new ActionRowBuilder().addComponents(selectMenu);

            await interaction.deferReply({ ephemeral: true });

            try {
                // Get market categories
                const marketCategories = await db.get('market_categories') || {};
                const categoryId = marketCategories[invisibleData.type];

                let category = null;
                if (categoryId) {
                    category = client.channels.cache.get(categoryId);
                }

                // Create default category if not found
                if (!category) {
                    const guild = interaction.guild;
                    const categoryName = invisibleData.type === 'sell' ? '📱 SELL CONTACTS' : '🔍 FIND CONTACTS';

                    category = await guild.channels.create({
                        name: categoryName,
                        type: ChannelType.GuildCategory,
                        permissionOverwrites: [
                            {
                                id: guild.roles.everyone.id,
                                deny: [PermissionFlagsBits.ViewChannel]
                            }
                        ]
                    });
                }

                // Create private contact channel
                const channelName = `${invisibleData.type}-${invisibleId.toLowerCase()}`;
                const contactChannel = await interaction.guild.channels.create({
                    name: channelName,
                    type: ChannelType.GuildText,
                    parent: category.id,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.roles.everyone.id,
                            deny: [PermissionFlagsBits.ViewChannel]
                        },
                        {
                            id: interaction.user.id,
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                        },
                        {
                            id: invisibleData.userId,
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                        }
                    ]
                });

                // Send detailed contact info with select menu and dark theme
                const seller = await client.users.fetch(invisibleData.userId);
                const contactEmbed = new EmbedBuilder()
                    .setTitle(`🎫 Tiket telah dibuat`)
                    .setDescription(`**📧 Pesanan:**\n${invisibleData.content}\n\n\n**📞 @${invisibleData.username} jangan lupa menggunakan jasa midman, untuk menghindari penipuan.**`)
                    .setColor('#1a1a1a') // DARK THEME
                    .setTimestamp();

                await contactChannel.send({
                    content: `<@${invisibleData.userId}> <@${interaction.user.id}>`,
                    embeds: [contactEmbed],
                    components: [row]
                });

                // Add 5 second delay before responding
                await delay(5000);

                const reply = await interaction.editReply({
                    content: `Channel kontak berhasil dibuat: ${contactChannel}\n\n**Detail:**\n• Listing: ${invisibleData.content}\n• Type: ${invisibleData.type.toUpperCase()}\n• Server: ${invisibleData.serverName}`
                });

                setTimeout(async () => {
                    try {
                        await interaction.deleteReply();
                    } catch (error) {
                        console.error('Error deleting interaction reply:', error);
                    }
                }, 5000);

            } catch (error) {
                console.error('Contact channel creation error:', error);
                const reply = await interaction.editReply({ content: '❌ Failed to create contact channel! Please try again later.' });
                setTimeout(async () => {
                    try {
                        await interaction.deleteReply();
                    } catch (error) {
                        console.error('Error deleting interaction reply:', error);
                    }
                }, 5000);
            }
        }

        // Handle SELECT MENU interactions
        else if (interaction.customId.startsWith('contact_menu_')) {
            const invisibleId = interaction.customId.split('_')[2];
            const selectedValue = interaction.values[0];

            await interaction.deferReply({ ephemeral: false });

            if (selectedValue === 'complete_order') {
                const embed = new EmbedBuilder()
                    .setTitle('✅ Deal Completed Successfully!')
                    .setDescription(`🎉 **Deal marked as complete by** <@${interaction.user.id}>\n\n🕒 **Channel will be archived in 5 minutes.**`)
                    .setColor('#00ff00')
                    .setTimestamp();

                const reply = await interaction.editReply({ embeds: [embed] });

                setTimeout(async () => {
                    try {
                        await interaction.deleteReply();
                    } catch (error) {
                        console.error('Error deleting interaction reply:', error);
                    }
                }, 5000);

                setTimeout(async () => {
                    try {
                        await interaction.channel.delete();
                    } catch (error) {
                        console.error('Channel deletion error:', error);
                    }
                }, 300000);

            } else if (selectedValue === 'delete_order') {
                const embed = new EmbedBuilder()
                    .setTitle('🗑️ Order Deleted')
                    .setDescription(`❌ **Order has been deleted by** <@${interaction.user.id}>\n\n🕒 **Channel will be deleted in 10 seconds.**`)
                    .setColor('#ff0000')
                    .setTimestamp();

                const reply = await interaction.editReply({ embeds: [embed] });

                setTimeout(async () => {
                    try {
                        await interaction.deleteReply();
                    } catch (error) {
                        console.error('Error deleting interaction reply:', error);
                    }
                }, 5000);

                // Delete the channel after 10 seconds
                setTimeout(async () => {
                    try {
                        await interaction.channel.delete();
                    } catch (error) {
                        console.error('Channel deletion error:', error);
                    }
                }, 10000);

            } else if (selectedValue === 'order_info') {
                const orderData = await db.get(`invisible_messages.${invisibleId}`);
                if (orderData) {
                    const infoEmbed = new EmbedBuilder()
                        .setTitle('📋 Order Information')
                        .setDescription(`**📦 Order ID:** ${invisibleId}\n**🔖 Type:** ${orderData.type.toUpperCase()}\n**💬 Content:** ${orderData.content}\n**📅 Posted:** <t:${Math.floor(orderData.timestamp / 1000)}:F>\n**🏠 Server:** ${orderData.serverName}`)
                        .setColor('#1a1a1a')
                        .setTimestamp();

                    const reply = await interaction.editReply({ embeds: [infoEmbed] });

                    setTimeout(async () => {
                        try {
                            await interaction.deleteReply();
                        } catch (error) {
                            console.error('Error deleting interaction reply:', error);
                        }
                    }, 5000);
                } else {
                    const reply = await interaction.editReply({ content: '❌ Order information not found!' });
                    setTimeout(async () => {
                        try {
                            await interaction.deleteReply();
                        } catch (error) {
                            console.error('Error deleting interaction reply:', error);
                        }
                    }, 5000);
                }
            }
        }

        // Verify user system
        else if (interaction.customId.startsWith('verify_user_')) {
            const roleId = interaction.customId.split('_')[2];
            const role = interaction.guild.roles.cache.get(roleId);

            if (!role) {
                await interaction.deferUpdate();
                return;
            }

            const member = interaction.member;

            // Check if already verified - jika sudah punya role, tidak kirim apapun
            if (member.roles.cache.has(roleId)) {
                await interaction.deferUpdate();
                return;
            }

            try {
                // Use deferUpdate to prevent double interaction
                await interaction.deferUpdate();

                // Add role to user
                await member.roles.add(role);

                // Only send success embed to channel (no reply)
                const colorHex = await db.get(`embed_colors.verify`) || '#007FFF';
                const color = hexToDiscordColor(colorHex) || 0x007FFF;

                const successEmbed = new EmbedBuilder()
                    .setTitle('✅ Member Verified Successfully!')
                    .setDescription(`${member} has been successfully verified!`)
                    .setColor(color)
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .setTimestamp();

                // Send embed to channel and auto delete after 10 seconds
                const successMessage = await interaction.channel.send({ embeds: [successEmbed] });

                setTimeout(async () => {
                    try {
                        await successMessage.delete();
                    } catch (error) {
                        console.error('Error deleting success message:', error);
                    }
                }, 10000);

            } catch (error) {
                console.error('Verify error:', error);
                // Send error message to channel if verification fails
                const errorMessage = await interaction.channel.send('❌ **Terjadi kesalahan saat verifikasi!** Silakan hubungi staff.');

                setTimeout(async () => {
                    try {
                        await errorMessage.delete();
                    } catch (error) {
                        console.error('Error deleting error message:', error);
                    }
                }, 10000);
            }
        }

        // Professional Middleman Ticket Creation
        else if (interaction.customId === 'create_midman_ticket') {
            const config = await db.get(`midman_config.${interaction.guild.id}`);
            if (!config) {
                const reply = await interaction.reply({ content: 'Sistem middleman belum dikonfigurasi!', ephemeral: true });
                setTimeout(async () => {
                    try {
                        await interaction.deleteReply();
                    } catch (error) {
                        console.error('Error deleting interaction reply:', error);
                    }
                }, 5000);
                return;
            }

            const category = client.channels.cache.get(config.categoryId);

            // Generate unique ticket ID
            const ticketId = Math.floor(Math.random() * 9000) + 1000;

            const ticketChannel = await interaction.guild.channels.create({
                name: `ticket-${ticketId}`,
                type: ChannelType.GuildText,
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: interaction.user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
                    }
                ]
            });

            const colorHex = await db.get(`embed_colors.midman`) || '#00A8E8';
            const color = hexToDiscordColor(colorHex) || 0x00A8E8;

            const formText = `**Halo <@${interaction.user.id}>! Selamat datang di ticket midman.**

**Silakan isi form dibawah ini:**

\`\`\`
Penjual :
Discord :
Username/Nick :
Pembeli :
Discord :
Username/Nick :
Detail pesanan :
Harga :
Metode Payment :
Nominal yang harus dibayar :
\`\`\`

**Note:** Harap tunggu staff untuk memverifikasi ticket anda!`;

            const closeButton = new ButtonBuilder()
                .setCustomId('close_midman_ticket')
                .setLabel('❌ Close')
                .setStyle(ButtonStyle.Danger);

            const claimButton = new ButtonBuilder()
                .setCustomId('claim_midman_ticket')
                .setLabel('✅ Claim')
                .setStyle(ButtonStyle.Success);

            const row = new ActionRowBuilder().addComponents(claimButton, closeButton);

            const embed = new EmbedBuilder()
                .setTitle(`🎫 Ticket #${ticketId}`)
                .setDescription(formText)
                .setColor(color)
                .setFooter({ text: `Ticket ID: ${ticketId} • Middleman Service` })
                .setTimestamp();

            // Store ticket data
            await db.set(`midman_ticket.${ticketChannel.id}`, {
                ticketId,
                userId: interaction.user.id,
                claimedBy: null,
                status: 'open',
                createdAt: Date.now()
            });

            await ticketChannel.send({
                content: `<@${interaction.user.id}>`,
                embeds: [embed],
                components: [row]
            });

            const reply = await interaction.reply({ content: `🎫 **Ticket #${ticketId} berhasil dibuat!**\n**Channel:** ${ticketChannel}\n\nSilakan isi form yang tersedia di channel tersebut.`, ephemeral: true });

            setTimeout(async () => {
                try {
                    await interaction.deleteReply();
                } catch (error) {
                    console.error('Error deleting interaction reply:', error);
                }
            }, 10000);
        }

        // Middleman info button
        else if (interaction.customId === 'midman_info') {
            const infoEmbed = new EmbedBuilder()
                .setTitle('📋 TERMS & CONDITIONS - MIDDLEMAN SERVICE')
                .setDescription(`**🔰 SYARAT & KETENTUAN**

**1. KELAYAKAN TRANSAKSI**
• Minimal transaksi Rp 50,000
• Maksimal transaksi Rp 50,000,000
• Kedua pihak wajib berusia 17+ tahun
• Wajib memiliki rekening/e-wallet legal

**2. BIAYA LAYANAN**
• Fee middleman: 5% dari total harga
• Biaya transfer ditanggung masing-masing pihak
• Refund fee tidak dikembalikan jika batal karena kesalahan user

**3. PROSES TRANSAKSI**
• Escrow time: maksimal 7x24 jam
• Seller wajib kirim dalam 3x24 jam setelah pembayaran
• Buyer wajib konfirmasi dalam 2x24 jam setelah penerimaan
• Overtime otomatis release ke seller

**4. LARANGAN**
❌ Transaksi ilegal (narkoba, senjata, dll)
❌ Penipuan atau informasi palsu
❌ Harassment terhadap staff/user lain
❌ Spam atau flood di ticket

**5. FORCE MAJEURE**
• Server maintenance bisa delay proses
• Gangguan bank/e-wallet di luar tanggung jawab kami
• Emergency refund jika terjadi masalah teknis

**6. SANKSI**
• Warning → Temporary Ban → Permanent Ban
• Blacklist untuk repeat offender
• Report ke authorities jika melanggar hukum

**✅ Dengan menggunakan layanan ini, Anda menyetujui semua ketentuan di atas.**`)
                .setColor('#FF6B6B')
                .setFooter({ text: 'Terms & Conditions v2.1 • Last updated: January 2024' })
                .setTimestamp();

            const reply = await interaction.reply({ embeds: [infoEmbed], ephemeral: true });

            setTimeout(async () => {
                try {
                    await interaction.deleteReply();
                } catch (error) {
                    console.error('Error deleting interaction reply:', error);
                }
            }, 30000);
        }

        // Create ticket (legacy support)
        else if (interaction.customId === 'create_ticket') {
            const config = await db.get(`ticket_config.${interaction.guild.id}`);
            if (!config) {
                const reply = await interaction.reply({ content: 'Sistem tiket belum dikonfigurasi!', ephemeral: true });
                setTimeout(async () => {
                    try {
                        await interaction.deleteReply();
                    } catch (error) {
                        console.error('Error deleting interaction reply:', error);
                    }
                }, 5000);
                return;
            }

            const category = client.channels.cache.get(config.categoryId);
            const ticketChannel = await interaction.guild.channels.create({
                name: `ticket-${interaction.user.username}`,
                type: ChannelType.GuildText,
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: interaction.user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                    }
                ]
            });

            const closeButton = new ButtonBuilder()
                .setCustomId('close_ticket')
                .setLabel('Close Ticket')
                .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder().addComponents(closeButton);

            const formText = `🔒 **SECURE TRANSACTION INITIATED**

Halo <@${interaction.user.id}>, Anda telah membuka sesi transaksi aman dengan sistem middleman kami.

📋 **FORMULIR TRANSAKSI WAJIB**
\`\`\`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏪 INFORMASI PENJUAL
   ├─ Nama/Username: [...]
   ├─ Kontak (Discord/WA): [...]
   └─ Rating/Feedback: [...]

🛒 INFORMASI PEMBELI  
   ├─ Nama/Username: [...]
   ├─ Kontak (Discord/WA): [...]
   └─ Metode pembayaran: [...]

💼 DETAIL TRANSAKSI
   ├─ Item/Layanan: [...]
   ├─ Harga total: Rp [...]
   ├─ Fee middleman (5%): Rp [...]
   └─ Estimasi waktu: [...]

📝 SYARAT KHUSUS
   ├─ Garansi: [...]
   ├─ Catatan seller: [...]
   └─ Catatan buyer: [...]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

⚠️ **PENTING:** 
• Isi formulir dengan lengkap dan jujur
• Fee middleman 5% dari total transaksi
• Proses verification membutuhkan 5-15 menit
• Kedua pihak wajib konfirmasi sebelum transaksi

🛡️ **PROTEKSI MIDDLEMAN:**
✅ Uang aman sampai barang/layanan diterima
✅ Dispute resolution 24/7
✅ Refund guarantee jika seller scam
✅ Bukti transaksi digital tersimpan

**Silakan lengkapi formulir di atas untuk melanjutkan proses.**`;

            const ticketReply = await ticketChannel.send({
                content: formText,
                components: [row]
            });

            const reply = await interaction.reply({ content: `Tiket berhasil dibuat: ${ticketChannel}`, ephemeral: true });

            // Auto-delete after 5 seconds
            setTimeout(async () => {
                try {
                    await interaction.deleteReply();
                } catch (error) {
                    console.error('Error deleting interaction reply:', error);
                }
            }, 5000);
        }

        // Claim midman ticket (staff only)
        else if (interaction.customId === 'claim_midman_ticket') {
            const isStaffUser = await isStaff(interaction.member);
            if (!isStaffUser) {
                const reply = await interaction.reply({ content: '❌ Hanya staff yang dapat claim ticket!', ephemeral: true });
                setTimeout(async () => {
                    try {
                        await interaction.deleteReply();
                    } catch (error) {
                        console.error('Error deleting interaction reply:', error);
                    }
                }, 5000);
                return;
            }

            const ticketData = await db.get(`midman_ticket.${interaction.channel.id}`);
            if (!ticketData) {
                const reply = await interaction.reply({ content: '❌ Data ticket tidak ditemukan!', ephemeral: true });
                setTimeout(async () => {
                    try {
                        await interaction.deleteReply();
                    } catch (error) {
                        console.error('Error deleting interaction reply:', error);
                    }
                }, 5000);
                return;
            }

            if (ticketData.claimedBy) {
                const claimedUser = await client.users.fetch(ticketData.claimedBy);
                const reply = await interaction.reply({ content: `❌ Ticket sudah di-claim oleh **${claimedUser.username}**!`, ephemeral: true });
                setTimeout(async () => {
                    try {
                        await interaction.deleteReply();
                    } catch (error) {
                        console.error('Error deleting interaction reply:', error);
                    }
                }, 5000);
                return;
            }

            // Add staff to channel permissions
            await interaction.channel.permissionOverwrites.create(interaction.user, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true
            });

            // Update ticket data
            ticketData.claimedBy = interaction.user.id;
            ticketData.status = 'claimed';
            await db.set(`midman_ticket.${interaction.channel.id}`, ticketData);

            const colorHex = await db.get(`embed_colors.midman`) || '#00A8E8';
            const color = hexToDiscordColor(colorHex) || 0x00A8E8;

            const claimedEmbed = new EmbedBuilder()
                .setTitle('✅ Ticket Di-Claim!')
                .setDescription(`**Staff ${interaction.user} telah mengambil ticket ini.**\n\nStaff akan segera membantu proses transaksi Anda.`)
                .setColor(color)
                .setTimestamp();

            const closeButton = new ButtonBuilder()
                .setCustomId('close_midman_ticket')
                .setLabel('❌ Close Ticket')
                .setStyle(ButtonStyle.Danger);

            const addUserButton = new ButtonBuilder()
                .setCustomId('add_user_ticket')
                .setLabel('👤 Add User')
                .setStyle(ButtonStyle.Secondary);

            const row = new ActionRowBuilder().addComponents(addUserButton, closeButton);

            await interaction.update({
                embeds: [claimedEmbed],
                components: [row]
            });
        }

        // Close midman ticket
        else if (interaction.customId === 'close_midman_ticket') {
            if (!interaction.channel.name.startsWith('ticket-')) {
                const reply = await interaction.reply({ content: 'Command ini hanya bisa digunakan di channel tiket!', ephemeral: true });
                setTimeout(async () => {
                    try {
                        await interaction.deleteReply();
                    } catch (error) {
                        console.error('Error deleting interaction reply:', error);
                    }
                }, 5000);
                return;
            }

            const ticketData = await db.get(`midman_ticket.${interaction.channel.id}`);
            const isStaffUser = await isStaff(interaction.member);
            const isTicketOwner = ticketData && ticketData.userId === interaction.user.id;

            if (!isStaffUser && !isTicketOwner) {
                const reply = await interaction.reply({ content: '❌ Hanya staff atau pemilik ticket yang dapat menutup ticket!', ephemeral: true });
                setTimeout(async () => {
                    try {
                        await interaction.deleteReply();
                    } catch (error) {
                        console.error('Error deleting interaction reply:', error);
                    }
                }, 5000);
                return;
            }

            const reply = await interaction.reply({ content: '🔒 Ticket akan ditutup dalam 10 detik...' });

            // Delete ticket data
            if (ticketData) {
                await db.delete(`midman_ticket.${interaction.channel.id}`);
            }

            setTimeout(() => {
                reply.delete().catch(() => {});
            }, 5000);

            setTimeout(() => {
                interaction.channel.delete().catch(() => {});
            }, 10000);
        }

        // Add user to ticket
        else if (interaction.customId === 'add_user_ticket') {
            const isStaffUser = await isStaff(interaction.member);
            if (!isStaffUser) {
                const reply = await interaction.reply({ content: '❌ Hanya staff yang dapat menambahkan user!', ephemeral: true });
                setTimeout(async () => {
                    try {
                        await interaction.deleteReply();
                    } catch (error) {
                        console.error('Error deleting interaction reply:', error);
                    }
                }, 5000);
                return;
            }

            const reply = await interaction.reply({
                content: '👤 **Silakan mention user yang ingin ditambahkan ke ticket ini.**\n\n**Format:** `@username` atau `user-id`\n**Example:** `@JohnDoe` atau `123456789012345678`\n\n*Anda memiliki 60 detik untuk merespons.*',
                ephemeral: true
            });

            const filter = (m) => m.author.id === interaction.user.id;
            const collector = interaction.channel.createMessageCollector({ filter, time: 60000, max: 1 });

            collector.on('collect', async (msg) => {
                const userMention = msg.content.replace(/[<@!>]/g, '');
                try {
                    const user = await client.users.fetch(userMention);
                    const member = await interaction.guild.members.fetch(user.id);

                    await interaction.channel.permissionOverwrites.create(user, {
                        ViewChannel: true,
                        SendMessages: true,
                        ReadMessageHistory: true
                    });

                    await msg.delete();
                    await interaction.editReply({ content: `✅ **${user.username}** berhasil ditambahkan ke ticket!` });

                    setTimeout(async () => {
                        try {
                            await interaction.deleteReply();
                        } catch (error) {
                            console.error('Error deleting interaction reply:', error);
                        }
                    }, 5000);

                } catch (error) {
                    await msg.delete();
                    await interaction.editReply({ content: '❌ User tidak ditemukan! Pastikan mention atau ID user benar.' });

                    setTimeout(async () => {
                        try {
                            await interaction.deleteReply();
                        } catch (error) {
                            console.error('Error deleting interaction reply:', error);
                        }
                    }, 5000);
                }
            });

            collector.on('end', async (collected) => {
                if (collected.size === 0) {
                    await interaction.editReply({ content: '⏰ Waktu habis! Silakan coba lagi.' });
                    setTimeout(async () => {
                        try {
                            await interaction.deleteReply();
                        } catch (error) {
                            console.error('Error deleting interaction reply:', error);
                        }
                    }, 5000);
                }
            });
        }

        // Legacy close ticket support
        else if (interaction.customId === 'close_ticket') {
            if (!interaction.channel.name.startsWith('ticket-')) {
                const reply = await interaction.reply({ content: 'Command ini hanya bisa digunakan di channel tiket!', ephemeral: true });
                setTimeout(async () => {
                    try {
                        await interaction.deleteReply();
                    } catch (error) {
                        console.error('Error deleting interaction reply:', error);
                    }
                }, 5000);
                return;
            }

            const reply = await interaction.reply({ content: 'Tiket akan ditutup dalam 10 detik...' });
            setTimeout(() => {
                reply.delete().catch(() => {});
            }, 5000);

            setTimeout(() => {
                interaction.channel.delete();
            }, 10000);
        }

        // Join giveaway button
        else if (interaction.customId === 'join_giveaway') {
            const giveawayData = await db.get(`giveaway.${interaction.message.id}`);
            if (!giveawayData || giveawayData.ended) {
                const reply = await interaction.reply({ content: 'Giveaway sudah berakhir!', ephemeral: true });
                setTimeout(async () => {
                    try {
                        await interaction.deleteReply();
                    } catch (error) {
                        console.error('Error deleting interaction reply:', error);
                    }
                }, 5000);
                return;
            }

            if (giveawayData.participants.includes(interaction.user.id)) {
                const reply = await interaction.reply({ content: 'Anda sudah bergabung dalam giveaway ini!', ephemeral: true });
                setTimeout(async () => {
                    try {
                        await interaction.deleteReply();
                    } catch (error) {
                        console.error('Error deleting interaction reply:', error);
                    }
                }, 5000);
                return;
            }

            giveawayData.participants.push(interaction.user.id);
            await db.set(`giveaway.${interaction.message.id}`, giveawayData);

            // Update embed
            const colorHex = await db.get(`embed_colors.giveaway`) || '#0099ff';
            const color = hexToDiscordColor(colorHex) || 0x0099ff;
            const endTime = new Date(giveawayData.endTime);
            const embed = new EmbedBuilder()
                .setTitle(giveawayData.title)
                .setDescription(`${giveawayData.text}\n\n**Ends:** <t:${Math.floor(endTime.getTime() / 1000)}:R>\n**Hosted by:** <@${giveawayData.host}>\n**Entries:** ${giveawayData.participants.length}\n**Winners:** ${giveawayData.winners}`)
                .setColor(color)
                .setTimestamp();

            await interaction.update({ embeds: [embed] });
            const followUp = await interaction.followUp({ content: 'Berhasil bergabung dalam giveaway!', ephemeral: true });

            // Auto-delete follow-up after 5 seconds
            setTimeout(async () => {
                try {
                    await interaction.deleteReply();
                } catch (error) {
                    console.error('Error deleting interaction reply:', error);
                }
            }, 5000);
        }
    } catch (error) {
        console.error(error);
        if (!interaction.replied && !interaction.deferred) {
            const reply = await interaction.reply({ content: '❌ An error occurred!', ephemeral: true });
            setTimeout(async () => {
                try {
                    await interaction.deleteReply();
                } catch (error) {
                    console.error('Error deleting interaction reply:', error);
                }
            }, 5000);
        }
    }
});

// Function untuk end giveaway
async function endGiveaway(messageId) {
    try {
        const giveawayData = await db.get(`giveaway.${messageId}`);
        if (!giveawayData || giveawayData.ended) return;

        giveawayData.ended = true;
        await db.set(`giveaway.${messageId}`, giveawayData);

        const channel = client.channels.cache.get(giveawayData.channelId);
        if (!channel) return;

        if (giveawayData.participants.length === 0) {
            await channel.send('🎉 Giveaway berakhir! Tidak ada yang berpartisipasi.');
            return;
        }

        const winners = [];
        const participantsCopy = [...giveawayData.participants];

        for (let i = 0; i < Math.min(giveawayData.winners, participantsCopy.length); i++) {
            const randomIndex = Math.floor(Math.random() * participantsCopy.length);
            winners.push(participantsCopy.splice(randomIndex, 1)[0]);
        }

        const winnersText = winners.map(id => `<@${id}>`).join(', ');
        await channel.send(`🎉 **GIVEAWAY ENDED!** ${winnersText} winner giveaway!`);

        // Update embed to show ended
        const message = await channel.messages.fetch(messageId);
        const embed = new EmbedBuilder()
            .setTitle(`${giveawayData.title} - ENDED`)
            .setDescription(`${giveawayData.text}\n\n**Winners:** ${winnersText}\n**Entries:** ${giveawayData.participants.length}`)
            .setColor(0xff0000)
            .setTimestamp();

        await message.edit({ embeds: [embed], components: [] });

    } catch (error) {
        console.error('Error ending giveaway:', error);
    }
}

client.login(TOKEN);
