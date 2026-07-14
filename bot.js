import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js'
import axios from 'axios'
import { ytmp3dl } from './ytmp3dl.js'
import { spotifydl } from './spotifydl.js'
import { soundclouddl } from './soundclouddl.js'
import { uploadTop4Top } from './top4top.js'

const YOUTUBE_REGEX =
  /https?:\/\/(?:(?:www|m)\.)?(?:youtube\.com\/watch\?(?:[^&\s]*&)*v=|youtu\.be\/)[\w-]{11}(?:\S*)?/gi

const SPOTIFY_REGEX =
  /https?:\/\/(?:open\.)?spotify\.com\/track\/[A-Za-z0-9]{22}(?:\?[^\s]*)?/gi

const SOUNDCLOUD_REGEX =
  /https?:\/\/(?:www\.)?(?:soundcloud\.com|snd\.sc)\/[\w\-./?%&=+#]+/gi

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
})

client.once('ready', () => {
  console.log(`✅ Bot online: ${client.user.tag}`)
  client.user.setActivity('🎵 YouTube & Spotify → Top4Top')
})

client.on('messageCreate', async (message) => {
  if (message.author.bot) return

  const content = message.content

  const ytMatches = [...(content.matchAll(YOUTUBE_REGEX) || [])].map(m => m[0])
  const spMatches = [...(content.matchAll(SPOTIFY_REGEX) || [])].map(m => m[0])
  const scMatches = [...(content.matchAll(SOUNDCLOUD_REGEX) || [])].map(m => m[0])

  const allLinks = [
    ...ytMatches.map(u => ({ url: u, type: 'youtube' })),
    ...spMatches.map(u => ({ url: u, type: 'spotify' })),
    ...scMatches.map(u => ({ url: u, type: 'soundcloud' }))
  ]

  if (allLinks.length === 0) return

  for (const { url, type } of allLinks) {
    const processingMsg = await message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0xffa500)
          .setDescription(`⏳ Memproses link **${type}**...\n\`${url}\``)
      ]
    })

    try {
      // Step 1: Download audio info
      let dlResult
      if (type === 'youtube') {
        dlResult = await ytmp3dl(url)
      } else if (type === 'spotify') {
        dlResult = await spotifydl(url)
      } else if (type === 'soundcloud') {
        dlResult = await soundclouddl(url)
      }

      const { title, link: downloadUrl, artist } = dlResult

      // Step 2: Download the audio buffer
      const response = await axios.get(downloadUrl, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
        },
        maxContentLength: Infinity,
        timeout: 120000
      })

      const buffer = Buffer.from(response.data)
      const safeTitle = (title || 'audio').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_')
      const filename = `${safeTitle}.mp3`

      // Step 3: Upload to Top4Top
      const top4topLink = await uploadTop4Top(buffer, filename)

      const sourceIcon = type === 'youtube' ? '🎬' : type === 'spotify' ? '🎵' : '🎧'
      const titleLine = artist ? `**${title}** — ${artist}` : `**${title}**`

      const embed = new EmbedBuilder()
        .setColor(0x00cc66)
        .setTitle(`${sourceIcon} Berhasil dikonversi!`)
        .addFields(
          { name: '🎶 Judul', value: titleLine, inline: false },
          { name: '📥 Link Top4Top', value: `[Klik untuk download](${top4topLink})\n\`${top4topLink}\``, inline: false }
        )
        .setFooter({ text: `Diminta oleh ${message.author.username}` })
        .setTimestamp()

      await processingMsg.edit({ embeds: [embed] })
    } catch (err) {
      console.error(`[${type}] Error:`, err.message)
      await processingMsg.edit({
        embeds: [
          new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle('❌ Gagal memproses link')
            .setDescription(`**Error:** ${err.message}\n\nPastikan link yang dikirim valid dan coba lagi.`)
            .setFooter({ text: `Link: ${url}` })
        ]
      })
    }
  }
})

const token = process.env.DISCORD_TOKEN
if (!token) {
  console.error('❌ DISCORD_TOKEN tidak ditemukan. Set environment secret DISCORD_TOKEN.')
  process.exit(1)
}

client.login(token)
