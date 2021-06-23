require('dotenv').config()
const fs = require('fs');

// const SESSION_DATA = process.env.SESSION_DATA || fs.existsSync('session.json') ? fs.readFileSync(__dirname + '/session.json', { encoding: 'utf8' }) : '';
const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN || '';
const TG_OWNER_ID = process.env.TG_OWNER_ID || '';
const REMOVE_BG_API = process.env.REMOVE_BG_API || undefined;
const HEROKU_API_KEY = process.env.HEROKU_API_KEY || '';
const HEROKU_APP_NAME = process.env.HEROKU_APP_NAME || '';

module.exports = {TG_BOT_TOKEN , TG_OWNER_ID , REMOVE_BG_API, HEROKU_API_KEY, HEROKU_APP_NAME}