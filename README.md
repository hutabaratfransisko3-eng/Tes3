
# Sinister Recruitment Bot

Discord bot multifungsi dengan sistem recruitment otomatis, keylogger checker, file uploader, dan berbagai fitur administrasi.

## 🔧 Setup Instructions

1. **Get Bot Token:**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create a new application
   - Go to "Bot" section and copy the token
   - Replace `YOUR_BOT_TOKEN_HERE` in `index.js` with your actual bot token
   - Replace `YOUR_CLIENT_ID_HERE` with your Application ID

2. **Bot Permissions:**
   - Administrator (recommended) atau individual permissions:
   - Send Messages
   - Use Slash Commands
   - Embed Links
   - Read Message History
   - Send Messages in Threads
   - Manage Channels (untuk ticket system)
   - Manage Roles (untuk take role system)

3. **Initial Setup:**
   - `/set-owner <your_user_id>` - Set yourself as owner
   - Configure channels sesuai kebutuhan

## 🚀 Features

### 🔒 Access Control System
- **Role-based permissions** - Blokir role tertentu dari command tertentu
- **Granular access** - Berikan akses khusus per command per role
- **Owner bypass** - Owner bot selalu punya akses penuh

### 🛡️ Security Features
- **Keylogger Detection** - Scan file Lua untuk deteksi keylogger otomatis
- **File Analysis** - Analisis mendalam terhadap kode berbahaya
- **Pattern Matching** - Deteksi berbagai pattern keylogger dan malware

### 📤 File Management
- **Top4Top Upload** - Upload file hingga 30MB ke Top4Top
- **Multiple formats** - Support semua format file
- **Auto cleanup** - Pembersihan file temporary otomatis

### 🎫 Administration Tools
- **Ticket System** - Sistem ticket otomatis dengan form
- **Role Management** - Take role system dengan button
- **Daily Messages** - Penjadwalan pesan harian otomatis
- **Giveaway System** - Sistem giveaway dengan timer

### 🎨 Customization
- **Custom Embeds** - Buat embed custom dengan mudah
- **Color Themes** - Atur warna embed per fitur
- **Bot Status** - Atur status dan avatar bot

## 📋 Commands Reference

### 🔒 Access Control Commands
```
$set-owner <user-id>              - Set bot owner (owner only)
$blokir-akses <role>              - Blokir role dari semua command
$add-akses <role> <command>       - Berikan akses command khusus ke role
$delete-akses <role> <cmd|all>    - Hapus akses command dari role
```

**Example:**
```
$blokir-akses @Visitor           - Blokir role Visitor dari semua command
$add-akses @Visitor up           - Berikan akses command $up ke role Visitor
$add-akses @Visitor upload       - Berikan akses command $upload ke role Visitor
$delete-akses @Visitor up        - Hapus akses command $up dari role Visitor
$delete-akses @Visitor all       - Hapus semua akses dari role Visitor
```

### ⚙️ Channel Setup
```
$set-channel <type> <channel-id>  - Set channel khusus
```

**Available Types:**
- `boombox` - Channel untuk upload file Top4Top
- `keylogger` - Channel untuk scan keylogger otomatis

### 📤 Upload Commands
```
$upload                          - Upload file ke Top4Top (dengan attachment)
$up                             - Alias untuk $upload
!up                             - Alternative upload command
```

### 🛡️ Security Commands
- **Auto Keylogger Check** - Upload file `.lua`, `.luac`, `.lua.txt`, atau `.luac.txt` di channel keylogger untuk scan otomatis
- Support obfuscated dan plain lua files
- Deteksi pattern berbahaya dan analisis mendalam

### ⏰ Daily Message System
```
$daily <channel-id> <time> <title> <text> [image-url]  - Set daily message
$daily-list                                            - Lihat semua daily configs
$daily-test [index]                                    - Test kirim daily message
$daily-clear [index]                                   - Hapus daily config
```

**Example:**
```
$daily #general 08:00 "Good Morning" "Selamat pagi semua!" https://image.jpg
$daily-test 1                    - Test daily config pertama
$daily-clear 1                   - Hapus daily config pertama
```

### 🎫 Ticket System
```
$set-ticket <channel-id> <title> <text> <category-id>  - Setup ticket system
$add-member <user>                                     - Add member ke ticket
```

### ⭐ Testimoni System
```
$set-testimoni <channel-id>                           - Set channel testimoni
$send-testi                                          - Send testimoni
$update-testi <text> <title> <image-url> <footer>    - Update testimoni data
```

### 👤 Take Role System
```
$set-take-role <channel-id> <role> <title> <text>    - Setup take role button
```

### 🎉 Giveaway System
```
$send-giveaway <channel-id> <title> <text> <duration> <winners>  - Create giveaway
$reroll <message-id>                                             - Reroll giveaway
```

**Duration Format:** `30s` (detik), `5m` (menit), `2h` (jam)

### 🧵 Thread Management
```
$auto-thread <channel-id>        - Setup auto thread creation
```

### 📝 Custom Messages
```
$send-embed <title> <text> [footer] [channel-id]    - Send custom embed
```

### 🎨 Customization
```
$set-embed-color <type> <hex-color>   - Set embed color
$list-colors                          - List available colors
$set-status <type> <text>             - Set bot status
$image-bot <url>                      - Set bot avatar
```

**Color Types:** `all`, `giveaway`, `takerole`, `daily`, `custom`, `testimoni`, `ticket`

### 🧹 Moderation
```
$clear <amount>                  - Clear messages (max 100, requires Manage Messages)
$help                           - Show all commands
```

## 🔧 Access Control System

### Cara Kerja
1. **Default Access:** Semua user memiliki akses ke semua command
2. **Block Role:** Gunakan `$blokir-akses` untuk memblokir role dari semua command
3. **Grant Specific:** Gunakan `$add-akses` untuk memberikan akses khusus ke command tertentu
4. **Owner Bypass:** Bot owner selalu memiliki akses penuh

### Best Practices
- Blokir role dengan privilege rendah (`@Visitor`, `@Guest`)
- Berikan akses spesifik sesuai kebutuhan
- Gunakan command `$help` untuk melihat semua available commands
- Test access dengan akun berbeda sebelum deployment

### Example Workflow
```bash
# 1. Set owner
$set-owner 123456789012345678

# 2. Blokir role visitor dari semua command
$blokir-akses @Visitor

# 3. Berikan akses khusus untuk upload
$add-akses @Visitor up
$add-akses @Visitor upload

# 4. Test dengan akun visitor
# User dengan role @Visitor sekarang hanya bisa menggunakan $up, $upload, dan !up
```

## 🛡️ Keylogger Detection

### Supported Files
- `.lua` - Plain Lua files
- `.luac` - Compiled Lua files  
- `.lua.txt` - Lua files dengan ekstensi .txt
- `.luac.txt` - Compiled Lua files dengan ekstensi .txt

### Detection Capabilities
- **Obfuscated Files:** Support luaobfuscator.com dan format serupa
- **Pattern Matching:** Deteksi Discord webhooks, Telegram bots, HTTP requests
- **Deep Analysis:** Analisis base64, hex encoding, string concatenation
- **Behavior Detection:** Deteksi perilaku mencurigakan dalam kode

### Usage
1. Set channel keylogger: `$set-channel keylogger #keylogger-check`
2. Upload file `.lua` di channel tersebut
3. Bot akan otomatis scan dan memberikan hasil

## 📁 File Structure
```
├── index.js           # Main bot file
├── main.py           # Lua deobfuscator
├── package.json      # Dependencies
├── json.sqlite       # Database file
├── temp/             # Temporary files (auto cleanup)
└── README.md         # Documentation
```

## 🔄 Auto Cleanup
- **Log Files:** Dibersihkan setiap 10 menit dan saat startup/shutdown
- **Temp Files:** File lebih dari 1 jam otomatis dihapus
- **Database:** Menggunakan QuickDB untuk persistent storage

## ⚠️ Notes
- Bot memerlukan Python 3.12+ untuk keylogger detection
- Upload limit: 30MB per file
- Daily messages menggunakan timezone WIB (UTC+7)
- Giveaway timer berjalan real-time
- Access control bersifat additive (role dengan privilege tinggi tetap memiliki akses)

## 🆘 Troubleshooting

### Command Tidak Berfungsi
1. Pastikan bot memiliki permission yang cukup
2. Check access control dengan `$add-akses`
3. Verify role hierarchy di Discord

### Keylogger Check Error
1. Pastikan file format didukung (.lua, .luac, .lua.txt, .luac.txt)
2. Check apakah Python module ter-install
3. File size harus < 30MB

### Upload Gagal
1. Check koneksi internet
2. Pastikan file size < 30MB
3. Verify akses command dengan `$add-akses`

---

**Created by Armaa28** | Version 2.0 | 2024
