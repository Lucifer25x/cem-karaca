const { Telegraf } = require('telegraf');
const envconfig = require('dotenv').config();
const bot = new Telegraf(process.env.TOKEN);
const musics = require('../api/main.json');
const albums = require('../api/albums.json');
const isImageURL = require('image-url-validator').default;
const fs = require('fs');
const ytdl = require('ytdl-core');

let random;

//FIXME After downloading a song, it downloads the same song for each song
function download({ id, name }, ctx) {
    let mp3_file = name + ".mp3";
    let url = 'http://www.youtube.com/watch?v=' + id;
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

bot.start((ctx) => {
    bot.telegram.sendMessage(
        ctx.chat.id,
        "Cem Karaca botuna hoşgeldiniz. Botun yaratılma amacı Cem Karaca şarkılarını tanıtmaktır. Bot'a istediğiniz gibi yenilik, düzenleme getirebilirsiniz. Bu açık kaynaklı bir projedir.\n\nBotun kullanımı için /help yazınız.",
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Source Code', url: 'https://github.com/Lucifer25x/cem-karaca' }]
                    [{ text: 'Source Code', url: 'https://github.com/Lucifer25x/cem-karaca' }]
                ]
            }
        }
    )
})

bot.command('music', (ctx) => {
    random = Math.floor(Math.random() * musics.length);
    isImageURL('https://i.ytimg.com/vi/' + musics[random].id + '/maxresdefault.jpg').then(is_image => {
        if (is_image) {
            bot.telegram.sendPhoto(
                ctx.chat.id,
                'https://i.ytimg.com/vi/' + musics[random].id + '/maxresdefault.jpg',
                {
                    caption: `Music name: ${musics[random].name}`,
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Youtube', url: 'https://www.youtube.com/watch?v=' + musics[random].id }],
                            (musics[random].spotify != "null") ? [{ text: 'Spotify', url: musics[random].spotify }] : [],
                            [{ text: 'Download', callback_data: 'download' }]
                        ]
                    }
                },
            );
        } else {
            bot.telegram.sendMessage(
                ctx.chat.id,
                `Music name: ${musics[random].name}`,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Youtube', url: musics[random].youtube }],
                            (musics[random].spotify != "null") ? [{ text: 'Spotify', url: musics[random].spotify }] : [],
                            [{ text: 'Download', callback_data: 'download' }]
                        ]
                    }
                }
            );
        }
    })

    bot.action('download', (ctx) => {
        bot.telegram.sendMessage(ctx.chat.id, 'Downloading...');
        download(musics[random], ctx);
    })
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
        'Bot Cem Karaca şarkılarını tanıtmak için yapıldı.\n\nBotun kullanımı:\n/start - Botu başlat\n/help - Bot ve kullanımı hakkında\n/music - Random şarkı\n/about - Cem Karaca hakkında kısa bilgi\n/albums - Cem Karaca Albümleri\n/search {şarkı adı} - Şarkı aratmak için\n/contact - İletişim'
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

bot.command('contact', ctx => {
    bot.telegram.sendMessage(
        ctx.chat.id,
        'Github: github.com/Lucifer25x\n\nTelegram: @lucifer25x'
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
                        (searchResult[0].spotify != "null") ? [{ text: 'Spotify', url: searchResult[0].spotify }] : [],
                        [{ text: 'Download', callback_data: searchResult[0].name }]
                    ]
                }
            }
        )

        bot.action(searchResult[0].name, (ctx) => {
            bot.telegram.sendMessage(ctx.chat.id, 'Downloading...');
            download(searchResult[0], ctx);
        })
    } else {
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
                bot.telegram.sendMessage(
                    ctx.chat.id,
                    `${searchResult[i].name}`,
                    {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: 'Youtube', url: searchResult[i].youtube }],
                                (searchResult[0].spotify != "null") ? [{ text: 'Spotify', url: searchResult[i].spotify }] : [],
                                [{ text: 'Download', callback_data: 'download'}]
                            ]
                        }
                    }
                )

                bot.action('download', (ctx) => {
                    bot.telegram.sendMessage(ctx.chat.id, 'Downloading...');
                    download(searchResult[i], ctx);
                })
            })
        }

        //FIXME Bot crashes when we click on other songs
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
