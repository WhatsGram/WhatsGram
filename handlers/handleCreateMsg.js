const {exec} = require('child_process');
const short =  require("../modules/short");
const genCarbon = require("../modules/carbon");
const removebg = require("../modules/removebg");
const {updateHerokuApp , restartDyno, setHerokuVar} = require("../modules/heroku");
const help = require("../modules/help");
const {mute, unmute} = require('../modules/utils');
const pmguard = require('../modules/pmguard');
const config = require('../config');
const parseText = require('../modules/ocr');
const {genQr, readQr} = require("../modules/qr");
const telegraph = require("../modules/telegraph");
const {getYtAudio, getYtVideo, getYtDownloadUrl} = require("../modules/youtube");

const isImage = (msg) => msg.type == 'image' || (msg.type === 'document' && (msg.body.endsWith('.jpg') || msg.body.endsWith('.jpeg') || msg.body.endsWith('.png'))) ? true : false;
const { Telegraf } = require("telegraf");
const tgbot2 = new Telegraf(config.TG_BOT_TOKEN);

const { Buttons, List, Location } = require('whatsapp-web.js');

const fs = require('fs');
var path = require('path');

/* UPDATE PFP STUFF */
const { createCanvas, loadImage, registerFont } = require('canvas');
const http = require('http');

function getCurrentTime() {
    return new Promise((resolve, reject) => {
        const options = {
            host: 'worldtimeapi.org',
            path: '/api/timezone/Asia/Kolkata',
        };

        http.get(options, (response) => {
            let data = '';
            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                const result = JSON.parse(data);
                const datetime = result.datetime;
                const date = datetime.substring(0, 10);
                const time = datetime.substring(11, 16);
                resolve([date, time]);
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}

function generatePFP() {
    const imageWidth = 500;
    const imageHeight = 500;

    registerFont('C:/Users/PC/source/Repos/WhatsGram/bm.ttf', { family: 'Your Font' });
    registerFont('C:/Users/PC/source/Repos/WhatsGram/lmn.otf', { family: 'Your Quote Font' });

    const canvas = createCanvas(imageWidth, imageHeight);
    const context = canvas.getContext('2d');

    getCurrentTime().then(([currentDate, currentTime]) => {
        const timeFontSize = 220;
        const quoteFontSize = 50;
        const textColor = 'white';

        context.fillStyle = 'black';
        context.fillRect(0, 0, imageWidth, imageHeight);

        context.font = `${timeFontSize}px 'Your Font'`;
        context.fillStyle = textColor;
        context.textBaseline = 'middle';
        context.textAlign = 'center';
        context.fillText(currentTime, imageWidth / 2, imageHeight / 2 - 30);

        context.font = `${quoteFontSize}px 'Your Quote Font'`;
        context.fillText(currentDate, imageWidth / 2, imageHeight / 2 + 100);

        const buffer = canvas.toBuffer('image/png');
        const fs = require('fs');
        try {
            fs.writeFileSync('./time_image.png', buffer);
            console.log('File created successfully.');
            return true;
        } catch (error) {
            console.error('Error creating file:', error);
            return false;
        }
    });
}

const getMediaInfo = (msg) => {
        switch (msg.type) {
            case 'image': return { fileName: 'image.png', tgFunc: tgbot2.telegram.sendPhoto.bind(tgbot2.telegram) }; break;
            case 'video': return { fileName: 'video.mp4', tgFunc: tgbot2.telegram.sendVideo.bind(tgbot2.telegram) }; break;
            case 'audio': return { fileName: 'audio.m4a', tgFunc: tgbot2.telegram.sendAudio.bind(tgbot2.telegram) }; break;
            case 'ptt': return { fileName: 'voice.ogg', tgFunc: tgbot2.telegram.sendVoice.bind(tgbot2.telegram) }; break;
            default: return { fileName: msg.body, tgFunc: tgbot2.telegram.sendDocument.bind(tgbot2.telegram) }; break;
        }
    }


const handleCreateMsg = async (msg , client , MessageMedia) => {
    try {
        if(msg.fromMe) {
            if (msg.body == "!allow" && config.pmguard_enabled == "true" && !msg.to.includes("-")) { // allow and unmute the chat (PMPermit module)
                msg.delete(true);
                pmguard.allow(msg.to.split("@")[0]);
                var chat = await msg.getChat();
                await chat.unmute(true);
                msg.reply("Allowed to direct message!");
            } else if (msg.body === '!ping') {
                    // Send a new message to the same chat
                    msg.delete(true);
                    msg.reply('*_PoNg!_*');
            } else if (msg.body === '!pfp') {
                let item = await client.setDisplayName('hello');
                console.log(item);
                msg.delete(true);
            } else if (msg.body.startsWith('!desc ')) {
                // Change the group description
                msg.delete(true);
                let chat = await msg.getChat();
                if (chat.isGroup) {
                    let newDescription = msg.body.slice(6);
                    chat.setDescription(newDescription);
                } else {
                    msg.reply('This command can only be used in a group!');
                }
            } else if (msg.body.startsWith('!sendto ')) {
                // Direct send a new message to specific id
                let number = msg.body.split(' ')[1];
                let messageIndex = msg.body.indexOf(number) + number.length;
                let message = msg.body.slice(messageIndex, msg.body.length);
                number = number.includes('@c.us') ? number : `${number}@c.us`;
                let chat = await msg.getChat();
                chat.sendSeen();
                client.sendMessage(number, message);
            } else if (msg.body === '!leave') {
                // Leave the group
                msg.delete(true);
                let chat = await msg.getChat();
                if (chat.isGroup) {
                    client.sendMessage(msg.to, 'Bye...');
                    chat.leave();
                } else {
                    msg.reply('This command can only be used in a group!');
                }
            } else if (msg.body.startsWith('!join ')) {
                const inviteCode = msg.body.split(' ')[1];
                try {
                    await client.acceptInvite(inviteCode);
                    msg.reply('Joined the group!');
                } catch (e) {
                    msg.reply('That invite code seems to be invalid.');
                }
            } else if (msg.body === '!groupinfo') {
                let chat = await msg.getChat();
                if (chat.isGroup) {
                    msg.reply(`*Group Details*\n\nName: ${chat.name}\nDescription: ${chat.description}\nCreated At: ${chat.createdAt.toString()}\nCreated By: ${chat.owner.user}\nParticipant count: ${chat.participants.length}`);
                } else {
                    msg.reply('This command can only be used in a group!');
                }
            } else if (msg.body === '!chats') {
                msg.delete(true);
                const chats = await client.getChats();
                client.sendMessage(msg.from, `The bot has ${chats.length} chats open.`);
            } else if (msg.body === '!mediainfo' && msg.hasMedia) {
                const attachmentData = await msg.downloadMedia();
                msg.reply(`*Media info*\n\nMimeType: ${attachmentData.mimetype}\nFilename: ${attachmentData.filename}\nData (length): ${attachmentData.data.length}`);
            } else if (msg.body === '!quoteinfo' && msg.hasQuotedMsg) {
                const quotedMsg = await msg.getQuotedMessage();
                quotedMsg.reply(`ID: ${quotedMsg.id._serialized}\nType: ${quotedMsg.type}\nAuthor: ${quotedMsg.author || quotedMsg.from}\nTimestamp: ${quotedMsg.timestamp}\nIs Media: ${quotedMsg.hasMedia}`);
            } else if (msg.body === '!resendmedia' && msg.hasQuotedMsg) {
                msg.delete(true);
                const quotedMsg = await msg.getQuotedMessage();
                if (quotedMsg.hasMedia) {
                    const attachmentData = await quotedMsg.downloadMedia();
                    client.sendMessage(msg.from, attachmentData, { caption: 'Here\'s your requested media.' });
                }
            } else if (msg.body.startsWith('!location ') && msg.body.split(' ').length >= 3) {
                const latitude = parseFloat(msg.body.split(' ')[1]);
                const longitude = parseFloat(msg.body.split(' ')[2]);
                msg.delete(true);
                if(msg.body.split(' ').length >= 4)
                    msg.reply(new Location(latitude, longitude, msg.body.substring( msg.body.indexOf(longitude.toString()) + longitude.toString().length + 1, msg.body.length + 1)));
                else
                    msg.reply(new Location(latitude, longitude));
            } else if (msg.body.startsWith('!status ')) {
                const newStatus = msg.body.split(' ')[1];
                await client.setStatus(newStatus);
                msg.reply(`Status was updated to *${newStatus}*`);
            } else if (msg.body === '!mention') {
                const contact = await msg.getContact();
                const chat = await msg.getChat();
                chat.sendMessage(`Hi @${contact.number}!`, {
                        mentions: [contact]
                });
            } else if (msg.body === '!pin') {
                msg.delete(true);
                const chat = await msg.getChat();
                await chat.pin();
                //client.sendMessage(msg.to, '*Pinned The Chat!*');
            } else if (msg.body === '!archive') {
                msg.delete(true);
                const chat = await msg.getChat();
                await chat.archive();
            } else if (msg.body === '!mute') {
                msg.delete(true);
                const chat = await msg.getChat();
                // mute the chat for 20 seconds
                const unmuteDate = new Date();
                unmuteDate.setSeconds(unmuteDate.getSeconds() + 20);
                await chat.mute(unmuteDate);
            } else if (msg.body === '!typing') {
                msg.delete(true);
                const chat = await msg.getChat();
                // simulates typing in the chat
                chat.sendStateTyping();
            } else if (msg.body === '!recording') {
                msg.delete(true);
                const chat = await msg.getChat();
                // simulates recording audio in the chat
                chat.sendStateRecording();
            } else if (msg.body === '!clearstate') {
                msg.delete(true);
                const chat = await msg.getChat();
                // stops typing or recording in the chat
                chat.clearState();
            } else if (msg.body === '!jumpto') {
                msg.delete(true);
                if (msg.hasQuotedMsg) {
                        const quotedMsg = await msg.getQuotedMessage();
                        client.interface.openChatWindowAt(quotedMsg.id._serialized);
                }
            } else if (msg.body === '!buttons') {
                    let button = new Buttons('Who Owns Your Mum',[{body:'Me'},{body:'Gays'},{body:'Ramdikhana'}],'title','Select an appropriate option and get ur mum as reward huehuehuehue.');
                    client.sendMessage(msg.to, button);
            } else if (msg.body === '!list') {
                    let sections = [{title:'Your mum gae meter',rows:[{title:'Biggest Gae', description: 'Not Gae But Whore'},{title:'You Gae So U Dont Know'}]}];
                    let list = new List('Gae Meter','Your Mum Iz Mah Lub',sections,'Select Your Mum Gae Meter','Anyway i still own ur mum.');
                    client.sendMessage(msg.to, list);
            } else if(msg.body.startsWith('!setpmmsg') && !msg.to.includes("-")){
                msg.delete(true);
                if(config.pmguard_enabled == "true"){
                    const pmMsg = msg.body.replace('!setpmmsg ', '');
                    const readReq = await pmguard.readPmMsg();
                    const setReq = await pmguard.setPmMsg(pmMsg, readReq == 'failed' ? 'insert' : 'update');
                    client.sendMessage(msg.to, setReq == 'success' ? 'Pm Message updated sucessfully!': 'Failed to update pm message.')
                }else{
                    client.sendMessage(msg.to, '*Error:* Can\'t upadate message, PmGuard is disbaled.')
                }
            }else if(msg.body.startsWith("!short ")){
                msg.delete(true);
                short(msg.body.split('!short ')[1]).then(url => {
                client.sendMessage(msg.to, `${url.startsWith("https://") ? `Here is the shorten URL ${url}` : 'PLease send a valid url to short.'}`);
                })
            }else if(msg.body.startsWith("!carbon ")){
                msg.delete(true);
                genCarbon(msg.body.split('!carbon ')[1]).then(data => {
                    const carbon = new MessageMedia(data.mimetype , data.data);
                    client.sendMessage(msg.to , carbon);
                })
            }else if(msg.body.toString().startsWith("!term")){
                console.log(msg.body.toString(), 999)
               msg.delete(true);
                exec(msg.body.split('!term ')[1] , (data , error) => {
                    console.log(error);
                    client.sendMessage(msg.to , data ? data : error);
                });
            }else if (msg.body === '!update'){
                msg.delete(true);
                updateHerokuApp().then(result => {
                    const message = `*${result.message}*, ${result.status ? 'It may take some time so have patient.\n\n*Build Logs:* '+result.build_logs : ''}`;
                    client.sendMessage(msg.to , message);
                });
            }else if(msg.body === '!restart'){
                msg.delete(true);
                restartDyno().then(result => {
                    const message = `*${result.message}*`;
                    client.sendMessage(msg.to , message);
                })
            }else if (msg.body === '!sticker' && msg.hasQuotedMsg){
                msg.delete(true);
                const quotedMessage = await msg.getQuotedMessage();
                if(quotedMessage.hasMedia && isImage(quotedMessage)){
                    const stickerData = await quotedMessage.downloadMedia();
                    const sticker = await new MessageMedia(stickerData.mimetype , stickerData.data);
                    quotedMessage.reply(sticker , null , {sendMediaAsSticker: true, stickerAuthor: 'AvinAsh\'s Userbot'});
                }else{
                    quotedMessage.reply('Reply to an image to get it converted into sticker!');
                }
            }else if(msg.body.startsWith('!setvar ')){
                msg.delete(true);
                const extractData = (a , b) => msg.body.split(a)[1].split(b)[0].trim();
                const request = await setHerokuVar(extractData('-n' , '-v') , extractData('-v' , '-n'));
                client.sendMessage(msg.to , request.message);
            }else if(msg.body.startsWith('!removebg') && msg.hasQuotedMsg){
                const quotedMessage = await msg.getQuotedMessage();
                if(quotedMessage.hasMedia && isImage(quotedMessage)){
                    msg.delete(true);
                    msg.reply('Processing....')
                    const img = await quotedMessage.downloadMedia();
                    const result = await removebg(img.data);
                    const noBgImg = new MessageMedia('image/png' , result.img, 'NoBg@WhatsGram.png');
                    quotedMessage.reply(noBgImg, null, {sendMediaAsDocument: true});
                }else{ msg.reply('Please reply to an image file.') }
            }else if(msg.body.startsWith('!mute') && !msg.to.includes('-')){
                msg.delete(true);
                const unmuteTime = msg.body.split('!mute ')[1] == undefined ? Infinity :  msg.body.split('!mute ')[1];
                client.sendMessage(msg.to, (await mute(msg.to, unmuteTime, client)).msg);
            }else if(msg.body == '!unmute' && !msg.to.includes("-")){
                msg.delete(true);
                msg.reply((await unmute(msg.to, client)).msg);
            }else if(msg.body.startsWith('!ocr') && msg.hasQuotedMsg){
                msg.delete(true);
                const quotedMsg = await msg.getQuotedMessage();
                if(quotedMsg.hasMedia && isImage(quotedMsg)){
                    const img = await quotedMsg.downloadMedia();
                    const text = await parseText(img.data);
                    quotedMsg.reply(text); 
                }else{ quotedMsg.reply('Please reply to an image.')}
            }else if(msg.body.startsWith('!qr')){
                msg.delete(true);
                if(msg.hasQuotedMsg){
                    const quotedMsg = await msg.getQuotedMessage();
                    if(quotedMsg.type != 'chat'){ quotedMsg.reply('Please reply to any text to generate QrCode.') }
                    else {
                        quotedMsg.reply(new MessageMedia('image/png', (await genQr(quotedMsg.body)).qr, 'qr.png'), null)
                    } 
                }else{ 
                    client.sendMessage(msg.to, new MessageMedia('image/png', (await genQr(msg.body.replace('!qr ', ''))).qr, 'qr.png'), {caption: 'Qr Code for \n\n```'+msg.body.replace('!qr ', '')+'```'})
                }   
            }else if(msg.body.startsWith('!readqr') && msg.hasQuotedMsg){
                msg.delete(true);
                const quotedMsg = await msg.getQuotedMessage();
                if(quotedMsg.hasMedia && isImage(quotedMsg)){
                    const qrImg = await quotedMsg.downloadMedia();
                    const result = await readQr(qrImg);
                    if(result.status){ quotedMsg.reply('This is what we got from QR\n\n```' + result.data + '```') }
                    else{ quotedMsg.reply('*Error:* Failed to read QR. Make sure you\'ve passed correct qr.') }
                }
            }else if(msg.body.startsWith('!telegraph') && msg.hasQuotedMsg){
                msg.delete(true);
                const quotedMsg = await msg.getQuotedMessage();
                const data = await quotedMsg.downloadMedia();
                const res = await telegraph(data);
                if(res.status){ quotedMsg.reply(`🔗 *Here is direct link* \n\n👉 ${'```' + res.url}` + '```') }
                else{ quotedMsg.reply('```An error has been occurred while uploading. Make sure you passed correct file.```') }
            }else if(msg.body.startsWith('!yturl')){
                msg.delete(true);
                let url;
                if(msg.hasQuotedMsg){
                    const quotedMsg = await msg.getQuotedMessage();
                    url = quotedMsg.body;
                }else { url = msg.body.replace('!yturl ', '') }
                const data = await getYtDownloadUrl(url);
                client.sendMessage(msg.to, data.msg);
            }
            else if(msg.body.startsWith('!spam')) {
                const intervals = parseInt(msg.body.replace('!spam ', '').split(' ')[0]);
                const spamText = msg.body.replace('!spam '+intervals, '');
    
                if(msg.hasQuotedMsg) {
                    const quotedMsg = await msg.getQuotedMessage();
                    if(quotedMsg.hasMedia && isImage(quotedMsg)) {
                        const sData = await quotedMsg.downloadMedia();
                        const ss = await new MessageMedia(sData.mimetype , sData.data);
                        const sendAsSticker = msg.body.endsWith('sticker') ? true : false;
                        const caption = await quotedMsg.body
                        for(let i = 0; i < intervals; i++) {
                            quotedMsg.reply(ss, null , {sendMediaAsSticker: sendAsSticker, caption: caption});
                        }
                    } else {
                        for(let i = 0; i < intervals; i++) {
                            quotedMsg.reply(quotedMsg.body);
                        }
                    }
                } else {
                    for(let i = 0; i < intervals; i++) {
                        client.sendMessage(msg.to, spamText);
                    }
                }
                msg.delete(true);
            }
            else if(msg.body.startsWith('!yta')){
                msg.delete(true);
                let url;
                if(msg.hasQuotedMsg){
                    const quotedMsg = await msg.getQuotedMessage();
                    url = quotedMsg.body;
                }else { url = msg.body.replace('!yta ', '') }
                const data = await getYtAudio(url);
                client.sendMessage(msg.to, 'Downloading....');
                if(data.status == true){
                    client.sendMessage(msg.to, new MessageMedia('audio/mpeg' ,data.audio, `${data.name}.mp3`));
                }else{
                    client.sendMessage(msg.to, data.msg);
                }
            }else if(msg.body.startsWith('!yt')){
                msg.delete(true);
                let url;
                if(msg.hasQuotedMsg){
                    const quotedMsg = await msg.getQuotedMessage();
                    url = quotedMsg.body;
                }else { url = msg.body.replace('!yt ', '') }
                const data = await getYtVideo(url);
                client.sendMessage(msg.to, 'Downloading....');
                if(data.status == true){
                    client.sendMessage(msg.to, new MessageMedia('video/mkv' ,data.video, `${data.name}.mkv`), {sendMediaAsDocument: true});
                }else{
                    client.sendMessage(msg.to, data.msg);
                }
            }
            else if (msg.body === '!info') {
                msg.delete(true);
                let info = client.info;
                client.sendMessage(msg.from, `*Connection info*\n\nUser name: ${info.pushname}\nMy number: ${info.wid.user}\nPlatform: @BeastAvinPC [Ubuntu]`);
            }
            else if(msg.body.startsWith('!help')) {
                msg.delete(true);
                const helpMsg = await help.waHelp(msg.body);
                client.sendMessage(msg.to , helpMsg);
            } else if(msg.body == '!clearChat') {
                var chat = await msg.getChat();
                msg.delete(true);
                chat.clearMessages();
            }  else if(msg.body == '!deleteChat') {
                var chat = await msg.getChat();
                msg.delete(true);
                chat.delete();
            } else if(msg.body == '!block') {
                var chat = await msg.getChat();
                const contact = await chat.getContact();
                if(contact != undefined && !contact.isBlocked)
                    await contact.block();
            } else if(msg.body.startsWith('!upload')) {
                const file = msg.body.replace('!upload ', '');
                console.log('FileName: '+file);
                const media = MessageMedia.fromFilePath(file);
                if(media) {
                    client.sendMessage(msg.to, media);
                } else
                    msg.reply('Media file not found to upload');
                msg.delete(true);
            } else if(msg.body.startsWith('!dl') && msg.hasQuotedMsg) {
                const quotedMsg = await msg.getQuotedMessage();
                if(quotedMsg && quotedMsg.hasMedia) {
                    const media = await quotedMsg.downloadMedia();
                    if(media) {
                        await fs.writeFile(msg.body.replace('!dl ', ''), media.data, "base64", (err) => {
                           if(err) {
                               console.log(err);
                               msg.reply('Failed to save ' + msg.body.replace('!dl ', ''));
                           } else msg.reply('Document saved to: ' + msg.body.replace('!dl ', ''));
                        });
                    } else
                        msg.reply('Failed to download the media');
                }
                msg.delete(true);
            } else if(msg.body == '!wordAttack') {
                msg.delete(true);
                fs.readFileSync('./handlers/wordlist.txt', 'utf-8').split(/\r?\n/).forEach(function(line){
                  client.sendMessage(msg.to, line);
                })
            } else if (msg.body.startsWith('!react') && msg.hasQuotedMsg && msg.to != msg.from) {
                let times = parseInt(msg.body.replace('!react ', '').split(' ')[0]);
                const emojis = msg.body.replace('!react ', '').split(' ')[1]
                console.log('msg', msg.body, 'times:', times, 'emojis: ', emojis)
    
                let TMP = await msg.getQuotedMessage();
    
                while (times--) {
                    for (const j of emojis) {
                        setTimeout(await function () {
                            TMP.react(j);
                        }, 500);
                    }
                }
    
                await TMP.react('');
            } else if(msg.body == '!userInfo') {
                msg.delete(true);
                var chat = await msg.getChat();
                const contact = await chat.getContact();
                if(contact != undefined) {
                    const pfp = await contact.getProfilePicUrl();
                    const about = await contact.getAbout();
                    const commonGroupsArr = await contact.getCommonGroups();
                    const commonGroupsCount = commonGroupsArr.length;
                    const countryCode = await contact.getCountryCode();
                    const number = await contact.getFormattedNumber();
                    const id = await contact.id._serialized;
                    const isBusiness = await contact.isBusiness;
                    const isEnterprise = await contact.isEnterprise;
                    const pushName = await contact.pushname;
                    const shortName = await contact.shortname;
                    
                    const captionTxt = '*About:* ' + about +
                              '\n*Groups in common:* ' + commonGroupsCount +
                              '\n*Country Code:* ' + countryCode +
                              '\n*Number (Formatted):* ' + number +
                              '\n*User ID:* ' + id +
                              '\n*Is Business:* ' + isBusiness +
                              '\n*Is Enterprise:* ' + isEnterprise +
                              '\n*Push Name:* ' + pushName +
                              '\n*Short name:* ' + shortName;
    
                    const pfpMedia = await MessageMedia.fromUrl(pfp);
                    if(pfpMedia == undefined)
                        client.sendMessage(msg.to, '*Profile Pic URL:* ' + pfp +
                                                   '\n' + captionTxt);
                    else
                        client.sendMessage(msg.to, pfpMedia, {caption: captionTxt});
                }
            } else if(config.SELF_LOGS == "true" && !msg.hasMedia && !msg.body.startsWith('!')) {
                var chat = await msg.getChat();
                const name = `${chat.isGroup ? `[GROUP] ${chat.name}`
                    : `<a href="https://wa.me/${msg.to.split("@")[0]}?chat_id=${msg.to.split("@")[0]}&message_id=${msg.id.id}"><b>${chat.name}</b></a>`
                    }`;
                // console.log("You -> "+ name + "\n\n" + msg.body);
                tgbot2.telegram.sendMessage(config.TG_OWNER_ID, "You -> " + name + '\n\n' + msg.body, {disable_notification: true, disable_web_page_preview: true, parse_mode: "HTML"});
            } else if (config.SELF_LOGS == "true" && msg.hasMedia && !msg.body.startsWith('!')) {
                var chat = await msg.getChat();
                const name = `You -> ${chat.isGroup ? `[GROUP] ${chat.name}`
                    : `<a href="https://wa.me/${msg.to.split("@")[0]}?chat_id=${msg.to.split("@")[0]}&message_id=${msg.id.id}"><b>${chat.name}</b></a>\n\n${msg.body}`
                    }`;
                await msg.downloadMedia().then(async (data) => {
                    const mediaInfo = await getMediaInfo(msg);
                    const messageData = {
                        document: { source: path.join(__dirname, '../', mediaInfo.fileName) },
                        options: { caption: name, disable_web_page_preview: true, parse_mode: "HTML" }
                    }
                    fs.writeFile(mediaInfo.fileName, data.data, "base64", (err) =>
                        err ? console.error(err)
                            : mediaInfo.tgFunc('1017442643', messageData.document, messageData.options)
                                .then(() => { exec('rm '+path.join(__dirname, '../', mediaInfo.fileName), (data, err) => 
                                                  { if(err) console.log(err); }) })
                    );
                });
            }
            //console.log('Media: '+msg.hasMedia);
        }
    } catch (error) {
        console.log(error)
    }
} 

module.exports = handleCreateMsg;
