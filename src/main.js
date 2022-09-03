const { Telegraf } = require('telegraf');
const envconfig = require('dotenv').config();
const bot = new Telegraf(process.env.TOKEN);
const musics = require('../api/main.json');
const albums = require('../api/albums.json');
const fs = require('fs');
const ytdl = require('ytdl-core');

bot.start(ctx => {
    bot.telegram.sendMessage(
        ctx.chat.id,
        "Cem Karaca botuna hoşgeldiniz. Botun yaratılma amacı Cem Karaca şarkılarını tanıtmaktır. Bot'a istediğiniz gibi yenilik, düzenleme getirebilirsiniz. Bu açık kaynaklı bir projedir.\n\nBotun kullanımı için /help yazınız.",
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Source Code', url: 'https://github.com/Lucifer25x/cem-karaca' },
                    { text: 'Source Code', url: 'https://github.com/Lucifer25x/cem-karaca' }]
                ]
            }
        }
    )
})

function download({id, name}, ctx){
    let mp3_file = name + ".mp3";
    let url = 'http://www.youtube.com/watch?v=' + id;
    bot.telegram.sendMessage(
        ctx.chat.id,
        'Biraz bekleyin, size şarkının mp3 dosyası gönderilecektir.'
    )
    if (ytdl.validateURL(url)) {
        ytdl(url, { quality: "highestaudio", filter: "audioonly" })
            .pipe(fs.createWriteStream(mp3_file).on('finish', () => {
                bot.telegram.sendAudio(ctx.chat.id, { source: mp3_file }).then(() => {
                    fs.unlink(mp3_file, (err) => {
                        if (err) throw err;
                    });
                })
            }));
    }
}

bot.command('music', (ctx) => {
    let random = Math.round(Math.random() * musics.length);;

    bot.telegram.sendMessage(
        ctx.chat.id,
        `Music name: ${musics[random].name}`,
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Youtube', url: musics[random].youtube }],
                    (musics[random].spotify != "null") ? [{ text: 'Spotify', url: musics[random].spotify }] : []
                ]
            }
        }
    );

    download(musics[random], ctx);
})

bot.command('albums', (ctx) => {
    let albumList1 = [];
    let albumList2 = [];
    for (let i = 0; i < albums.length; i++) {
        let obj = {
            text: albums[i].name,
            callback_data: i
        }
        if (i < 3) {
            albumList1.push(obj);
        } else {
            albumList2.push(obj);
        }
    }

    bot.telegram.sendPhoto(
        ctx.chat.id,
        {
            source: 'images/cem.jpeg'
        },
        {
            caption: "Albümler:",
            reply_markup: {
                inline_keyboard: [
                    albumList1,
                    albumList2
                ]
            }
        }
    )
})

bot.action(/[0-5]/, (ctx) => {
    let id = ctx.update.callback_query.data;
    let album = albums[id];
    let albumMusics = album.musics;
    let albumMusicsListText = '';
    let mainText = `Albüm: ${album.name}\n`;
    for (let i = 0; i < albumMusics.length; i++) {
        albumMusicsListText += `${i + 1}. ${albumMusics[i]}\n`;
    }

    bot.telegram.sendMessage(
        ctx.chat.id,
        mainText + '\n' + albumMusicsListText
    )
})

bot.command('help', ctx => {
    bot.telegram.sendMessage(
        ctx.chat.id,
        'Bot Cem Karaca şarkılarını tanıtmak için yapıldı.\n\nBotun kullanımı:\n/start - Botu başlat\n/help - Bot ve kullanımı hakkında\n/music - Random şarkı\n/about - Cem Karaca hakkında kısa bilgi\n/albums - Cem Karaca Albümleri\n/search {şarkı adı} - Şarkı aratmak için'
    )
})

bot.command('about', ctx => {
    bot.telegram.sendPhoto(
        ctx.chat.id,
        {
            source: 'images/cem.jpeg'
        },
        {
            caption: 'Cem Karaca\n\nDoğum İsmi: Muhtar Cem Karaca\nBiliniyor: Cem Baba\nDoğdu: 5 Nisan 1945\nDoğduğu Yer: Bakırköy, İstanbul\nÖldü: 8 Şubat 2004\nTürler: Anadolu rock, Protest rock, Progressive rock, Symphonic rock, Hard rock, Psychedelic rock.\nMeslek: Şarkıcı - Söz yazarı, besteci\nAktif yıllar: 1961-2004',
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: "Daha detaylı bilgi",
                        url: "https://en.wikipedia.org/wiki/Cem_Karaca"
                    }]
                ]
            }
        }
    )
})

bot.command('search', ctx => {
    let searchText = ctx.message.text.split(' ').slice(1).join(' ');
    let searchResult = musics.filter(music => music.name.toLowerCase().includes(searchText.toLowerCase()));

    if (searchResult.length == 0) {
        console.log('not result')
        bot.telegram.sendMessage(
            ctx.chat.id,
            'Aranan şarkı bulunamadı.'
        )
    } else if (searchResult.length == 1) {
        bot.telegram.sendMessage(
            ctx.chat.id,
            `${searchResult[0].name}`,
            {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Youtube', url: searchResult[0].youtube }],
                        (searchResult[0].spotify != "null") ? [{ text: 'Spotify', url: searchResult[0].spotify }] : []
                    ]
                }
            }
        )

        download(searchResult[0], ctx);
    } else {
        let text = 'Arama sonuçları:\n';

        for(let i = 0; i < searchResult.length; i++){
            text += `\n${i+1}. ${searchResult[i].name}`;
        }
        bot.telegram.sendMessage(
            ctx.chat.id,
            text
        )
    }
})

bot.launch()