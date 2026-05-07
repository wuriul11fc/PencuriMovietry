// server.js
const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const pencuriProvider = require('./provider.js');

const manifest = {
    id: "org.pencurimovie.local",
    version: "1.0.0",
    name: "PencuriMovie (Local PC)",
    description: "Penstriman terus dari web tempatan tanpa torrent.",
    resources: ["catalog", "stream"],
    types: ["movie"],
    idPrefixes: ["pm_"],
    catalogs: [{
        type: "movie",
        id: "pm_catalog",
        name: "Katalog Utama"
    }]
};

const builder = new addonBuilder(manifest);

builder.defineCatalogHandler(async (args) => {
    if (args.type === 'movie' && args.id === 'pm_catalog') {
        const senarai = await pencuriProvider.ekstrakDataLive('https://ww11.pencurimovie.sbs/');
        
        const metas = senarai.map(filem => {
            const idUnik = "pm_" + Buffer.from(filem.link).toString('base64');
            return {
                id: idUnik,
                type: "movie",
                name: filem.tajuk,
                poster: filem.poster,
                description: "Kualiti: " + filem.kualiti
            };
        });
        
        return { metas: metas };
    }
    return { metas: [] };
});

builder.defineStreamHandler(async (args) => {
    if (args.type === 'movie' && args.id.startsWith('pm_')) {
        const base64Link = args.id.replace('pm_', '');
        const urlAsal = Buffer.from(base64Link, 'base64').toString('ascii');
        
        const streams = await pencuriProvider.dapatkanStreamLinks(urlAsal);
        
        const formatStreams = streams.map(link => {
            let namaServer = "DSVPLAY";
            if (link.includes('voe')) { namaServer = "VOE"; }
            if (link.includes('streamtape')) { namaServer = "STREAMTAPE"; }
            
            return {
                url: link,
                title: namaServer + "\nDirect Stream (HTTPS)",
            };
        });
        
        return { streams: formatStreams };
    }
    return { streams: [] };
});

// Dapatkan port dari Render, atau guna 7000 jika dijalankan di PC
const PORT = process.env.PORT || 7000;

serveHTTP(builder.getInterface(), { port: PORT });

console.log(`✅ Server Add-on Stremio Berjaya Dihidupkan di port ${PORT}!`);
console.log("-> Jika di Render: Gunakan pautan web Render ditambah dengan /manifest.json");
console.log(`-> Jika di PC: http://127.0.0.1:${PORT}/manifest.json`);