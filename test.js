// const { Deta } = require('deta'); // import Deta
// const fs = require('fs');
// const config = require('./config');

// const deta = Deta(config.DETA_PROJECT_KEY);

// const whatsGramDrive = deta.Drive('WhatsGram');

// const put = async () => {
//     try {
//         const res = await whatsGramDrive.put('session.zip', {path: './session.zip'});
//         console.log(res);
//     } catch (err) {
//         console.log(err);
//     }
// }

// const get = async () => {
//     try {
//         const res = await whatsGramDrive.get('session.zip');
//         const buffer = await res.arrayBuffer();
//         fs.writeFileSync('./session1.zip', Buffer.from(buffer));
//         console.log(res);
//     } catch (err) {
//         console.log(err);
//     }
// }

// whatsGramDrive.delete('session.zip');

// // get()
