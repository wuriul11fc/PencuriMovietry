const cheerio = require('cheerio');

async function ekstrakDataLive(urlAsal) {
    try {
        console.log("Meminta bantuan Proxy untuk: " + urlAsal);
        
        // Menggunakan AllOrigins Proxy untuk memintas sekatan IP
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(urlAsal)}`;
        
        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error("Proxy Gagal");
        
        const data = await res.json();
        const html = data.contents; // AllOrigins pulangkan HTML di dalam field 'contents'
        
        const $ = cheerio.load(html);
        const senarai = [];
        
        $('.ml-item').each((i, el) => {
            const tajuk = $(el).find('h2, .mli-info').text().trim();
            const link = $(el).find('a').attr('href');
            const poster = $(el).find('img').attr('data-original') || $(el).find('img').attr('src');
            
            if (tajuk && link) {
                senarai.push({
                    tajuk: tajuk,
                    link: link,
                    poster: poster && poster.startsWith('//') ? 'https:' + poster : poster
                });
            }
        });

        console.log(`✅ Proxy berjaya tembus! Menemui ${senarai.length} filem.`);
        return senarai;
    } catch (e) { 
        console.error("Ralat Proxy: " + e.message);
        return []; 
    }
}

async function dapatkanStreamLinks(urlHalaman) {
    try {
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(urlHalaman)}`;
        const res = await fetch(proxyUrl);
        const data = await res.json();
        const html = data.contents;
        
        const regexVideo = /https?:\/\/[a-zA-Z0-9.\/-]*(voe|streamtape|dsvplay|filemoon|dood)[a-zA-Z0-9.\/=?_-]*/gi;
        const jumpa = html.match(regexVideo);
        return jumpa ? [...new Set(jumpa)] : [];
    } catch (e) { return []; }
}

module.exports = { ekstrakDataLive, dapatkanStreamLinks };
