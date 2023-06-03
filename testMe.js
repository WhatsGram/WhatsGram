const http = require('http');
const { createCanvas, registerFont } = require('canvas');

function getCurrentTime() {
    return new Promise((resolve, reject) => {
        const options = {
            host: 'worldtimeapi.org',
            path: '/api/timezone/Asia/Kolkata',
        };

        http.get(options, (response) => {
            let data = '';
            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                const result = JSON.parse(data);
                const datetime = result.datetime;
                const date = datetime.substring(0, 10);
                const time = datetime.substring(11, 16);
                resolve([date, time]);
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}

function generatePFP() {
    const imageWidth = 500;
    const imageHeight = 500;

    registerFont('C:/Users/PC/source/Repos/WhatsGram/bm.ttf', { family: 'Your Font' });
    registerFont('C:/Users/PC/source/Repos/WhatsGram/lmn.otf', { family: 'Your Quote Font' });

    const canvas = createCanvas(imageWidth, imageHeight);
    const context = canvas.getContext('2d');

    getCurrentTime().then(([currentDate, currentTime]) => {
        // Parse current time and add 1 minute
        const [hours, minutes] = currentTime.split(':').map(Number);
        let updatedMinutes = minutes + 1;
        let updatedHours = hours;

        if (updatedMinutes === 60) {
            updatedMinutes = 0;
            updatedHours++;
        }

        // Convert updatedHours to 12-hour format
        updatedHours = (updatedHours % 12) || 12; // Adjust hours to 12-hour format

        // Add leading zero for hours less than 10
        const formattedHours = updatedHours < 10 ? `0${updatedHours}` : updatedHours;
        const updatedTime = `${formattedHours}:${updatedMinutes < 10 ? '0' : ''}${updatedMinutes}`;

        console.log(updatedTime)

        const timeFontSize = 220;
        const quoteFontSize = 50;
        const textColor = 'white';

        context.fillStyle = 'black';
        context.fillRect(0, 0, imageWidth, imageHeight);

        context.font = `${timeFontSize}px 'Your Font'`;
        context.fillStyle = textColor;
        context.textBaseline = 'middle';
        context.textAlign = 'center';
        context.fillText(updatedTime, imageWidth / 2, imageHeight / 2 - 30);

        context.font = `${quoteFontSize}px 'Your Quote Font'`;
        context.fillText(currentDate, imageWidth / 2, imageHeight / 2 + 100);

        const buffer = canvas.toBuffer('image/png');
        const fs = require('fs');
        fs.writeFileSync('./time_image.png', buffer);
    });
}

async function getQuote() {
    try {
        let quote = {};
        let character = '';
        let quoteText = '';

        while (quoteText.length > 139 || !quoteText) {
            const response = await fetch("http://animechan.melosh.space/random/anime?title=naruto");
            quote = await response.json();
            ({ character, quote: quoteText } = quote);
        }

        console.log('Character:', character);
        console.log('Quote:', quoteText);

        return { character, quote: quoteText };
    } catch (error) {
        console.error(error);
        return { character: '', quote: '' };
    }
}

async function waitAsyncFunction() {
    const result = await getQuote();
    console.log(result);
}

// waitAsyncFunction()
generatePFP();