const {TG_OWNER_ID , TG_BOT_TOKEN} = require("../config.js");
const {updateHerokuApp , restartDyno} = require("../modules/heroku");
const axios = require('axios');
const fs = require('fs');

const handleTgBot = async (ctx , client , MessageMedia) => {
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
       if(ctx.message.text === '/mar') {
          client.sendSeen(waChatId);
        }else if( (ctx.message.photo || ctx.message.video || ctx.message.audio || ctx.message.document) && waChatId){
          const getMediaInfo = (msg) => {
            const mediaObjKey = Object.keys(msg)[Object.keys(msg).length-1];
            const mediaObj = msg[mediaObjKey];
            switch (mediaObjKey) {
              case 'photo': return {mimeType: 'image/png', sendAsDocument: false, fileName: '', fileId: mediaObj[0].file_id}; break;
              case 'video': return {mimeType: mediaObj.mime_type, sendAsDocument: false, fileName: mediaObj.file_name, fileId: mediaObj.file_id}; break;
              case 'audio': return {mimeType: mediaObj.mime_type, sendAsDocument: false, fileName: mediaObj.file_name, fileId: mediaObj.file_id}; break;
              default: return {mimeType: mediaObj.mime_type, sendAsDocument: true, fileName: mediaObj.file_name ? mediaObj.file_name : null, fileId: mediaObj.file_id}; break;
            }
          }
          // const isPhoto = ctx.message.photo ? true : false;
          // const isDocument = ctx.message.document ? true : false;
          // const receivedDoc = isPhoto ? ctx.message.photo[0] : ctx.message[Object.keys(ctx.message)[Object.keys(ctx.message).length-1]];
          const mediaInfo = await getMediaInfo(ctx.message);
          const fileInfo = await ctx.telegram.getFile(mediaInfo.fileId);
          const base64Data = await Buffer.from(((await axios.get(`https://api.telegram.org/file/bot${TG_BOT_TOKEN}/${fileInfo.file_path}`, { responseType: 'arraybuffer' })).data)).toString('base64');
          const fileData = new MessageMedia(mediaInfo.mimeType, base64Data , mediaInfo.fileName);
          client.sendMessage(waChatId, fileData, { quotedMessageId: waMessageId, sendMediaAsDocument: mediaInfo.sendAsDocument});
        }else{
          client.sendMessage(waChatId, ctx.message.text, { quotedMessageId: waMessageId });
        }
        console.log("Replied to specified message.");
      }else if(ctx.message.text === '/update') {
        updateHerokuApp().then(result => {
          const message = `**${result.message}** ${result.status ? 'It may take some time so have patient.\n\n**Build Logs:** [CLICK HERE]('+result.build_logs+')' : ''}`;
          ctx.reply( message , { parse_mode: "markdown", disable_web_page_preview: true, reply_to_message_id:ctx.update.message.message_id, allow_sending_without_reply:true});
      })}else if(ctx.message.text === '/restart') {
        restartDyno().then(result => {
          const message = `**${result.message}**`;
          ctx.reply( message , { parse_mode: "markdown", disable_web_page_preview: true, reply_to_message_id:ctx.update.message.message_id, allow_sending_without_reply:true});
      })}else {
        ctx.reply("Reply to a message to send reply on WhatsApp");
      }
}

module.exports = handleTgBot;