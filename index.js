const qrcode = require("qrcode-terminal");
const fs = require("fs");
require("dotenv").config();
var QRCode = require("qrcode");
const { Client, MessageMedia, LocalAuth, LegacySessionAuth } = require("whatsapp-web.js");
const { Telegraf } = require("telegraf");
const config = require("./config");
const alive = require('./modules/alive');
const handleMessage = require("./handlers/handleMessage");
const handleCreateMsg = require("./handlers/handleCreateMsg");
const handleTgBot = require("./handlers/handleTgbot");
const { saveSessionToDb, getSession } = require("./handlers/handleSession");

const tgbot = new Telegraf(config.TG_BOT_TOKEN);

let client = new Client({ // Create client.
  authStrategy: new LegacySessionAuth (),
  puppeteer: { headless: true, args: ["--no-sandbox"] },
});

const initClient = () => {
  client = new Client({
    // Create client.
    authStrategy: new LocalAuth({
      dataPath: "./WWebJS",
    }),
    puppeteer: { headless: true, args: ["--no-sandbox"] },
  });
  client.options.puppeteer.userDataDir = null;
  return client.initialize();
}

getSession(initClient);

// Set bot commands. 
const cmd = (cmd, desc) => ({ command: cmd, description: desc });
try {
  tgbot.telegram.setMyCommands([cmd('start', 'Start bot.'), cmd('mar', 'Mark message as read.'), cmd('send', 'Ex: /send ph_no message'), cmd('update', 'Update UB.'), cmd('restart', 'Restart ub.')]);
} catch (e) {
  console.error('Failed to set commands.');
}

client.on("qr", async (qr) => {
  console.log("Kindly check your telegram bot for QR Code.");
  await QRCode.toFile("qr.png", qr);
  await tgbot.telegram.sendPhoto(
    config.TG_OWNER_ID, { source: "qr.png" }, { caption: "Scan it in within 20 seconds...." }
  );
  await qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => { // Take action when user Authenticated successfully.
  console.log("Authenticated successfully.");
  if (fs.existsSync('qr.png')) fs.unlinkSync('qr.png');
});

client.on("logout", () => { // Take action when user logout.
  console.log("Looks like you've been logged out. Please generate session again.");
  whatsGramDrive.delete('session.zip');
});


client.on("auth_failure", () => { // If failed to log in.
  const message = 'Failed to authenticate the client. Please fill env var again or generate session.json again. Generating session data again...';
  console.log(message);
  tgbot.telegram.sendMessage(config.TG_OWNER_ID, message,
    { disable_notification: true })
  whatsGramDrive.delete('session.zip');
  initClient();
})

/* UPDATE PFP STUFF */
const { createCanvas, registerFont } = require('canvas');
const http = require('http');

function getCurrentTime() {
  return new Promise((resolve, reject) => {
    const options = {
      host: 'worldtimeapi.org',
      path: '/api/timezone/Asia/Kolkata',
    };

    http.get(options, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        const result = JSON.parse(data);
        const datetime = result.datetime;
        const date = datetime.substring(0, 10);
        const time = datetime.substring(11, 16);
        resolve([date, time]);
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

async function getQuote() {
  try {
    let quote = {};
    let character = '';
    let quoteText = '';

    while (quoteText.length > 139 || !quoteText) {
      const response = await fetch("http://animechan.melosh.space/random/anime?title=naruto");
      quote = await response.json();
      ({ character, quote: quoteText } = quote);
    }

    console.log('Character:', character);
    console.log('Quote:', quoteText);

    return { character, quote: quoteText };
  } catch (error) {
    console.error(error);
    return { character: '', quote: '' };
  }
}

async function generatePFP() {
  const charAndQuote = await getQuote();
  const Character = charAndQuote['character'];
  const Quote = charAndQuote['quote'];

  const imageWidth = 500;
  const imageHeight = 500;

  registerFont('C:/Users/PC/source/Repos/WhatsGram/bm.ttf', { family: 'Your Font' });
  registerFont('C:/Users/PC/source/Repos/WhatsGram/lmn.otf', { family: 'Your Quote Font' });

  const canvas = createCanvas(imageWidth, imageHeight);
  const context = canvas.getContext('2d');

  getCurrentTime().then(([currentDate, currentTime]) => {
    // Parse current time and add 1 minute
    const [hours, minutes] = currentTime.split(':').map(Number);
    let updatedMinutes = minutes + 1;
    let updatedHours = hours;

    if (updatedMinutes === 60) {
      updatedMinutes = 0;
      updatedHours++;
    }

    // Convert updatedHours to 12-hour format
    updatedHours = (updatedHours % 12) || 12; // Adjust hours to 12-hour format

    // Add leading zero for hours less than 10
    const formattedHours = updatedHours < 10 ? `0${updatedHours}` : updatedHours;
    const updatedTime = `${formattedHours}:${updatedMinutes < 10 ? '0' : ''}${updatedMinutes}`;


    const timeFontSize = 220;
    const quoteFontSize = 50;
    const textColor = 'white';

    context.fillStyle = 'black';
    context.fillRect(0, 0, imageWidth, imageHeight);

    context.font = `${timeFontSize}px 'Your Font'`;
    context.fillStyle = textColor;
    context.textBaseline = 'middle';
    context.textAlign = 'center';
    context.fillText(updatedTime, imageWidth / 2, imageHeight / 2 - 30);

    context.font = `${quoteFontSize}px 'Your Quote Font'`;
    context.fillText(currentDate, imageWidth / 2, imageHeight / 2 + 100);

    const buffer = canvas.toBuffer('image/png');
    const fs = require('fs');
    fs.writeFileSync('./time_image.png', buffer);

    const media = MessageMedia.fromFilePath(
      'C:/Users/PC/source/Repos/WhatsGram/time_image.png'
    );

    client.setDisplayName(Character);
    client.setStatus(Quote);
    client.setProfilePicture(media);
    client.sendPresenceAvailable();

    console.log("PFP Done");
  });
}

client.on("ready", async () => { // Take actin when client is ready.
  const message = "Successfully logged in. Ready to rock!";
  console.log(message);
  tgbot.telegram.sendMessage(config.TG_OWNER_ID, message, { disable_notification: true });
  if (fs.existsSync("qr.png")) fs.unlinkSync("qr.png");
  await saveSessionToDb();

  generatePFP();

  // Calculate the time remaining until the next minute
  var now = new Date();
  var seconds = 60 - now.getSeconds();
  var milliseconds = (seconds * 1000) - now.getMilliseconds();

  // Call setTimeout to run the function again after the remaining time
  setTimeout(function () {
    setInterval(generatePFP, 60 * 1000);
  }, milliseconds);
});

// Telegram Bot
tgbot.start(ctx => ctx.replyWithMarkdown(`Hey **${ctx.message.from.first_name}**, Welcome! \nI can notify you about new messages of WhatsApp. \n\nPowered by [WhatsGram](https://github.com/acessrdpgg/WhatsGram).`,
  {
    disable_web_page_preview: true,
    reply_markup: {
      inline_keyboard: [[{ text: 'WhatsGram Repo', url: 'https://github.com/acessrdpgg/WhatsGram' }, { text: 'YouTube', url: 'https://youtube.com/intotechmods' }],
      [{ text: 'Developer', url: 'https://t.me/BeastAvin' }, { text: 'TG Channel', url: 'https://t.me/aspcheat' }]]
    }
  }
));

const restart = async (ctx) => {
  if (ctx) await ctx.replyWithMarkdown('Restarting...', { disable_notification: true })
  else tgbot.telegram.sendMessage(config.TG_OWNER_ID, 'Restarting...', { disable_notification: true })
  await client.destroy();
  await client.initialize();
}
tgbot.command('restart', ctx => restart(ctx)); // Restart WhatsApp Client using TG Bot.
setInterval(() => restart(), 1000 * 60 * 60 * 12); // Auto restart WhatsApp client every 12 hours.

tgbot.on("message", (ctx) => { // Listen TG Bot messages and take action
  handleTgBot(ctx, client, MessageMedia);
});

client.on("message", async (message) => { // Listen incoming WhatsApp messages and take action
  try {
    handleMessage(message, config.TG_OWNER_ID, tgbot, client);
  } catch (error) {
    console.log(err)
  }
});

client.on('message_create', async (msg) => { // Listen outgoing WhatsApp messages and take action
  if (msg.body == "!alive") { // Alive command
    msg.delete(true)
    const aliveMsgData = await alive();
    client.sendMessage(msg.to, new MessageMedia(aliveMsgData.mimetype, aliveMsgData.data, aliveMsgData.filename), { caption: aliveMsgData.startMessage })
  } else {
    handleCreateMsg(msg, client, MessageMedia);
  }
})

/*
client.on('media_uploaded', async (msg) => {
    //if(config.SELF_LOGS != "true") return;
    
    var chat = await msg.getChat();
    const name = `${chat.isGroup ? `[GROUP] ${chat.name}`
                : `<a href="https://wa.me/${msg.to.split("@")[0]}?chat_id=${msg.to.split("@")[0]}&message_id=${msg.id.id}"><b>${chat.name}</b></a>`
                }`;

    const dlmedia = await msg.downloadMedia();
    console.log('Media uploaded: '+dlmedia);
    if(dlmedia) {
        const mediaInfo = await getMediaInfo(msg);
        const fname = './' + (dlmedia.filename || mediaInfo.fileName).replaceAll(' ', '_');
        const messageData = {
      document: { source: fname },
      options: { caption: 'You -> ' + name + (msg.body ? '\n\n<b>Caption:</b>\n\n' + msg.body : ''), disable_web_page_preview: true, parse_mode: "HTML" }
        }
        console.log('FileName: '+fname);
        fs.writeFile(fname, dlmedia.data, "base64", (err) => {
  if(err) console.log(err);
  else mediaInfo.tgFunc(config.TG_OWNER_ID, messageData.document, messageData.options)
        .then(() => { exec('rm '+fname, (data, err) => { if(err) console.log(err); }) });
        });
    }
})
*/
client.on('incoming_call', async (callData) => {
  tgbot.telegram.sendMessage(config.TG_OWNER_ID,
    '<b>CALL RECIEVED :</b>' + '\n\n' +
    '<b>By (ID) : </b><code>' + callData.id + '</code>\n' +
    '<b>Who called (peerJid) : </b><code>' + callData.peerjid + '</code>\n' +
    '<b>Is Video Call : </b><code>' + callData.isVideo + '</code>\n' +
    '<b>Is Group : </b><code>' + callData.isGroup + '</code>\n' +
    '<b>CanHandleLocally : </b><code>' + callData.canHandleLocally + '</code>\n' +
    '<b>Is Outgoing : </b><code>' + callData.isOutgoing + '</code>\n' +
    '<b>webClientShouldHandle : </b><code>' + callData.webClientShouldHandle + '</code>\n' +
    ((callData.participants) ? '<b>Participants : </b><code>' + callData.participants + '</code>' : '')
    , { parse_mode: "HTML" });
})

client.on("disconnect", (issue) => {
  console.log("WhatsApp has been disconnected due to" + issue + ". Please restart your dyno or do npm start.");
});

tgbot.launch(); // Initialize Telegram Bot
client.initialize(); // Initialize WhatsApp Client
