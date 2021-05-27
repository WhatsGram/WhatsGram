const { MessageMedia } = require('whatsapp-web.js');
const fs = require('fs');
var path = require('path');

const handleMessage = async (message , TG_OWNER_ID , tgbot) => {
    const chat = await message.getChat();
    const contact = await message.getContact(); 
    let name = contact.name || contact.pushname;
    const tgMessage = `New message arrived on WhatsApp from ${ chat.isGroup ? `*${chat.name}* | [${name}](https://wa.me/${ message.author.split("@")[0] })`
        : `[${chat.name}](https://wa.me/'${message.from.split("@")[0]})`
    }. \nSender Id : _${message.from.split("@")[0]}_ \nMessage Id: _${ message.id.id }_ \n\n${message.body ? `Message Body: \n👇👇👇👇\n${message.body}` : ""}`;

    if (message.hasMedia && !chat.isMuted) {
        await message.downloadMedia().then(async (data) => {
        let fileName;
        message.type === "image" ? fileName = "document.png" : fileName =  message.body;
        const messageData = {
            document : {source: path.join(__dirname , '../' , fileName)},
            options: { caption: tgMessage, disable_web_page_preview: true, parse_mode: "markdown" }
        }
        fs.writeFile(fileName , data.data, "base64", (err) =>
            err ? console.error(err)
            : (message.type === "image" ?
                tgbot.telegram.sendPhoto( TG_OWNER_ID, messageData.document, messageData.options)
              : tgbot.telegram.sendDocument( TG_OWNER_ID, messageData.document, messageData.options))
            .then(() => { fs.unlinkSync(path.join(__dirname , '../' , fileName)) })
        );
        });
    } else if (!message.from.includes("status") && !chat.isMuted) {
        tgbot.telegram.sendMessage(TG_OWNER_ID, tgMessage, 
        { parse_mode: "markdown", disable_web_page_preview: true, disable_notification: chat.isMuted});
    }

}

module.exports = handleMessage;