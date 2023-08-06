// import fs from "fs";
import path from "path";
import { config } from "dotenv";
config()

if (!process.env.TG_BOT_TOKEN) throw new Error("TG_BOT_TOKEN is not provided");
if (!process.env.TG_OWNER_ID) throw new Error("TG_OWNER_ID is not provided");
if (!process.env.DB_URL) throw new Error("DB_URL is not provided");
if ( process.env.NODE_ENV == 'production' && !process.env.SESSION_FILE_ID) throw new Error("SESSION_FILE_ID is not provided");


export const sessionFilePath = path.join(__dirname, './session');

// const SESSION_DATA = process.env.SESSION_DATA || fs.existsSync('session.json') ? fs.readFileSync(__dirname + '/session.json', { encoding: 'utf8' }) : '';
export const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN || '';
export const TG_OWNER_ID = process.env.TG_OWNER_ID || '';
export const REMOVE_BG_API = process.env.REMOVE_BG_API || undefined;
export const HEROKU_API_KEY = process.env.HEROKU_API_KEY || '';
export const HEROKU_APP_NAME = process.env.HEROKU_APP_NAME || '';
export const DB_URL = process.env.DB_URL || '';
export const pmguard_enabled = process.env.PMGUARD_ENABLED || 'false';
export const PMGUARD_ACTION = process.env.PMGUARD_ACTION && (process.env.PMGUARD_ACTION == 'mute' || process.env.PMGUARD_ACTION == 'block') ? process.env.PMGUARD_ACTION : 'mute';
export const OCR_SPACE_API_KEY = process.env.OCR_SPACE_API_KEY || '';
export const TG_CHANNEL_ID = process.env.TG_CHANNEL_ID || '';
export const DETA_PROJECT_KEY = process.env.DETA_PROJECT_KEY || '';
export const SESSION_FILE_ID = process.env.SESSION_FILE_ID || '';

// module.exports = { TG_BOT_TOKEN , TG_OWNER_ID , REMOVE_BG_API, HEROKU_API_KEY, HEROKU_APP_NAME, DB_URL, pmguard_enabled, PMGUARD_ACTION, OCR_SPACE_API_KEY, TG_CHANNEL_ID, DETA_PROJECT_KEY };