const {DB_URL} = require('../config');
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
const path = require('path');
const config = require('../config');

// Set Pm Message
async function setPmMsg(pmMsg, method){
    try{
        var setPm = await MongoClient.connect(DB_URL, {useNewUrlParser: true, useUnifiedTopology: true});
        method == 'update' ? 
        await setPm.db('WhatsGram').collection('pmguard').updateOne({name: 'pmMsg'}, {$set: {pmMsg: pmMsg}}) : 
        await setPm.db('WhatsGram').collection('pmguard').insertOne({name: 'pmMsg', pmMsg: pmMsg});
        return 'success'
    }catch(err){
        return 'failed'
    }finally{
        setPm.close();
    }
}

// Read Pm Message
async function readPmMsg(){
    try{
        var read = await MongoClient.connect(DB_URL, {useNewUrlParser: true, useUnifiedTopology: true});
        var result = await read.db('WhatsGram').collection('pmguard').find({name: 'pmMsg'}).toArray();
        if(result[0] == undefined){
            return '';
        }else{
            return {
                status: 'found',
                name: 'pmMsg',
                msg: result[0].pmMsg
            }
        }
    }catch(err){
        return ''
    }finally{
        read.close();
    }
}

// Update data in DB
async function updateData(id, msgCount) {
    try {
        var update = await MongoClient.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
        await update.db("WhatsGram").collection("pmguard").updateOne({ number: id }, { $set: { msgCount: msgCount } })
        return "updated_success"

    } catch (err) {
        return "failed_to_update"
    } finally {
        update.close();
    }
}

// Read data from DB
async function readDb(id) {

    try {
        var read = await MongoClient.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
        var result = await read.db("WhatsGram").collection("pmguard").find({ number: id }).toArray()
        if (result[0] != undefined) {
            return ({
                status: "found",
                number: result[0].number,
                msgCount: result[0].msgCount,
                allowed: result[0].allowed
            })
        } else {
            return ({status: "not_found"})
        }
    } catch (err) {
        return "failed_to_read"
    } finally {
        read.close();
    }
}

// Add data to db
async function addToDb(id) {
    try {
        var addData = await MongoClient.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
        await addData.db("WhatsGram").collection("pmguard").insertOne({ number: id, msgCount: 1, allowed: false })
        return "added"
    } catch (err) {
        return "failed_to_add"
    } finally {
        addData.close();
    }
}

//Allow user to pm
async function allow(id) {
    try {
        var update = await MongoClient.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
        await update.db("WhatsGram").collection("pmguard").updateOne({ number: id }, { $set: { msgCount: 1, allowed: true } })
        fs.readFile(path.join(__dirname, `../temp/${id}.json`), { encoding: 'utf8' },
            async function(err, data) {
                if (err) {
                    fs.writeFile(path.join(__dirname, `../temp/${id}.json`), JSON.stringify({
                        status: "found",
                        number: id,
                        msgCount: 1,
                        allowed: true
                    }), (ert) => {
                        if (ert) {
                            console.log(ert)
                        } else {}
                    })
                } else {
                    fs.unlink(path.join(__dirname, `../temp/${id}.json`), async function(e) {
                        if (e) {} else {
                            fs.writeFile(path.join(__dirname, `/tempdata/${id}.json`), JSON.stringify({
                                status: "found",
                                number: id,
                                msgCount: 1,
                                allowed: true

                            }), (err) => {
                                if (err) {
                                    console.log(err)
                                } else {}
                            })
                        }
                    })
                }
            })
    } catch (err) {
        return "error"
    } finally {
        update.close();
    }
}

// Disallow user to Pm you.
async function disAllow(id) {
    try {
        var updatewrite = await MongoClient.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
        await updatewrite.db("WhatsGram").collection("pmguard").updateOne({ number: id }, { $set: { msgCount: 1, allowed: false } })
        fs.readFile(path.join(__dirname, `../temp/${id}.json`), { encoding: 'utf8' },
            async function(err, data) {
                if (err) {} else {
                    fs.unlinkSync(path.join(__dirname, `../temp/${id}.json`))
                }
            })
    } catch (err) {
        return "error"
    } finally {
        updatewrite.close();
    }
}

// Handle Pm messages.
async function handlePm(id, user) {
    async function checkfile(id) {
        try {
            return JSON.parse(await fs.readFileSync(path.join(__dirname, `../temp/${id}.json`), { encoding: 'utf8' }))
        } catch (error) {
            return await readDb(id)
        }
    }
    var read = await checkfile(id);
    var pmMsg = await readPmMsg();
    if (read.status == "not_found") {  
        var insertdb = await addToDb(id)
        if (insertdb == "failed_to_add") {
            return "error"
        } else {
            return {
                action: false,
                msg: pmMsg ? pmMsg.msg.replace(/\{name}/gi, user).replace(/\{wanrs}/gi, read.msgCount ? read.msgCount : 0) + '\n\nPowered by *WhatsGram*' : `Hello, *${user}*!\nMy Master is Busy As Of Now, You Can Wait For Sometime.\nIf He Needs To Talk To You, He Will Approve You!\nAnd do not spam else you will be muted/blocked.\n\nPowered by *WhatsGram*`
            }
        }
    } else if (read.status == "found" && read.allowed == false) { 
        if (read.msgCount == 4) {
            return {
                action: true,
                msg: `You have been automatically ${config.PMGUARD_ACTION == 'mute' ? 'muted' : 'blcked'} for spamming.`
            }
        } else { 
            var update = await updateData(id, Number(read.msgCount) + 1)
            if (update == "failed_to_update") {
                return "error"
            } else {
                return {
                    action: false,
                    msg: pmMsg ? pmMsg.msg.replace(/\{name}/gi, user).replace(/\{warns}/gi, read.msgCount ? read.msgCount : 0) + '\n\nPowered by *WhatsGram*' :  `Hello, *${user}*!\nMy Master is Busy As Of Now, You Can Wait For Sometime.\nIf He Needs To Talk To You, He Will Approve You!\nYou Have *${read.msgCount}/3 Of Warns*. And do not spam else you will be muted/blocked.\n\nPowered by *WhatsGram*`
                }
            }
        }
    } else if (read.status == "found" && read.allowed == true) {
        fs.readFile(path.join(__dirname, `../temp/${id}.json`), { encoding: 'utf8' },
            async function(err, data) {
                if (err) {
                    fs.writeFile(path.join(__dirname, `../temp/${id}.json`), JSON.stringify({
                        status: "found",
                        number: id,
                        msgCount: 1,
                        allowed: true
                    }), (ert) => {})
                } else {}
            })
        return "allowed"
    }
}

module.exports = { handlePm, allow, disAllow, setPmMsg, readPmMsg }