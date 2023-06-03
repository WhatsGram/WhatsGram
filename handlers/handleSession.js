const fs = require("fs");
const extract = require("extract-zip");
const { zip, COMPRESSION_LEVEL } = require("zip-a-folder");
const { Deta } = require("deta");
const path = require("path");
const fse = require("fs-extra");

// Globals
const deta = Deta('d0Pb9WKzH7ew_SmG4V4jjgpBEXT6o3aDgjDYHiCk4cLKP');
const whatsGramDrive = deta.Drive("WhatsGram");
let sessionInDb = false;
const { log } = console;

// Save session to database
const saveSessionToDb = async () => {
  if (fs.existsSync("./WWebJS")) {
    try {
      log("Saving session to DB... \nCopying session folder...");
      fse.copySync("./WWebJS", "./WWebJS-Copy", { overwrite: true });
      log(`Compressing...`);
      await zip("./WWebJS-Copy", "./session.zip", {
        compression: COMPRESSION_LEVEL.high,
      });
      log(`Compressed successfully, saving to db...`);
      await whatsGramDrive.put("session.zip", { path: "./session.zip" });
      fs.unlinkSync("./session.zip");
      log(`Saved to db successfully!`);
      sessionInDb = true;
      fse.removeSync("./WWebJS-Copy");
      return true;
    } catch (err) {
      log("Failed to save session to database");
      log(err);
      return false;
    }
  }
};

// Get session from database
const getSession = async (initClient) => {
  try {
    if (!fs.existsSync("./WWebJS")) {
      log("Getting session from database...");
      const result = await whatsGramDrive.get("session.zip");
      if (result) {
        const buffer = await result.arrayBuffer();
        fs.writeFileSync("./session.zip", Buffer.from(buffer));
        await extract("./session.zip", {
          dir: path.join(__dirname, "../WWebJS"),
        });
        fs.unlinkSync("./session.zip");
        log("Session retrieved successfully! Initiating session...");
        sessionInDb = true;
        await new Promise((res) => setTimeout(res, 2000));
        initClient();
        return true;
      }
      log("No session found in database. Re initiating session...");
      return false;
    } else {
      log("Initiating session...");
    }
    return true;
  } catch (err) {
    log("Failed to get session from database");
    log(err);
    return false;
  }
};

module.exports = { saveSessionToDb, getSession, sessionInDb };