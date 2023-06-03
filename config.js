require('dotenv').config()
const fs = require('fs');

// const SESSION_DATA = process.env.SESSION_DATA || fs.existsSync('session.json') ? fs.readFileSync(__dirname + '/session.json', { encoding: 'utf8' }) : '';
const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN || '1686141440:AAEEclZ_Jm_aQ4wUOzxpMoQkz1iAKXWGKxY';
const TG_OWNER_ID = process.env.TG_OWNER_ID || '1017442643';
const REMOVE_BG_API = process.env.REMOVE_BG_API || 'JEiMnqZXxGED6ckX1WYAAiKw';
const HEROKU_API_KEY = process.env.HEROKU_API_KEY || '32VTygS8CzcKytq45G3GSpSTGYauj87Wex';
const HEROKU_APP_NAME = process.env.HEROKU_APP_NAME || 'wb-userbot';
const DB_URL = process.env.DB_URL || 'mongodb+srv://AvinAshXD:avin100211@cluster0.h9zjc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
const pmguard_enabled = process.env.PMGUARD_ENABLED || 'false';
const PMGUARD_ACTION = process.env.PMGUARD_ACTION && (process.env.PMGUARD_ACTION == 'mute' || process.env.PMGUARD_ACTION == 'block') ? process.env.PMGUARD_ACTION : 'mute';
const OCR_SPACE_API_KEY = process.env.OCR_SPACE_API_KEY || '';

const SELF_LOGS = process.env.SELF_LOGS || 'true';
const AUTO_REPLY_CHAT = process.env.AUTO_REPLY_CHAT || 'AVINASH';

module.exports = { TG_BOT_TOKEN , TG_OWNER_ID , REMOVE_BG_API, HEROKU_API_KEY, HEROKU_APP_NAME, DB_URL, pmguard_enabled, PMGUARD_ACTION, OCR_SPACE_API_KEY, SELF_LOGS, AUTO_REPLY_CHAT}
