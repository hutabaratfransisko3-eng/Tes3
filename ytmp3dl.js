/*
 * [ Yt Mp3 ]
 * creator : H1Dz
 * base    : -
 * channel : https://whatsapp.com/channel/0029Vb82nkLEwEjtLSQ49I44
 * support : follow my channel for more updates
 */

if (command === 'ytmp3v2') {
    if (!args[0]) {
        return message.reply(`┌˚₊ ๑│ s ʏ s ᴛ ᴇ ᴍ   ᴇ ʀ ʀ ᴏ ʀ │๑˚₊ ❌\n┇ Masukkan URL YouTube!\n│ *Contoh:* ${PREFIX}${command} https://youtu.be/dQw4w9WgXcQ\n└˚₊ ๑ ────────────── ๑˚₊\n> © ERINE-AI`);
    }

    const url = args[0];
    const apikey = 'cuki-x';
    const quality = '128'; 
    const apiUrl = `https://api.cuki.biz.id/api/downloader/ytmp3?apikey=${apikey}&url=${encodeURIComponent(url)}&quality=${quality}`;

    try {
        await message.react('⏳');
    } catch (err) {
        console.log('Gagal memberikan reaksi emoji.');
    }

    try {
        const { data } = await axios.get(apiUrl);
        
        console.log('=== RESPONSE API CUKI ===');
        console.log(JSON.stringify(data, null, 2));
        console.log('=========================');

        if (data.status !== true && data.success !== true) {
            throw new Error(data.message || 'API merespon dengan kegagalan.');
        }

        const result = data.data || data;
        const meta = result.metadata || result.meta;
        const audio = result.audio || result;

        if (!meta || !audio) {
            throw new Error('Struktur respons API berubah atau tidak sesuai. Cek terminal bot!');
        }

        const d = meta.duration || 0;
        const minutes = Math.floor(d / 60);
        const seconds = d % 60;
        const formatDuration = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('🎵 ʏ ᴛ ᴍ ᴘ 3  ᴅ ᴏ ᴡ ɴ ʟ ᴏ ᴀ ᴅ ᴇ ʀ')
            .addFields(
                { name: '📌 Judul', value: meta.title || 'Tidak diketahui', inline: false },
                { name: '⏱️ Durasi', value: formatDuration, inline: true },
                { name: '🎧 Kualitas', value: audio.label || `${quality}kbps`, inline: true }
            )
            .setFooter({ text: '© ERINE-AI' })
            .setTimestamp();

        if (meta.thumbnail) {
            embed.setThumbnail(meta.thumbnail);
        }

        const downloadUrl = audio.download?.downloadUrl || audio.downloadUrl || audio.link || audio.url;

        if (!downloadUrl) {
            throw new Error('Link unduhan audio tidak ditemukan dalam respons API.');
        }

        const audioAttachment = new AttachmentBuilder(downloadUrl, { 
            name: `${meta.title || 'audio'}.mp3` 
        });

        await message.reply({
            embeds: [embed],
            files: [audioAttachment]
        });

        await message.reactions.removeAll().catch(() => null);
        await message.react('✅').catch(() => null);

    } catch (e) {
        console.error(e);
        const errorDetail = e.response?.data?.message || e.message;

        const errorEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ s ʏ s ᴛ ᴇ ᴍ   ᴇ ʀ ʀ ᴏ ʀ')
            .setDescription(`Gagal mengunduh audio.\n\n**Detail:** ${errorDetail}`)
            .setFooter({ text: '© ERINE-AI' });

        await message.reply({ embeds: [errorEmbed] });
        
        await message.reactions.removeAll().catch(() => null);
        await message.react('❌').catch(() => null);
    }
}
