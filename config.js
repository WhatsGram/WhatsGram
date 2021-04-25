require('dotenv').config();
const fs = require('fs');

// const SESSION_DATA = process.env.SESSION_DATA || fs.existsSync('session.json') ? fs.readFileSync(__dirname + '/session.json', { encoding: 'utf8' }) : '';
const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN || '';
const TG_OWNER_ID = process.env.TG_OWNER_ID || '';

module.exports = {TG_BOT_TOKEN , TG_OWNER_ID}