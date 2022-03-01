const qrcode = require("qrcode-terminal");
const fs = require("fs");
var fse = require("fs-extra");
require("dotenv").config();
var QRCode = require("qrcode");
const {Client , MessageMedia, LocalAuth, ClientInfo} = require("whatsapp-web.js");
const { Telegraf } = require("telegraf");
const config = require("./config");
const alive = require('./modules/alive');
const handleMessage = require("./handlers/handleMessage");
const handleCreateMsg = require("./handlers/handleCreateMsg");
const handleTgBot = require("./handlers/handleTgbot");
const extract = require('extract-zip')
const { zip, COMPRESSION_LEVEL } = require('zip-a-folder');
const { Deta } = require('deta'); 

// Globals
const deta = Deta(config.DETA_PROJECT_KEY);
const whatsGramDrive = deta.Drive('WhatsGram');

let status = 'pending';
const tgbot = new Telegraf(config.TG_BOT_TOKEN);

const client = new Client({ // Create client.
  authStrategy: new LocalAuth({
    dataPath: './WWebJS'
  }),
  puppeteer: { headless: false, args: ["--no-sandbox"] },
});

const saveSessionToDb = async () => {
  if(fs.existsSync('./WWebJS')){
    try{
      console.log(`Session folder found, compressing...`);
      await zip('./WWebJS', './session.zip', {compression: COMPRESSION_LEVEL.high});
      console.log(`Compressed successfully, saving to db...`);
      await whatsGramDrive.put('session.zip', {path: './session.zip'});
      fs.unlinkSync('./session.zip');
      console.log(`Saved to db successfully!`);
      return true
    }catch(err){
      console.log('Failed to save session to database');
      console.log(err);
      return false
    }
  }
}

const getSession = async () => {
  try{
    if(!fs.existsSync('./WWebJS')){
      console.log('Getting session from database...');
      const result = await whatsGramDrive.get('session.zip');
      if(result){
        const buffer = await result.arrayBuffer();
        fs.writeFileSync('./session.zip', Buffer.from(buffer));
        await extract('./session.zip', { dir: __dirname +'/WWebJS' })
        fs.unlinkSync('./session.zip');
        console.log('Session retrieved successfully! Initiating session...');
        return true
      }
      console.log('No session found in database. Re initiating session...');
      return false
    }
    return true
  }catch(err){
    console.log("Failed to get session from database");
    console.log(err);
    return false
  } finally{
    client.initialize();
  }
}
getSession();

// Set bot commands. 
const cmd = (cmd, desc) => ({command: cmd, description: desc});
tgbot.telegram.setMyCommands([cmd('start', 'Start bot.'), cmd('mar', 'Mark message as read.'), cmd('send', 'Ex: /send ph_no message'), cmd('update', 'Update UB.'), cmd('restart', 'Restart ub.')]);

async function generateQr() {
  client.on("qr", async (qr) => {
    await console.log("Kindly check your telegram bot for QR Code.");
    await QRCode.toFile("qr.png", qr);
    await tgbot.telegram.sendPhoto(
      config.TG_OWNER_ID, { source: "qr.png" } , { caption: "Scan it in within 20 seconds...." }
    );
    await qrcode.generate(qr, { small: true });
    setTimeout(() => {
      console.log("Didn't found any response, exiting...");
      return 
    }, 90 * 1000);
  });

  client.on("authenticated", (session) => { // Take action when user Authenticated successfully.
    console.log("Authenticated successfully.");
    console.log(session); 
  });

  client.on("logout", () => { // Take action when user logout.
    console.log( "Looks like you've been logged out. Please generate session again." );
    whatsGramDrive.delete('session.zip');
  });
}

client.on("auth_failure" , reason => { // If failed to log in.
  const message = 'Failed to authenticate the client. Please fill env var again or generate session.json again. Generating session data again...';
  console.log(message);
  tgbot.telegram.sendMessage(config.TG_OWNER_ID , message ,
    {disable_notification: true})
  whatsGramDrive.delete('session.zip');
  client.initialize();
})

client.on("ready", async () => { // Take actin when client is ready.
  const message = "Successfully logged in. Ready to rock!";
  if(status != 'saved'){
    // await client.destroy();
    // await new Promise(resolve => setTimeout(resolve, 1000));
    // await saveSessionToDb();
    // await new Promise(resolve => setTimeout(resolve, 1000));
    // status = 'saved';
    // client.options.puppeteer.userDataDir = null;
    // client.initialize();
    return 
  }else{
    console.log(message);
    tgbot.telegram.sendMessage( config.TG_OWNER_ID, message, {disable_notification: true});
    if (fs.existsSync("qr.png")) fs.unlinkSync("qr.png");
  }
});

// Telegram Bot
tgbot.start(ctx => ctx.replyWithMarkdown(`Hey **${ctx.message.from.first_name}**, Welcome! \nI can notify you about new messages of WhatsApp. \n\nPowered by [WhatsGram](https://github.com/WhatsGram/WhatsGram).`,
  {disable_web_page_preview: true,
   reply_markup:{
    inline_keyboard: [[{text:'WhatsGram Repo', url:'https://github.com/WhatsGram/WhatsGram'},{text:'Support Group', url:'https://t.me/assupportchat'}],
                      [{text:'Developer', url:'https://github.com/AffanTheBest'}, {text:'Donate', url:'https://ko-fi.com/affanthebest'}]]
  }}
));
tgbot.command('donate', ctx => { // Donate Command
  ctx.replyWithMarkdown('Thank you for showing intrest in donating! \nYou can donate me using following methods 👇\n\n*UPI Address*: `siddiquiaffan201@okaxis` \n\nOr you can use following links.',
  {disable_web_page_preview: true,
   reply_markup:{
     inline_keyboard: [[{text: 'Ko-fi', url: 'https://ko-fi.com/affanthebest'}, {text: 'Paypal', url: 'https://paypal.me/affanthebest'}]]
  }})
});
const restart = async (ctx) => {
  if (ctx) await ctx.replyWithMarkdown('Restarting...', {disable_notification: true})
  else tgbot.telegram.sendMessage(config.TG_OWNER_ID, 'Restarting...', {disable_notification: true})
  await client.destroy();
  await client.initialize();
}
tgbot.command('restart', ctx => restart(ctx)); // Restart WhatsApp Client using TG Bot.
setInterval(() => restart(), 1000 * 60 * 60 * 12); // Auto restart WhatsApp client every 12 hours.

tgbot.on("message", (ctx) => { // Listen TG Bot messages and take action
  handleTgBot(ctx , client , MessageMedia);
});

client.on("message", async (message) => { // Listen incoming WhatsApp messages and take action
  handleMessage(message , config.TG_OWNER_ID , tgbot, client);
});

client.on('message_create' , async (msg) => { // Listen outgoing WhatsApp messages and take action
  if (msg.body == "!alive") { // Alive command
    msg.delete(true)
    const info = new ClientInfo()
    const aliveMsgData = await alive(info);
    client.sendMessage(msg.to, new MessageMedia(aliveMsgData.mimetype, aliveMsgData.data, aliveMsgData.filename), { caption: aliveMsgData.startMessage })
  }else{
    handleCreateMsg(msg , client , MessageMedia);
  }
})

client.on("disconnect", (issue) => {
  console.log( "WhatsApp has been disconnected due to" + issue + ". Please restart your dyno or do npm start." );
});

tgbot.launch(); // Initialize Telegram Bot