const config = require("./../config");
const fs = require("fs");
const extract = require("extract-zip");
const { zip, COMPRESSION_LEVEL } = require("zip-a-folder");
const { Deta } = require("deta");

// Globals
const deta = Deta(config.DETA_PROJECT_KEY);
const whatsGramDrive = deta.Drive("WhatsGram");
let sessionInDb = false;

// Save session to database
const saveSessionToDb = async () => {
  if (fs.existsSync("./WWebJS")) {
    try {
      console.log(`Session folder found, compressing...`);
      await zip("./WWebJS", "./session.zip", {
        compression: COMPRESSION_LEVEL.high,
      });
      console.log(`Compressed successfully, saving to db...`);
      await whatsGramDrive.put("session.zip", { path: "./session.zip" });
      fs.unlinkSync("./session.zip");
      console.log(`Saved to db successfully!`);
      sessionInDb = true;
      return true;
    } catch (err) {
      console.log("Failed to save session to database");
      console.log(err);
      return false;
    }
  }
};

// Get session from database
const getSession = async (initClient) => {
  try {
    if (!fs.existsSync("./WWebJS")) {
      console.log("Getting session from database...");
      const result = await whatsGramDrive.get("session.zip");
      if (result) {
        const buffer = await result.arrayBuffer();
        fs.writeFileSync("./session.zip", Buffer.from(buffer));
        await extract("./session.zip", { dir: __dirname + "/WWebJS" });
        fs.unlinkSync("./session.zip");
        console.log("Session retrieved successfully! Initiating session...");
        sessionInDb = true;
        return true;
      }
      console.log("No session found in database. Re initiating session...");
      return false;
    } else {
      console.log("Initiating session...");
    }
    return true;
  } catch (err) {
    console.log("Failed to get session from database");
    console.log(err);
    return false;
  } finally {
    initClient();
  }
};

module.exports = { saveSessionToDb, getSession, sessionInDb };
