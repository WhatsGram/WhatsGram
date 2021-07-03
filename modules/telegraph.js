const axios = require('axios');
const FormData = require('form-data');

const telegraph = async (data) => {
    let media = new FormData();
    media.append('file', Buffer.from(data.data, 'base64'), {
        filename: `Telegraph.${data.mimetype.split('/').pop()}`
    })
    const headers = media.getHeaders();
    try{
        const res = await axios.post('https://telegra.ph/upload', media, {headers});
        return {status: true, url: `https://telegra.ph${res.data[0].src}`}
    }catch(e){
        return {status: false}
    }
}

module.exports = telegraph;