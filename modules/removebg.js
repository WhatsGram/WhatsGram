const fs = require('fs');
const config = require('../config');
// var request = require('request');

const removebg = async (imgData) => {
  fs.writeFileSync('image.png', imgData , 'base64');
  var imageData;
    request.post({
    url: 'https://api.remove.bg/v1.0/removebg',
    formData: {
      image_file: fs.createReadStream('image.png'),
      size: 'auto',
    },
    headers: {
      'X-Api-Key': config.REMOVE_BG_API
    },
    encoding: null
  },async function(error, response, body) {
    if(error) return console.error('Request failed:', error);
    if(response.statusCode != 200) return console.error('Error:', response.statusCode, body.toString('utf8'));
    fs.writeFileSync("Removebg@WhatsGram.png", body);
    if(fs.existsSync('image.png')) fs.unlinkSync('image.png');

  });

  console.log(imageData);

}

module.exports = removebg;