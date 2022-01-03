const { Telegraf } = require('telegraf');
// const envconfig = require('dotenv').config();
const bot = new Telegraf(process.env.TOKEN);
const musics = require('./api/main.json');
const albums = require('./api/albums.json');
const isImageURL = require('image-url-validator').default;
const fs = require('fs');
const ytdl = require('ytdl-core');

<<<<<<< HEAD
bot.start((ctx) => {
    bot.telegram.sendMessage(
        ctx.chat.id,
        "Cem Karaca botuna hoşgeldiniz. Botun yaratılma amacı Cem Karaca şarkılarını tanıtmaktır. Bot'a istediğiniz gibi yenilik, düzenleme getirebilirsiniz. Bu açık kaynaklı bir projedir.\n\nBotun kullanımı için /help yazınız.",
        {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Source Code', url: 'https://github.com/Lucifer25x/cem-karaca'}]
                ]
            }
        }
    )
});
=======
bot.start((ctx) => ctx.reply('Cem Karaca botuna hoş geldiniz.\n\nBotun yaradılma amacı Cem Karaca şarkılarını tanıtmaktır.\nSource Code: https://github.com/Lucifer25x/cem-karaca'));
>>>>>>> 7ecb824da152e0e89feca35e8fc6dfd5db363d53

bot.command('music', (ctx) => {
    let random = Math.floor(Math.random() * musics.length);
    isImageURL('https://i.ytimg.com/vi/' + musics[random].id + '/maxresdefault.jpg').then(is_image => {
        if (is_image) {
            bot.telegram.sendPhoto(
                ctx.chat.id,
                'https://i.ytimg.com/vi/' + musics[random].id + '/maxresdefault.jpg',
                {
                    caption: `Music name: ${musics[random].name}\n\nYoutube: ${musics[random].youtube}\nSpotify: ${musics[random].spotify}`,
                }
            );
        } else {
            bot.telegram.sendMessage(
                ctx.chat.id,
                `Music name: ${musics[random].name}`,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Youtube', url: musics[random].youtube }],
                            [{ text: 'Spotify', url: musics[random].spotify }]
                        ]
                    }
                }
            );
        }
    })

    if (ytdl.validateURL(musics[random].youtube)) {
        let url = 'http://www.youtube.com/watch?v=' + musics[random].id;
        let mp3_file = musics[random].name + ".mp3";
        ytdl(url, { quality: "highestaudio", filter: "audioonly" })
            .pipe(fs.createWriteStream(mp3_file).on('finish', () => {
                bot.telegram.sendAudio(ctx.chat.id, { source: mp3_file }).then(() => {
                    fs.unlink(mp3_file, (err) => {
                        if (err) throw err;
                    });
                })
            }));
    }
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
            source: 'cem.jpeg'
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
        'Bot Cem Karaca şarkılarını tanıtmak için yapıldı.\n\nBotun kullanımı:\n/start - Botu başlat\n/help - Bot ve kullanımı hakkında\n/music - Random şarkı\n/about - Cem Karaca hakkında kısa bilgi\n/albums - Cem Karaca Albümleri\n/contact - İletişim'
    )
})

bot.command('about', ctx => {
    bot.telegram.sendPhoto(
        ctx.chat.id,
        {
            source: 'cem.jpeg'
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

bot.command('contact', ctx => {
    bot.telegram.sendMessage(
        ctx.chat.id,
        'Github: github.com/Lucifer25x\n\nTelegram: @lucifer25x'
    )
})

<<<<<<< HEAD
bot.command('search', ctx => {
    let searchText = ctx.message.text.split(' ').slice(1).join(' ');
    let searchResult = musics.filter(music => music.name.toLowerCase().includes(searchText.toLowerCase()));
    let searchResultText = '';
    for (let i = 0; i < searchResult.length; i++) {
        searchResultText += `${i + 1}. ${searchResult[i].name}\n`;
    }

    let dividedSongList = [];
    for (let i = 0; i < searchResult.length; i++) {
        if (i % 3 == 0) {
            dividedSongList.push([]);
        }
        let obj = {
            text: searchResult[i].name,
            callback_data: searchResult[i].name
        }
        dividedSongList[dividedSongList.length - 1].push(obj);
        bot.action(searchResult[i].name, (ctx) => {
            let youtube = searchResult[i].youtube;
            let spotify = searchResult[i].spotify;
            let mp3_file = searchResult[i].name + ".mp3";
            if (ytdl.validateURL(youtube)) {
                let url = 'http://www.youtube.com/watch?v=' + searchResult[i].id;
                ytdl(url, { quality: "highestaudio", filter: "audioonly" })
                    .pipe(fs.createWriteStream(mp3_file).on('finish', () => {
                        bot.telegram.sendAudio(ctx.chat.id, { source: mp3_file }).then(() => {
                            fs.unlink(mp3_file, (err) => {
                                if (err) throw err;
                            });
                        })
                    }));
            }

            bot.telegram.sendMessage(
                ctx.chat.id,
                `${searchResult[i].name}\n\nYoutube: ${youtube}\nSpotify: ${spotify}`
            )
        })
    }

    if(searchResultText.length == 0) {
        searchResultText = 'Aranan şarkı bulunamadı.';
        bot.telegram.sendMessage(
            ctx.chat.id, 
            searchResultText
        )
    } else {
        bot.telegram.sendMessage(
            ctx.chat.id,
            'Arama sonuçları: ',
            {
                reply_markup: {
                    inline_keyboard: dividedSongList
                }
            }
        )
    }
})

bot.launch();
=======
bot.launch();
>>>>>>> 7ecb824da152e0e89feca35e8fc6dfd5db363d53
