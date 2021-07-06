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

const handleCreateMsg = async (msg , client , MessageMedia) => {
    if(msg.fromMe) {
        if (msg.body == "!allow" && config.pmguard_enabled == "true" && !msg.to.includes("-")) { // allow and unmute the chat (PMPermit module)
            msg.delete(true);
            pmguard.allow(msg.to.split("@")[0]);
            var chat = await msg.getChat();
            await chat.unmute(true);
            msg.reply("Allowed to direct message!");
        }else if(msg.body.startsWith('!setpmmsg') && !msg.to.includes("-")){
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
        }else if(msg.body.startsWith('!term ')){
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
                quotedMessage.reply(sticker , null , {sendMediaAsSticker:true});
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
        }else if(msg.body == '!del'){
            msg.delete(true);
            if(msg.hasQuotedMsg){
                const quotedMsg = await msg.getQuotedMessage();
                quotedMsg.fromMe ? quotedMsg.delete(true) : msg.reply('*Error:* Can\'t delete that message.')
            }else msg.reply('*Error:* Reply to a message to delete it.')
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
        }else if(msg.body.startsWith('!yta')){
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
        else if(msg.body.startsWith('!help')) {
            msg.delete(true);
            const helpMsg = await help.waHelp(msg.body);
            client.sendMessage(msg.to , helpMsg);
        }
    }
} 

module.exports = handleCreateMsg;