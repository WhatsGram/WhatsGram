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

const tgbot = new Telegraf(config.TG_BOT_TOKEN);

const SESSION_FILE_PATH = "./session.json";
let sessionData;
if (process.env.SESSION_DATA) {
  if (!fs.existsSync("session.json")) {
    fs.writeFileSync("session.json", process.env.SESSION_DATA);
  } else {
    const sessionFile = fs.readFileSync("session.json", "utf8");
    if (sessionFile == null || sessionFile == undefined || sessionFile == "")
      fs.writeFileSync("session.json", process.env.SESSION_DATA);
  }
  sessionData = require(SESSION_FILE_PATH);
} else if (fs.existsSync(SESSION_FILE_PATH)) {
  const sessionFile = fs.readFileSync("session.json", "utf8");
  if (sessionFile != null && sessionFile != undefined && sessionFile != "")
    sessionData = require(SESSION_FILE_PATH);
} else {
  console.log("Session data not. PLease fill it in heroku vars.");
}

const client = new Client({
  session: sessionData,
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
      process.exit();
    }, 90 * 1000);
  });
  client.on("authenticated", async (session) => {
    if(config.HEROKU_APP_NAME && config.HEROKU_API_KEY){
      await setHerokuVar('SESSION_DATA' , JSON.stringify(session)).then(result => {
        if(result.message == errorMsg) 
          tgbot.telegram.sendMessage(config.TG_OWNER_ID, "`"+JSON.stringify(session)+"`", {parse_mode: "markdown"});
      })
    }
    sessionData = await session;
    await console.log( JSON.stringify(session) + "\n\nCopy above session and set it to heroku vars as SESSION_DATA" );
    await fs.writeFileSync("session.json", JSON.stringify(session));
  });
  client.on("logout", () => {
    console.log( "Looks like you've been logged out. Please generate session again." );
    if (fs.existsSync("session.json")) fs.unlinkSync("session.json");
  });
}

if (!sessionData) {
  console.log("Session data not found. Generating QR please wait...");
  generateQr();
} else {
  console.log("Session data found. Logging in....");
  tgbot.telegram.sendMessage(config.TG_OWNER_ID, "Session data found. Logging in....", {disable_notification: true});
}

client.on("auth_failure" , reason => {
  if(fs.existsSync('session.json')) fs.unlinkSync('session.json')
  const message = 'Failed to authenticate the client. Please fill env var again or generate session.json again. Generating session data again...';
  console.log(message);
  tgbot.telegram.sendMessage(config.TG_OWNER_ID , message ,
    {disable_notification: true})
  generateQr();
})

client.on("ready", () => {
  const message = "Successfully logged in. Ready to rock!";
  console.log(message);
  tgbot.telegram.sendMessage( config.TG_OWNER_ID, message, {disable_notification: true});
  if (fs.existsSync("qr.png")) fs.unlinkSync("qr.png");
});

tgbot.on("message", (ctx) => {
  handleTgBot(ctx , client , MessageMedia);
});

client.on("message", async (message) => {
  handleMessage(message , config.TG_OWNER_ID , tgbot);
});

client.on('message_create' , async (msg) => {
  if (msg.body == "!alive") { // Alive command
    msg.delete(true)
    var aliveMsgData = await alive(await client.info.getBatteryStatus(), client.info.phone)
    client.sendMessage(msg.to, new MessageMedia(aliveMsgData.mimetype, aliveMsgData.data, aliveMsgData.filename), { caption: aliveMsgData.startMessage })
  }else{
    handleCreateMsg(msg , client , MessageMedia);
  }
})

client.on("disconnect", (issue) => {
  console.log( "WhatsApp has been disconnected due to" + issue + ". Please restart your dyno or do npm start." );
});

tgbot.launch();
client.initialize();
