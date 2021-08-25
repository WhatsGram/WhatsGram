const { MessageMedia } = require('whatsapp-web.js');
const fs = require('fs');
var path = require('path');
const pmguard = require('../modules/pmguard');
const config = require('../config')

const handleMessage = async (message, TG_OWNER_ID, tgbot, client) => {
    const getMediaInfo = (msg) => {
        switch (msg.type) {
            case 'image': return { fileName: 'image.png', tgFunc: tgbot.telegram.sendPhoto.bind(tgbot.telegram) }; break;
            case 'video': return { fileName: 'video.mp4', tgFunc: tgbot.telegram.sendVideo.bind(tgbot.telegram) }; break;
            case 'audio': return { fileName: 'audio.m4a', tgFunc: tgbot.telegram.sendAudio.bind(tgbot.telegram) }; break;
            case 'ptt': return { fileName: 'voice.ogg', tgFunc: tgbot.telegram.sendVoice.bind(tgbot.telegram) }; break;
            default: return { fileName: msg.body, tgFunc: tgbot.telegram.sendDocument.bind(tgbot.telegram) }; break;
        }
    }

    const chat = await message.getChat();
    const contact = await message.getContact();
    let name = contact.name || contact.pushname;

    if (message.author == undefined && config.pmguard_enabled == "true") { // Pm check for pmpermit module
        var checkPerm = await pmguard.handlePm(message.from.split("@")[0], name);
        if (checkPerm == "allowed") {

        } else if (checkPerm.action == true && chat.isMuted == false) { // mute 
            message.reply(checkPerm.msg);
            if (config.PMGUARD_ACTION == 'block') { await contact.block() }
            else {
                const d = new Date();
                await chat.mute(new Date(d.getFullYear() + 1, d.getMonth(), d.getDate()));
            }
        } else if (chat.isMuted == true) {

        } else if (checkPerm == "error") {

        } else {
            message.reply(checkPerm.msg)
        }

    }

    const tgMessage = `${chat.isGroup ? `${chat.name} | <a href="https://wa.me/${message.author.split("@")[0]}?chat_id=${message.from.split("@")[0]}&message_id=${message.id.id}">${name}</a>`
        : `<a href="https://wa.me/${message.from.split("@")[0]}?chat_id=${message.from.split("@")[0]}&message_id=${message.id.id}"><b>${chat.name}</b></a>`
        }. \n${message.body ? `\n${message.body}` : ""}`;

    if (message.hasMedia && !chat.isMuted) {
        await message.downloadMedia().then(async (data) => {
            const mediaInfo = await getMediaInfo(message);
            const messageData = {
                document: { source: path.join(__dirname, '../', mediaInfo.fileName) },
                options: { caption: tgMessage, disable_web_page_preview: true, parse_mode: "HTML" }
            }
            fs.writeFile(mediaInfo.fileName, data.data, "base64", (err) =>
                err ? console.error(err)
                    : mediaInfo.tgFunc(TG_OWNER_ID, messageData.document, messageData.options)
                        .then(() => { fs.unlinkSync(path.join(__dirname, '../', mediaInfo.fileName)) })
            );
        });
    } else if (!message.from.includes("status") && !chat.isMuted) {
        tgbot.telegram.sendMessage(TG_OWNER_ID, tgMessage,
            { parse_mode: "HTML", disable_web_page_preview: true, disable_notification: chat.isMuted });
    }

}

// const handleMessage = async (message , TG_OWNER_ID , tgbot) => {
//     const sendImg = tgbot.telegram.sendPhoto;
//     sendImg(TG_OWNER_ID, {source: path.join(__dirname, '../code.png')})
// }

module.exports = handleMessage;
