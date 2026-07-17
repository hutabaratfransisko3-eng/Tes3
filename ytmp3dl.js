import axios from 'axios'

export async function ytmp3dl(url) {
  const { data } = await axios.get('https://api.cuki.biz.id/api/downloader/ytmp3', {
    params: { apikey: 'cuki-x', url, quality: '128' },
    timeout: 60000
  })

  if (data.success !== true)
    throw new Error(data.message || 'API cuki gagal mengembalikan hasil.')

  const meta  = data.data?.metadata
  const audio = data.data?.audio

  const downloadUrl =
    audio?.download?.downloadUrl ||
    audio?.allUrls?.[0]?.downloadUrl ||
    audio?.downloadUrl

  if (!downloadUrl) throw new Error('Link audio tidak ditemukan dalam respons API.')

  // Download ke buffer untuk dikirim ke top4top
  const { data: buf } = await axios.get(downloadUrl, {
    responseType: 'arraybuffer',
    timeout: 120000,
    maxContentLength: Infinity
  })

  return {
    title:  meta?.title  || 'Unknown',
    buffer: Buffer.from(buf)
  }
}
