const axios = require('axios');

const genCarbon = async (text) => {
    const url = 'https://unofficialcarbon.herokuapp.com/api/?text='+encodeURIComponent(text);
    var base64Data = Buffer.from((await axios.get(url, {responseType: 'arraybuffer'})).data, 'binary').toString('base64');
    const carbon = {
        mimetype: 'image/png',
        data: base64Data,
        name: 'carbon',
    }
    return (carbon ? carbon : 'Failed to generate carbon');
}

module.exports = genCarbon;