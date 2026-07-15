import axios from 'axios'

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Origin': 'https://id.ytmp3.mobi',
  'Referer': 'https://id.ytmp3.mobi/',
  'Accept': '*/*'
}

function extractVideoId(url) {
  const match = url.match(/(?:v=|\/v\/|embed\/|youtu\.be\/|\/shorts\/|^)([^#&?^\/]{11})/)
  return match ? match[1] : null
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

export async function ytmp3dl(url) {
  if (
    !/^(https?:\/\/)?((www|m)\.)?(youtube\.com\/watch\?.*?[&?]v=|youtu\.be\/)[\w-]{11}(\S*)?$/i.test(url)
  ) {
    throw new Error('Invalid YouTube URL.')
  }

  const videoId = extractVideoId(url)
  if (!videoId) throw new Error('Gagal mengekstrak video ID dari URL.')

  // Step 1: Init
  const { data: init } = await axios.get(
    `https://a.ymcdn.org/api/v1/init?23=1llum1n471&p=y&_=${Math.random()}`,
    { headers: HEADERS }
  )
  if (init.error !== 0) throw new Error('Gagal inisialisasi konverter ytmp3.')

  await sleep(1500)

  // Step 2: Convert
  const { data: convert } = await axios.get(
    `${init.convertURL}&v=${videoId}&f=mp3&_=${Math.random()}`,
    { headers: HEADERS }
  )
  if (convert.error !== 0) throw new Error('Gagal mengkonversi video YouTube.')

  const { title, downloadURL } = convert
  if (!downloadURL) throw new Error('Download link tidak ditemukan.')

  // Step 3: Download ke buffer
  const { data } = await axios.get(downloadURL, {
    headers: HEADERS,
    responseType: 'arraybuffer',
    maxContentLength: Infinity,
    timeout: 120000
  })

  return {
    title: title || 'Unknown',
    buffer: Buffer.from(data)
  }
}
