const ocrSpace = require('ocr-space-api-wrapper');
const {OCR_SPACE_API_KEY} = require('../config');

const parseText = async(imgData) => {
    try{
        const res = await ocrSpace(`data:image/png;base64,${imgData}`, {apiKey: OCR_SPACE_API_KEY});
        const extractedText = res.ParsedResults[0].ParsedText;
        return 'Here is the extracted text 👇\n\n' + extractedText;
    }catch(e){
        console.log(e);
        return '*Error:* Failed to extract text. Make sure you\'ve passed correct image.';
    }
}

module.exports = parseText;