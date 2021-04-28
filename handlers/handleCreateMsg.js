const { MessageMedia } = require('whatsapp-web.js');
const short =  require("../modules/short");

const handleCreateMsg = async (msg , client) => {
    if(msg.fromMe) {
        if(msg.body.startsWith("!short")){
            msg.delete(true);
            short(msg.body.split('!short ')[1]).then(url => {
            client.sendMessage(msg.to, `${url.startsWith("https://") ? `Here is the shorten URL ${url}` : 'PLease send a valid url to short.'}`);
            })
        }
    }
}

module.exports = handleCreateMsg;