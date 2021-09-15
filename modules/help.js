const modulesList = [
    {name: 'alive', desc: 'Check if bot is alive or not.', usage: `*Alive - !alive*\n\nUsing this command you can check if bot is alive or not.`},
    {name: 'carbon', desc: 'Create carbon image from the given text.', usage: `*Carbon - !carbon*\n\nBeautify your code/text using carbon.now.sh .\n\n*!carbon {Text}*`},
    {name: 'mute', desc: 'Mute chat.', usage: `*Mute - !mute*\n\nMute current chat. \nParams:\n• *mins* - No of mins to mute.\n• *hrs* - No of hours to mute.\n• *days* - No of days to mute.\n• *weeks* - No of weeks to mute.\n\n*!mute 1m 1h 1d 1w*`},
    {name: 'del', desc: 'Delete messages.', usage: `*Delete - !del*\n\nDelete a message by replying to it. \n*!del (Reply to a msg)*`},
    {name: 'pmguard', desc: 'Your personal window security officier.', usage: `*Pm Guard*\n\n*Cmds:* \n*setpmmsg* - !setpmmsg Custom Pm Message.\n\n*Markdown:* \n{name} - Adds user name.\n{warns} - Adds no of warns.`},
    {name: 'ocr', desc: 'Read text from image.', usage: `*OCR - !ocr*\n\n*!ocr (Reply to an image)*`},
    {name: 'qr', desc: 'Generate Qr Code from text.', usage: `*QR - !qr | !readqr*\n\n*Usage*\n1 - !qr WhatsGram\n2 - Reply !qr to any text.\n\n1- !readqr (Reply to qr image).`},
    {name: 'removebg', desc: 'Remove background from image.', usage: `*Removebg - !removebg*\n\nReply *!removebg* to any image to remove background.`},
    {name: 'restart', desc: 'Restart userbot.', usage: `*Restart - !restart*\n\nRestart userbot if hosted on heroku.\n\n*!restart*`},
    {name: 'setvar', desc: 'Set env var to heroku.', usage: `*Set Var - !setvar*\n\nSet env var if bot hosted on heroku.\n\n*!setvar -n varname -v varvalue*`},
    {name: 'short', desc: 'Short your URLs using is.gd', usage: `*Short URL - !short*\n\nconvert long URls into short URLs using is.gd\n\n*!short {URL}*`},
    {name: 'sticker', desc: 'Convert image to sticker.', usage: `*Sticker - !sticker*\n\nConvert image to sticker.\n\n*!sticker - reply to image*`},
    {name: 'telegraph', desc: 'Get direct link for media upto 5mb.', usage: `*Telegraph - !telegraph*\n\nUpload media to https://telegra.ph upto 5mb.\n\n*!telegraph* - reply to image or video.`},
    {name: 'unmute', desc: 'Unmute chat.', usage: `*UnMute - !unmute*\n\nUnmute current chat.\n\n*!unmute*`},
    {name: 'update', desc: 'Update userbot to latest version.', usage: `*Update - !update*\n\nUpdate your userbot to latest version if hosted on heroku.\n\n*!update*`},
    {name: 'youtube', desc: 'Download youtube videos & audios upto 100MB.', usage: `*YouTube*\n\nDownload youtube videos & audios upto 100MB or get direct download links.\n\n*!yt [url]* or reply to message - Download yt videos.\n\n*!yta [url]* or reply to message - Download yt audios.\n\n*!yturl [url]* or reply to message - Get direct download links.`}

]

const waHelp = async (text) => {
    let allModules = '';
    modulesList.map(module => allModules += `⚡ *${module.name} :* _${module.desc}_\n`); 
    let message = '*✨ List of all modules ✨*\n\n' + allModules + '\n```📕 Usage: !help [plugin_name]```';
    if(text == '!help') {
        return message;
    }else if (text.startsWith("!help ")){
        const moduleInfo = modulesList.find(x => x.name === text.split(' ')[1]);
        return moduleInfo ? `${moduleInfo.usage}` : message 
    }
}

module.exports = {waHelp};