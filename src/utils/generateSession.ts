import { initClient } from "../clients/whatsapp"
import { saveSession } from "./session" 

async function generate() {
    await initClient()
    await saveSession()
}

generate()