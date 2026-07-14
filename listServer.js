
const axios = require('axios');

async function listServer(limit = 10) {
  const { data } = await axios.get('https://sa-mp.co.id/api/server.php', {
    params: { _: Date.now() },
    headers: {
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://sa-mp.co.id/server/',
      'Origin': 'https://sa-mp.co.id',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Dest': 'empty'
    }
  })

  return data.filter(v => v.online === 1)
    .sort((a, b) => b.onlinePlayers - a.onlinePlayers)
    .slice(0, limit)
    .map(s => ({
      name: s.hostname,
      value:
`Host          : ${s.hostname}
IP             : ${s.ipAddress}
Port           : ${s.port}
Players        : ${s.onlinePlayers}/${s.maxplayers}
Gamemode       : ${s.gamemode}
Language       : ${s.language}
Passworded     : ${s.passworded ? 'Yes' : 'No'}
Lagcomp        : ${s.lagcomp}
Mapname        : ${s.mapname}
Version        : ${s.version}
Weather        : ${s.weather}
WebURL         : ${s.weburl}
Worldtime      : ${s.worldtime}`
    }))
}

module.exports = { listServer };
