const qrcode = require("qrcode-terminal");
const fs = require("fs");
require("dotenv").config();
var QRCode = require("qrcode");
const { Client, MessageMedia, GroupChat, ClientInfo } = require("whatsapp-web.js");
const { Telegraf } = require("telegraf");
const config = require("./config");
const alive = require('./modules/alive');
const short =  require("./modules/short");

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
  client.on("authenticated", (session) => {
    tgbot.telegram.sendMessage(
      config.TG_OWNER_ID, "`" + JSON.stringify(session).toString() + "` \n\nCopy above session and set it to heroku vars as SESSION_DATA", { parse_mode: "markdown" }
    );
    sessionData = session;
    console.log( JSON.stringify(session) + "\n\nCopy above session and set it to heroku vars as SESSION_DATA" );
    fs.writeFileSync("session.json", JSON.stringify(session));
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
  const message = 'Failed to authenticate the client. Please fill env var again or generate session.json again.';
  console.log(message);
  tgbot.sendMessage(config.TG_OWNER_ID , message ,
    {disable_notification: true})
})

client.on("ready", () => {
  const message = "Successfully logged in. Ready to rock!";
  console.log(message);
  tgbot.telegram.sendMessage( config.TG_OWNER_ID, message, {disable_notification: true});
  if (fs.existsSync("qr.png")) fs.unlinkSync("qr.png");
});

tgbot.on("message", (ctx) => {
  if (
    ctx.message.reply_to_message != undefined &&
    ctx.message.reply_to_message != null
  ) {
    const tempChatId = ( ctx.message.reply_to_message.text || ctx.message.reply_to_message.caption )
      .split("Sender Id : ")[1] .split(" ")[0];
    const waChatId = tempChatId.includes("-") ? `${tempChatId}@g.us` : `${tempChatId}@c.us`;
    const tempMessageId = ( ctx.message.reply_to_message.text || ctx.message.reply_to_message.caption )
      .split("Message Id: ")[1] .split(" ")[0];
    const waMessageId = `false_${waChatId}_${tempMessageId}`;
    console.log("Replied to specified message.");
    client.sendMessage(waChatId, ctx.message.text, {
      quotedMessageId: waMessageId,
    });
  } else {
    ctx.reply("Reply to a message to send reply on WhatsApp");
  }
});

client.on("message", async (message) => {
  const chat = await message.getChat();
  const chatType = chat.isGroup;
  const contact = await message.getContact(); 
  let name = contact.name || contact.pushname;
  console.log(name);
  const tgMessage = `New message arrived on WhatsApp from ${ chatType ? `*${chat.name}* | [${name}](https://wa.me/${ message.author.split("@")[0] })`
      : `[${chat.name}](https://wa.me/'${message.from.split("@")[0]})`
  }. \nSender Id : _${message.from.split("@")[0]}_ \nMessage Id: _${ message.id.id }_ \n\n${message.body ? `Message Body: \n ${message.body}` : ""}`;

  if (message.hasMedia) {
    await message.downloadMedia().then(async (data) => {
      const media = await new MessageMedia("image/png", data.data);
      fs.writeFile("image.png", data.data, "base64", (err) =>
        err ? console.error(err)
          : tgbot.telegram.sendPhoto(
              config.TG_OWNER_ID, { source: "image.png" },
              { caption: tgMessage, disable_web_page_preview: true, parse_mode: "markdown", }
            )
      );
      if (fs.existsSync("image.png")) fs.unlink("image.png");
    });
  } else if (!message.from.includes("status")) {
    tgbot.telegram.sendMessage(config.TG_OWNER_ID, tgMessage, 
      { parse_mode: "markdown", disable_web_page_preview: true, });
  }

});

client.on('message_create' , async (msg) => {
  if(msg.fromMe) {
    if(msg.body.startsWith("!short")){
      msg.delete(true);
      short(msg.body.split('!short ')[1]).then(url => {
        client.sendMessage(msg.to, `${url.startsWith("https://") ? `Here is the shorten URL ${url}` : 'PLease send a valid url to short.'}`);
      })
    } else if (msg.body == "!alive") { // Start command
      msg.delete(true)
      var aliveMsgData = await alive(await client.info.getBatteryStatus(), client.info.phone)
      client.sendMessage(msg.to, new MessageMedia(aliveMsgData.mimetype, aliveMsgData.data, aliveMsgData.filename), { caption: aliveMsgData.startMessage })
  }
  }
})

async function battery() {
  let info = client.info;
  let BatteryStatus = await info.getBatteryStatus();
  console.log('Battery status : ' + BatteryStatus);
}

client.on("disconnect", (issue) => {
  console.log( "WhatsApp has been disconnected due to" + issue + ". Please restart your dyno or do npm start." );
});

tgbot.launch();
client.initialize();
