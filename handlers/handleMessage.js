const handleMessage = async (message , TG_OWNER_ID , tgbot) => {
    const chat = await message.getChat();
    const contact = await message.getContact(); 
    let name = contact.name || contact.pushname;
    const tgMessage = `New message arrived on WhatsApp from ${ chat.isGroup ? `*${chat.name}* | [${name}](https://wa.me/${ message.author.split("@")[0] })`
        : `[${chat.name}](https://wa.me/'${message.from.split("@")[0]})`
    }. \nSender Id : _${message.from.split("@")[0]}_ \nMessage Id: _${ message.id.id }_ \n\n${message.body ? `Message Body: \n👇👇👇👇\n${message.body}` : ""}`;

    if (message.hasMedia && !chat.isMuted) {
        await message.downloadMedia().then(async (data) => {
        const media = await new MessageMedia("image/png", data.data);
        fs.writeFile("image.png", data.data, "base64", (err) =>
            err ? console.error(err)
            : tgbot.telegram.sendPhoto(
                TG_OWNER_ID, { source: "image.png" },
                { caption: tgMessage, disable_web_page_preview: true, parse_mode: "markdown", disable_notification: chat.isMuted }
                )
        );
        if (fs.existsSync("image.png")) fs.unlink("image.png");
        });
    } else if (!message.from.includes("status") && !chat.isMuted) {
        tgbot.telegram.sendMessage(TG_OWNER_ID, tgMessage, 
        { parse_mode: "markdown", disable_web_page_preview: true, disable_notification: chat.isMuted});
    }

}

module.exports = handleMessage;