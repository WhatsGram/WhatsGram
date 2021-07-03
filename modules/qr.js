var QRCode = require("qrcode");

const genQr = async (text) => {
    try{
        const qr = await QRCode.toDataURL(text);
        return {status: true, qr: qr.split(',')[1]}
    }catch(e){
        return {status: false, msg: 'Failed to create qr 😕'}
    }
}

module.exports = genQr;