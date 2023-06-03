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
    {name: 'youtube', desc: 'Download youtube videos & audios upto 100MB.', usage: `*YouTube*\n\nDownload youtube videos & audios upto 100MB or get direct download links.\n\n*!yt [url]* or reply to message - Download yt videos.\n\n*!yta [url]* or reply to message - Download yt audios.\n\n*!yturl [url]* or reply to message - Get direct download links.`},
    {name: 'clearChat', desc: 'Clear chat messages', usage: '*ClearChat*\n\nDelete current chat\n\n!deleteChat'},
    {name: 'deleteChat', desc: 'Delete chat', usage: '*DeleteChat*\n\nDelete all messages in current chat\n\n!clearChat'},
    {name: 'info', desc: 'Owner information', usage: '*Information*\n\nInformation of owner Commection (Username, Platform & Number)\n\n*!info*'},
    {name: 'spam', desc: 'Chat spammer', usage: '*ChatSpammer*\n\nChat spammer that takes message numbers input and the message as input, Reply with quote message to spam that particular message\n\nWith quoted message : *!spam (amount)*\nWithout quoted message : *!spam (amount) [text]*'},
    {name: 'term', desc: 'Terminal command execution', usage: '*Terminal*\n\nUsed to perform bash operations in terminal\n\n*!term [command]*'},
    {name: 'recording', desc: 'Fake recording status', usage: '*Recording*\n\nWhen used in a chat, other chat member(s) will see fake status _Recording_\n\n*!recording*'},
    {name: 'typing', desc: 'Fake typing status', usage: '*Typing*\n\nWhen used in a chat, other chat member(s) will see fake status _Typing_\n\n*!typing*'},
    {name: 'mute', desc: 'Mute chat for time periond', usage: '*Mute*\n\nMute the current chat for (20)seconds, after 20 seconds it\'ll automatically unmute the chat. You can change mute time interval from repository\n\n*!mute*'},
    {name: 'archive', desc: 'Archive the chat', usage: '*Archive*\n\nMove the current chat to archived folder\n\n*!archive*'},
    {name: 'pin', desc: 'Pin the chat', usage: '*Pin*\n\nPin the current chat. Note: WhatsApp only allow 3 chats to be pinned\n\n*!pin*'},
    {name: 'status', desc: 'Update your status', usage: '*Status*\n\nUpdate your status, Status word limit is (139) characters\n\n*!status [text]'},
    {name: 'location', desc: 'Send fake location', usage: '*Location*\n\nSend fake location based on longitude & latitude. Description is optional\n\n*!location (lat) (long) [Description: optional]*'},
    {name: 'resendmedia', desc: 'Resend the quoted message media', usage: '*ResendMedia*\n\nResend the quoted message media to the same chat, All media cannot be downloaded so the command may not work\n\n*!resendmedia*'},
    {name: 'chats', desc: 'Show number of all open chats', usage: '*Chats*\n\nShows the number of chats open of the owner account\n\n*!chats*'},
    {name: 'mediainfo', desc: 'Information of the quoted media', usage: '*MediaInfo*\n\nShows the information of quoted media files\n\n*!mediainfo'},
    {name: 'quoteinfo', desc: 'Information of the quoted message', usage: '*QuoteInfo*\n\nShows the information of the quoted message\n\n*!quoteinfo*'},
    {name: 'groupinfo', desc: 'Information Of The Group', usage: '*GroupInfo*\n\nShows the information of the group, command must be used in a group\n\n*!groupinfo*'},
    {name: 'join', desc: 'Join the group with invitation code', usage: '*Join*\n\nJoin the group directly with the invitation code\n\n*!join [code]*'},
    {name: 'leave', desc: 'Leave the group', usage: '*Leave*\n\nLeave the group, command must be used in a group\n\n*!leave*'},
    {name: 'sendto', desc: 'Send message directly to someone', usage: '*SendTo*\n\nSend message directly to given number with the message\n\n*!send to (number without +) [message]'},
    {name: 'desc', desc: 'Change group description', usage: '*Description*\n\nChange group description, must be used in a group with permission to write group description\n\n*!desc [descriptionText]*'},
    {name: 'ping', desc: 'Check if userbot is alive', usage: '*Ping*\n\nReply with message *PoNg* if userbot is running\n\n*!ping*'}
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
