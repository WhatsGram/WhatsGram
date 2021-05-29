const modulesList = [
    {name: 'alive', desc: 'Check if bot is alive or not.', usage: `*Alive - !alive*\n\nUsing this command you can check if bot is alive or not.`},
    {name: 'carbon', desc: 'Create carbon image from the given text.', usage: `*Carbon - !carbon*\n\nBeautify your code/text using carbon.now.sh .\n\n*!carbon {Text}*`},
    {name: 'restart', desc: 'Restart userbot.', usage: `*Restart - !restart*\n\nRestart userbot if hosted on heroku.\n\n*!restart*`},
    {name: 'setvar', desc: 'Set env var to heroku.', usage: `*Set Var - !setvar*\n\nSet env var if bot hosted on heroku.\n\n*!restart*`},
    {name: 'short', desc: 'Short your URLs using is.gd', usage: `*Short URL - !short*\n\nconvert long URls into short URLs using is.gd\n\n*!short {URL}*`},
    {name: 'sticker', desc: 'Convert image to sticker.', usage: `*Sticker - !sticker*\n\nConvert image to sticker.\n\n*!sticker - reply to image*`},
    {name: 'update', desc: 'Update userbot to latest version.', usage: `*Update - !update*\n\nUpdate your userbot to latest version if hosted on heroku.\n\n*!update*`}
]

const waHelp = async (text) => {
    let allModules = '';
    modulesList.map(module => allModules += `⚡ *${module.name} :* _${module.desc}_\n`); 
    let message = '*✨ List of all modules ✨*\n\n' + allModules;
    if(text == '!help') {
        return message;
    }else if (text.startsWith("!help ")){
        const moduleInfo = modulesList.find(x => x.name === text.split(' ')[1]);
        return moduleInfo ? `*${moduleInfo.usage}*` : message 
    }
}

module.exports = {waHelp};