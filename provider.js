const cheerio = require('cheerio');

// Fungsi untuk ambil senarai filem (Katalog)
async function ekstrakDataLive(url) {
    try {
        console.log("Memulakan pengambilan katalog dari: " + url);
        
        const res = await fetch(url, { 
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            signal: AbortSignal.timeout(15000) 
        });

        const html = await res.text();
        const $ = cheerio.load(html);
        const senarai = [];
        
        $('.ml-item').each((i, el) => {
            const tajuk = $(el).find('h2').text().trim() || $(el).find('.mli-info').text().trim();
            const link = $(el).find('a').attr('href');
            const poster = $(el).find('img').attr('data-original') || $(el).find('img').attr('src');
            const kualiti = $(el).find('.mli-quality').text().trim() || "HD";

            if (tajuk && link) {
                senarai.push({ tajuk, kualiti, link, poster });
            }
        });

        console.log(`Berjaya menjumpai ${senarai.length} filem.`);
        return senarai;
    } catch (e) { 
        console.error("Ralat Katalog: " + e.message);
        return []; 
    }
}

// Fungsi untuk ambil pautan video (Streaming)
async function dapatkanStreamLinks(urlHalaman) {
    try {
        const res = await fetch(urlHalaman, { 
            headers: { 'User-Agent': 'Mozilla/5.0' },
            signal: AbortSignal.timeout(10000)
        });
        const html = await res.text();
        
        // Mencari server voe, streamtape, atau dsvplay
        const regexVideo = /https?:\/\/[a-zA-Z0-9.\/-]*(voe|streamtape|dsvplay)[a-zA-Z0-9.\/=?_-]*/gi;
        const jumpa = html.match(regexVideo);
        
        return jumpa ? [...new Set(jumpa)] : [];
    } catch (e) {
        return [];
    }
}

module.exports = { ekstrakDataLive, dapatkanStreamLinks };
