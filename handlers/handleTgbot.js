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
        client.sendMessage(waChatId, ctx.message.text, {
          quotedMessageId: waMessageId,
        });
      } else {
        ctx.reply("Reply to a message to send reply on WhatsApp");
      }
}

module.exports = handleTgBot;