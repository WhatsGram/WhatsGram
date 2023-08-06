import { Bot, InputFile } from "grammy"
import { TG_BOT_TOKEN, TG_OWNER_ID } from "../config"
import { getIds } from "../utils/message"
import {
    ignoreOld,
    onlyAdmin,
    onlyPublic,
    onlySuperAdmin,
    sequentialize,
} from "grammy-middlewares";


const bot = new Bot(TG_BOT_TOKEN)

// Set bot commands on start
const cmd = (cmd: string, desc: string) => ({command: cmd, description: desc});
try{
    bot.api.setMyCommands([cmd('start', 'Start bot.'), cmd('mar', 'Mark message as read.'), cmd('send', 'Ex: /send 918888888888 Hello!'), cmd('update', 'Update UB.'), cmd('restart', 'Restart ub.')]);
}catch(e){
    console.error('Failed to set commands.');
}

// ============================ { Public Commands } ============================

// Start Command
bot.command(
    'start', 
    ctx => ctx.reply(
        `Hey **${ctx.message?.from.first_name}**, Welcome! \nI can notify you about new messages of WhatsApp. \n\nPowered by [WhatsGram](https://github.com/WhatsGram/WhatsGram).`,
        {
            disable_web_page_preview: true,
            parse_mode: 'MarkdownV2',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: 'WhatsGram Repo', url: 'https://github.com/WhatsGram/WhatsGram' },
                        { text: 'Support Group', url: 'https://t.me/assupportchat' }
                    ],
                    [
                        { text: 'Developer', url: 'https://github.com/siddiquiaffan' },
                        { text: 'Donate', url: 'https://ko-fi.com/affanthebest' }
                    ]
                ]
            }
        }
    )
)



// ============================ { Admin Commands } ============================

bot.use(
    ignoreOld(),
    onlyAdmin(ctx => ctx.reply('Only Admins can use this command!')),
)

bot.command(
    'mar',
    async ctx => {
        const ids = getIds(ctx)
        if(!ids) return ctx.reply('Reply to a message to mark it as read.')

        const { waChatId } = ids
        // await ctx.api.sendMessage(waChatId, '/read ' + waMessageId)
        ctx.reply('Marked as read.')
    }
)



// ============================ { Methods uisng bots } ============================
const sendText = async (text: string) => {
    try {
        const res = await bot.api.sendMessage(TG_OWNER_ID, text, { parse_mode: 'MarkdownV2' })
        return res
    } catch (error: any) {
        console.error(error)
        return { error: error?.message ?? 'Failed to send message.' }
    }
}

const sendFile = async (file: InputFile) => {
    try {
        const res = await bot.api.sendDocument(TG_OWNER_ID, file)
        return res
    } catch (error: any) {
        console.error(error)
        return { error: error?.message ?? 'Failed to send file.' }
    }
}

export const utils = { sendText }

if(process.env.NODE_ENV !== 'production') {
    bot.start()
}

export default bot