const {removeBackgroundFromImageBase64 } = require('remove.bg');
const config = require('../config');

const removebg = async (base64img ) => {
  try {
    const result = await removeBackgroundFromImageBase64({
      base64img,
      apiKey: config.REMOVE_BG_API,
      size: "regular"
    });
    return {status: true, img: result.base64img}
  } catch (e) {
    return {status: false, error: e}
  }
}

module.exports = removebg;