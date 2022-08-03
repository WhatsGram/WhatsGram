  
const config = require('../config');
const axios = require('axios');
const fs = require('fs');

async function alive(phoneInfo) {
    return ({
        // startMessage: `*WhatsGram* _(0.1.0)_\n\n*Device:* ${`phoneInfo.device_manufacturer`} ${`phoneInfo.device_model`}\n*WhatsApp Version:* ${phoneInfo.wa_version}\n\n*Official Github Repo 👇👇*\n` + "```https://github.com/WhatsGram/WhatsGram```",
        startMessage: '*WhatsGram!* \n\nWhatsGram is an opensource project that helps you to use WhatsApp in a better way, provides extra features and connects WhatsApp with the one of the most used social apps i.e Telegram. \n\n*Official Github Repo 👇👇*\n```https://github.com/WhatsGram/WhatsGram```',
        mimetype: "image/jpeg",
        data: fs.readFileSync('./static/logo.png').toString('base64'),
        filename: "aliveMedia.jpg"
    })
}

module.exports = alive;