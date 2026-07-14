const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

async function mediafireDl(url) {
    try {
        const response = await axios.get(url.trim(), {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 30000
        });
        
        const html = response.data;
        const $ = cheerio.load(html);
        
        const title = $("meta[property='og:title']").attr("content")?.trim() || "Unknown";
        const sizeMatch = /Download\s*\(([\d.]+\s*[KMGT]?B)\)/i.exec(html);
        const size = sizeMatch ? sizeMatch[1] : "Unknown";
        
        let dl = $("a.popsok[href^='https://download']").attr("href")?.trim();
        if (!dl) {
            dl = $("a.popsok:not([href^='javascript'])").attr("href")?.trim();
        }
        if (!dl) {
            dl = $("#downloadButton").attr("href")?.trim();
        }
        if (!dl) {
            const downloadMatch = /href="(https:\/\/download[^"]+)"/i.exec(html);
            dl = downloadMatch ? downloadMatch[1] : null;
        }
        
        if (!dl) {
            throw new Error("Download URL not found - file mungkin sudah dihapus atau link tidak valid");
        }

        const filename = path.basename(dl.split('?')[0]);
        const ext = path.extname(filename) || null;

        return {
            status: true,
            name: title,
            filename: filename,
            type: ext,
            size: size,
            download: dl,
            source: url.trim()
        };
    } catch (error) {
        return {
            status: false,
            message: error.message || 'Unknown error'
        };
    }
}

module.exports = { mediafireDl };
