import type { Context } from 'grammy'

/** Get media info from msg */
export const getMediaInfo = (msg: Context['message']) => {
    if(!msg) return null

    const mediaType = msg.photo ? 'photo' : msg.video ? 'video' : msg.audio ? 'audio' : msg.voice ? 'voice' : msg.sticker && !msg.sticker.is_animated ? 'sticker' : 'document'
    const mediaObj = msg[mediaType] as any
    
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


/** Get chat ids from url in message */
export const getIds = (ctx: Context) => {
    
    const url_string = () => {
      if (ctx.message?.reply_to_message?.caption_entities) {
        return (ctx.message.reply_to_message.caption_entities[0] as any).url
      }
      if (ctx.message?.reply_to_message?.entities) {
        return (ctx.message.reply_to_message.entities[0] as any).url
      }
    }

    const url = new URL(url_string());
    const waChatId = url.searchParams.get("chat_id");
    
    let waMessageId = url.searchParams.get("message_id");
    waMessageId = `false_${waChatId}_${waMessageId}`;
    
    return waChatId ? { waChatId, waMessageId } : null;

}