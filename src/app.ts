import express from 'express'
import cors from 'cors'
import bot from './clients/bot'
import { webhookCallback } from 'grammy'

const app = express()
const port = process.env.PORT || 8080


app.use(express.json())
app.use(webhookCallback(bot, "express"));


if(process.env.HOST) {
    app.use(cors({
        origin: process.env.HOST,
    }))
}

app.get('/', (req, res) => {
    res.send('Hello World!')
})

// get complete url on get /set-bot-webhook
app.get('/set-webhook', async (req, res) => {
    const url = req.protocol + '://' + req.get('host') + '/bot'

    try {

        await bot.api.setWebhook(url)
        res.send(url)
        
    } catch (error: any) {
        if(error?.name == 'GrammyError') return res.status(400).send(error.description)
        console.error(error)
        res.status(500).send('Internal Server Error')
    }

})


app.listen(port, () => {
    console.log('Server started on port', port)
})