import './app'
import { getSession } from './utils/session'
import waClient from './clients/whatsapp'

async function main() {
    await getSession()

    // Start the bot
}

main()