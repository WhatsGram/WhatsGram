import { Client , MessageMedia, LocalAuth, ClientInfo } from "whatsapp-web.js"
import { utils as tgBotUtil } from '../clients/bot'
import { writeFileSync } from "fs";

let client = new Client({ // Create client.
    authStrategy: new LocalAuth({
      dataPath: './session'
    }),
    puppeteer: { headless: true, args: ["--no-sandbox"] },
});


client.on('disconnected', async () => {
    console.log('Client was logged out')
    client.destroy()

    await initClient()
})

client.on('qr', (qr: string) => {
    console.log('QR RECEIVED', qr)
    writeFileSync('qr.png', qr, 'base64')
})

export async function initClient () {
    client.initialize()

    return new Promise((resolve, reject) => {

        client.on('ready', () => {
            console.log('Client is ready!')
            tgBotUtil.sendText(`Whatsapp client is ready.`)

            resolve(client)
        })

        client.on('authenticated', () => {
            tgBotUtil.sendText(`Whatsapp client authenticated.`)
        })

        client.on('auth_failure', () => {
            console.log('Failed to authenticate whatsapp client.')
            tgBotUtil.sendText(`Failed to authenticate whatsapp client.`)
            
            reject('Failed to authenticate whatsapp client.')
        })

    })
}

export default client