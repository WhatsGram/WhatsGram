const { TG_OWNER_ID, TG_BOT_TOKEN } = require("../config.js");
const { updateHerokuApp, restartDyno } = require("../modules/heroku");
const axios = require('axios');
const fs = require('fs');

const getMediaInfo = (msg) => {
  const mediaType = msg.photo ? 'photo' : msg.video ? 'video' : msg.audio ? 'audio' : msg.voice ? 'voice' : msg.sticker && !msg.sticker.is_animated ? 'sticker' : 'document';
  const mediaObj = msg[mediaType];
  const [type, mimeType, SAD, fileName, fileId, caption, SAV] = [mediaType, mediaObj.mime_type ? mediaObj.mime_type : '', false, null, mediaObj.file_id ? mediaObj.file_id : mediaObj[0].file_id, msg.caption ? msg.caption : '', mediaType == 'voice'];
  switch (mediaType) {
    case 'photo': return { type, mimeType: 'image/png', SAD, fileName, fileId, caption, SAV }; break;
    case 'video': return { type, mimeType, SAD, fileName, fileId, caption, SAV }; break;
    case 'audio': return { type, mimeType, SAD, fileName, fileId, caption, SAV }; break;
    case 'voice': return { type, mimeType, SAD, fileName, fileId, caption, SAV }; break;
    case 'sticker': return { type, mimeType: 'image/webp', SAD, fileName, fileId, caption, SAV, SAS: true }; break;
    default: return { type, mimeType, SAD: true, fileName: mediaObj.file_name ? mediaObj.file_name : null, fileId, caption, SAV }; break;
  }
}

const handleTgBot = async (ctx, client, MessageMedia) => {
  const sendMsgToWa = async (msg, chatId, msgId) => {
    if (!msg.text && chatId) {
      const mediaInfo = await getMediaInfo(msg);
      const fileInfo = await ctx.telegram.getFile(mediaInfo.fileId);
      const base64Data = await Buffer.from(((await axios.get(`https://api.telegram.org/file/bot${TG_BOT_TOKEN}/${fileInfo.file_path}`, { responseType: 'arraybuffer' })).data)).toString('base64');
      const fileData = new MessageMedia(mediaInfo.mimeType, base64Data, mediaInfo.fileName);
      client.sendMessage(chatId, fileData, { quotedMessageId: msgId ? msgId : null, sendMediaAsDocument: mediaInfo.SAD, sendAudioAsVoice: mediaInfo.SAV, caption: mediaInfo.caption, sendMediaAsSticker: mediaInfo.SAS });
    } else {
      const message = msg.text.startsWith('/send') ? msg.text.split(chatId.split('@')[0])[1].trim() : msg.text;
      client.sendMessage(chatId, message, { quotedMessageId: msgId ? msgId : null });
    }
  }
  const getIds = () => {
    const url_string = () => {
      if (ctx.message.reply_to_message.caption_entities) {
        return ctx.message.reply_to_message.caption_entities[0].url
      }
      if (ctx.message.reply_to_message.entities) {
        return ctx.message.reply_to_message.entities[0].url
      }
    }
    const url = new URL(url_string());
    const getChatId = url.searchParams.get("chat_id");
    const getWaMessageId = url.searchParams.get("message_id");
    const waChatId = getChatId.includes("-") ? `${getChatId}@g.us` : `${getChatId}@c.us`;
    const waMessageId = `false_${waChatId}_${getWaMessageId}`;
    return waChatId ? { waChatId, waMessageId } : null;
  }
  const tgResponse = msg => {
    ctx.reply(msg, { reply_to_message_id: ctx.message.message_id, allow_sending_without_reply: true });
  }

  if (ctx.message.from.id == TG_OWNER_ID) {
    if (ctx.message.reply_to_message) {
      if (ctx.message.text === '/mar' && getIds().waChatId) {
        client.sendSeen(getIds().waChatId);
      } else if (ctx.message.text && ctx.message.text.startsWith('/send')) {
        const chatId = ctx.message.text.split(' ')[1].trim() + '@c.us';
        sendMsgToWa(ctx.message.reply_to_message, chatId).then(() => tgResponse('Message sent successfully.'));
      } else if (getIds().waChatId) {
        sendMsgToWa(ctx.message, getIds().waChatId, getIds().waMessageId).then(() => tgResponse('Replied successfully.'));
      }
    } else if (ctx.message.text.startsWith('/send')) {
      const chatId = ctx.message.text.split(' ')[1].trim() + '@c.us';
      sendMsgToWa(ctx.message.reply_to_message ? ctx.message.reply_to_message : ctx.message, chatId);
    } else if (ctx.message.text === '/update') {
      updateHerokuApp().then(result => {
        const message = `**${result.message}** ${result.status ? 'It may take some time so have patient.\n\n**Build Logs:** [CLICK HERE](' + result.build_logs + ')' : ''}`;
        ctx.reply(message, { parse_mode: "markdown", disable_web_page_preview: true, reply_to_message_id: ctx.update.message.message_id, allow_sending_without_reply: true });
      })
    } else if (ctx.message.text === '/restart') {
      restartDyno().then(result => {
        const message = `**${result.message}**`;
        ctx.reply(message, { parse_mode: "markdown", disable_web_page_preview: true, reply_to_message_id: ctx.update.message.message_id, allow_sending_without_reply: true });
      })
    } else {
      ctx.reply("Reply to a message to send reply on WhatsApp");
    }
  } else {
    // ctx.reply('You\'re not allowed to this')
  }
}

module.exports = handleTgBot;