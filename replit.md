# Discord Music Link Bot

Bot Discord yang mengkonversi link YouTube, Spotify, dan SoundCloud menjadi link Top4Top yang bisa didownload.

## Stack
- **Runtime:** Node.js 20 (ES Modules)
- **Library:** discord.js v14
- **Audio download:** youtubemp3.ltd, spotmate.online, downloadsound.cloud
- **Upload:** Top4Top (top4top.io)

## Cara menjalankan
1. Pastikan secret `DISCORD_TOKEN` sudah diset (Discord Developer Portal → Bot → Token)
2. Aktifkan **Message Content Intent** di Discord Developer Portal → Bot → Privileged Gateway Intents
3. Jalankan workflow **Discord Bot** → `node bot.js`

## Cara pakai bot
Kirim link YouTube, Spotify, atau SoundCloud di channel mana saja — bot otomatis mendeteksi, mendownload, mengupload ke Top4Top, dan membalas dengan link download.

**Format link yang didukung:**
- YouTube: `https://youtube.com/watch?v=...` atau `https://youtu.be/...`
- Spotify: `https://open.spotify.com/track/...`
- SoundCloud: `https://soundcloud.com/...`

## File utama
| File | Fungsi |
|------|--------|
| `bot.js` | Entry point — Discord bot utama |
| `ytmp3dl.js` | Download audio YouTube |
| `spotifydl.js` | Download track Spotify |
| `soundclouddl.js` | Download track SoundCloud |
| `top4top.js` | Upload file ke Top4Top dan ambil link |

## Environment secrets
| Key | Keterangan |
|-----|------------|
| `DISCORD_TOKEN` | Token bot dari Discord Developer Portal |

## User preferences
- Bahasa Indonesia untuk komunikasi
