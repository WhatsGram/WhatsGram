const {TG_OWNER_ID , TG_BOT_TOKEN} = require("../config.js");
const {updateHerokuApp , restartDyno} = require("../modules/heroku");
const axios = require('axios');
const fs = require('fs');

const handleTgBot = async (ctx , client , MessageMedia) => {
  if(ctx.message.from.id == TG_OWNER_ID){
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
        }else if(!ctx.message.text && waChatId){
          const getMediaInfo = (msg) => {
            const mediaType = msg.photo ? 'photo' : msg.video ? 'video' : msg.audio ? 'audio' : msg.voice ? 'voice' : 'document'; 
            const mediaObj = msg[mediaType];
            const [type, mimeType, SAD, fileName, fileId, caption, SAV] = [mediaType,mediaObj.mime_type,false,null,mediaObj.file_id?mediaObj.file_id:mediaObj[0].file_id,msg.caption?msg.caption:'',mediaType=='voice'];
            switch (mediaType) {
              case 'photo': return {type, mimeType: 'image/png', SAD, fileName, fileId, caption,SAV}; break;
              case 'video': return {type, mimeType, SAD, fileName, fileId, caption, SAV}; break;
              case 'audio': return {type, mimeType, SAD, fileName, fileId, caption, SAV}; break;
              case 'voice': return {type, mimeType, SAD, fileName, fileId, caption, SAV}; break;
              default: return {type, mimeType, SAD: true, fileName: mediaObj.file_name ? mediaObj.file_name : null, fileId, caption, SAV}; break;
            }
          }
          const mediaInfo = await getMediaInfo(ctx.message);
          const fileInfo = await ctx.telegram.getFile(mediaInfo.fileId);
          const base64Data = await Buffer.from(((await axios.get(`https://api.telegram.org/file/bot${TG_BOT_TOKEN}/${fileInfo.file_path}`, { responseType: 'arraybuffer' })).data)).toString('base64');
          const fileData = new MessageMedia(mediaInfo.mimeType, base64Data , mediaInfo.fileName);
          client.sendMessage(waChatId, fileData, { quotedMessageId: waMessageId, sendMediaAsDocument: mediaInfo.SAD, sendAudioAsVoice:mediaInfo.SAV, caption:mediaInfo.caption });
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
  }else{
    ctx.reply('You\'re not allowed to this')
  }
}

module.exports = handleTgBot;