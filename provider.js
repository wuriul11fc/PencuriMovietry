const cheerio = require('cheerio');

async function ekstrakDataLive(url) {
    try {
        const res = await fetch(url, { 
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://www.google.com/'
            },
            signal: AbortSignal.timeout(15000) 
        });

        const html = await res.text();
        const $ = cheerio.load(html);
        const senarai = [];
        
        // Kita cuba cari menggunakan pelbagai selector (Cara X-Ray)
        const items = $('.ml-item, .item, [class*="item"]');
        
        items.each((i, el) => {
            const aTag = $(el).find('a').first();
            const imgTag = $(el).find('img').first();
            
            const tajuk = $(el).find('h2, h3, .mli-info, .title').text().trim();
            const link = aTag.attr('href');
            const poster = imgTag.attr('data-original') || imgTag.attr('src') || imgTag.attr('data-src');
            const kualiti = $(el).find('.mli-quality, .quality').text().trim() || "HD";

            if (tajuk && link && link.includes('http')) {
                senarai.push({
                    tajuk: tajuk,
                    kualiti: kualiti,
                    link: link,
                    poster: poster && poster.startsWith('//') ? 'https:' + poster : poster
                });
            }
        });

        console.log(`Imbasan selesai: Menemui ${senarai.length} item.`);
        return senarai;
    } catch (e) { 
        console.error("Ralat Teknikal: " + e.message);
        return []; 
    }
}

async function dapatkanStreamLinks(urlHalaman) {
    try {
        const res = await fetch(urlHalaman, { 
            headers: { 'User-Agent': 'Mozilla/5.0' },
            signal: AbortSignal.timeout(10000)
        });
        const html = await res.text();
        const regexVideo = /https?:\/\/[a-zA-Z0-9.\/-]*(voe|streamtape|dsvplay|filemoon|dood)[a-zA-Z0-9.\/=?_-]*/gi;
        const jumpa = html.match(regexVideo);
        return jumpa ? [...new Set(jumpa)] : [];
    } catch (e) { return []; }
}

module.exports = { ekstrakDataLive, dapatkanStreamLinks };
