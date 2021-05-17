const axios = require('axios');
const validUrl = require('valid-url');

const short = async(url) => {
    if(validUrl.isUri(url)){
        const res = await axios.get('https://is.gd/create.php?format=json&url='+url);
        return await res.data.shorturl;
    }else{
        return 'Please send valid Url to short.'
    }
}

module.exports = short;