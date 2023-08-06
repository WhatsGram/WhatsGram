import { InputFile } from "grammy"
import bot from "../clients/bot"
import { TG_OWNER_ID } from "../config"
import axios from "axios"
import fs from "fs"
import path from "path"
import AdmZip from "adm-zip"

const sessionFilePath = path.join(process.cwd(), './session.zip');

/** A function to get session from telegram */
export const getSession = async (clear: boolean = false) => {
    
    if(clear) clearSession()

    try {

        if (!process.env.SESSION_FILE_ID) throw new Error("SESSION_FILE_ID is not provided");

        const file = await bot.api.getFile(process.env.SESSION_FILE_ID)
    
        if(!file) throw new Error('Failed to get session file.')
    
        const filePath = file.file_path
        const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${filePath}`
    
        const res = await axios.get(fileUrl, { responseType: 'stream' })
    
        // write file to session.zip
        const writeStream = fs.createWriteStream(sessionFilePath);
        res.data.pipe(writeStream);
    
        await new Promise((resolve, reject) => {
          writeStream.on('finish', resolve);
          writeStream.on('error', reject);
        });

        if(!fs.existsSync(sessionFilePath)) throw new Error('Failed to download session file.')

        console.log('Session file downloaded.')

        await extract(sessionFilePath, sessionFilePath.replace('.zip', ''))

        return true

    } catch (error: any) {
     
        console.error(error)
        throw new Error('Error downloading session file.')
        
    }

}



/** A function to create zip file of session folder and send it to telegram */
export const saveSession = async () => {
    
        try {
    
            const zip = new AdmZip();
            zip.addLocalFolder(sessionFilePath.replace('.zip', ''))
            zip.writeZip(sessionFilePath);
    
            const file = new InputFile(sessionFilePath)
            const res = await bot.api.sendDocument(TG_OWNER_ID, file)
    
            if(!res) throw new Error('Failed to send session file.')
            console.log('Session file sent.')
    
            return true
    
        } catch (error: any) {
            
            console.error(error)
            throw new Error('Error sending session file.')
    
        }
}



async function extract (file: string, folder: string) {
    const zip = new AdmZip(file);
    zip.extractAllTo(folder, true);

    return
}


async function clearSession () {
    try {
        fs.rmdirSync(sessionFilePath.replace('.zip', ''), { recursive: true })
        fs.unlinkSync(sessionFilePath)
    } catch (error: any) { }
}