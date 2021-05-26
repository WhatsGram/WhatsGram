const {TG_OWNER_ID} = require("../config.js");
const {updateHerokuApp} = require("../modules/heroku");

const handleTgBot = (ctx , client) => {
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
       if(ctx.message.text === '/mar') {
          client.sendSeen(waChatId);
        }else{
          client.sendMessage(waChatId, ctx.message.text, {
            quotedMessageId: waMessageId,
          });
        }
      }else if(ctx.message.text === '/update') {
        console.log(ctx.message.text);
        updateHerokuApp().then(result => {
          const message = `**${result.message}** ${result.status ? 'It may take some time so have patient.\n\n**Build Logs:** [CLICK HERE]('+result.build_logs+')' : ''}`;
          ctx.reply( message , { parse_mode: "markdown", disable_web_page_preview: true, reply_to_message_id:ctx.update.message.message_id, allow_sending_without_reply:true});
      })} else {
        ctx.reply("Reply to a message to send reply on WhatsApp");
      }
}

module.exports = handleTgBot;