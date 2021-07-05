var QRCode = require("qrcode");
const FormData = require("form-data");
const { default: axios } = require("axios");

const genQr = async (text) => {
    try{
        const qr = await QRCode.toDataURL(text);
        return {status: true, qr: qr.split(',')[1]}
    }catch(e){
        return {status: false, msg: 'Failed to create qr 😕'}
    }
}

const readQr = async(data) => {
    let form = new FormData();
    form.append('file', Buffer.from(data.data, 'base64'), {
        filename: `qr.${data.mimetype.split('/').pop()}`,
    });
    const headers = form.getHeaders();
    try{
        const res = await axios.post('http://api.qrserver.com/v1/read-qr-code/', form, {headers})
        return {status: true, data: res.data[0].symbol[0].data}
    }catch(e){
        return {status: false}
    }
}

module.exports = {genQr, readQr};