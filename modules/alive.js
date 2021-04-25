  
const config = require('../config');
const axios = require('axios');

async function alive(battery, phoneInfo) {
    let batteryInfo ;
    battery.plugged ? batteryInfo = `${battery.battery}% (Charging)`
    :  batteryInfo = `${battery.battery}%`;

    return ({
        startMessage: `*WhatsGram* _(0.1.0)_\n\n*Battery Info:* ${batteryInfo}\n*Device:* ${phoneInfo.device_manufacturer} ${phoneInfo.device_model}\n*WhatsApp Version:* ${phoneInfo.wa_version}\n\n*Official Github Repo 👇👇*\n` + "```https://github.com/WhatsGram/WhatsGram```",
        mimetype: "image/jpeg",
        data: Buffer.from(((await axios.get('https://telegra.ph/file/24f96b69dd941ffb7688b.jpg', { responseType: 'arraybuffer' })).data)).toString('base64'),
        filename: "aliveMedia.jpg"
    })
}

module.exports = alive;