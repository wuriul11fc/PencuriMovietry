// provider.js
const cheerio = require('cheerio');

// 1. Fungsi Ambil Senarai Filem (Katalog)
async function ekstrakDataLive(url) {
    try {
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const html = await res.text();
        const $ = cheerio.load(html);
        const senarai = [];
        
        $('.ml-item').each((i, el) => {
            const tajuk = $(el).find('h2').text().trim();
            const link = $(el).find('a.ml-mask').attr('href');
            const poster = $(el).find('img.lazy').attr('data-original');
            const kualiti = $(el).find('.mli-quality').text().trim();
            if (tajuk && link) senarai.push({ tajuk, kualiti, link, poster });
        });
        return senarai;
    } catch (e) { return []; }
}

// 2. Fungsi Ambil Link Server Video (Voe / Streamtape)
async function dapatkanStreamLinks(urlHalaman) {
    try {
        const res = await fetch(urlHalaman, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const html = await res.text();
        
        const regexVideo = /https?:\/\/[a-zA-Z0-9.\/-]*(voe|streamtape|dsvplay)[a-zA-Z0-9.\/=?_-]*/gi;
        const jumpa = html.match(regexVideo);
        
        if (jumpa) {
            let senaraiUnik = [...new Set(jumpa)];
            return senaraiUnik;
        }
        return [];
    } catch (e) {
        return [];
    }
}

module.exports = { ekstrakDataLive, dapatkanStreamLinks };