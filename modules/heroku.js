const axios = require('axios');
const {HEROKU_APP_NAME , HEROKU_API_KEY} = require('../config.js')
const buildData = {
    buildpacks: [
    ],
    source_blob: {
      url: "https://github.com/WhatsGram/WhatsGram/tarball/main",
      version: "main"
    }
}
const headers = {
    Accept: 'application/vnd.heroku+json; version=3',
    Authorization: 'Bearer '+ HEROKU_API_KEY
}

const notHerokuApp = 'Heroku app not found. If it is then please check heroku vars.';
const errorMsg = 'An error has been occurred , please check heroku vars and try again.';

const updateHerokuApp = async () => {
    let output = {};
    try{
        if(HEROKU_APP_NAME && HEROKU_API_KEY) {
            const updateRequest = (await axios({method:'POST',url:'https://api.heroku.com/apps/'+ HEROKU_APP_NAME +'/builds',data: JSON.stringify(buildData) , headers: headers}));
            if(updateRequest && updateRequest.status == 201){
                output = {status: true, message: 'Updating....', build_logs: updateRequest.data.output_stream_url }
            }
        }else{
            output = {status: false, message: notHerokuApp, build_logs: ''}
        }
    }catch(err){
        output = {status: false, message: errorMsg, build_logs: ''}
    }
    return output;
}

const restartDyno = async () => {
    let output = {};
    try {
        if(HEROKU_APP_NAME && HEROKU_API_KEY) {
            const restartRequest = (await axios({method: 'DELETE', url: `https://api.heroku.com/apps/${HEROKU_APP_NAME}/dynos/worker`, headers: headers}));
            if(!restartRequest || restartRequest.status === 202){
                output = { status: true, message: 'Restarting... Please wait!'}
            }else{
                output = {status: false, message: 'Failed to restart. PLease try again later.'}
            }
        }else{
            output = { status: false, message: notHerokuApp}
        }
    }catch(err){
        output = { status: false, message: errorMsg}
    }
    return output;
}

const setHerokuVar = async (varName, varValue) => {
    let output = {};
    try{
        if(HEROKU_APP_NAME && HEROKU_API_KEY){
            const vars = {}; const prop = varName; vars[prop] = varValue;
            const updateVarReq = (await axios.patch(`https://api.heroku.com/apps/${HEROKU_APP_NAME}/config-vars`, vars, {headers:headers}));
            if(updateVarReq && updateVarReq.status === 200) output = {status: true, message: 'Env var added successfully!'};
            }else{
                output = { status: false, message: notHerokuApp};
            }
    }catch(e) {
        output = {status: false, message: errorMsg};
    }
    return output;
}

module.exports = {headers , errorMsg, updateHerokuApp , restartDyno, setHerokuVar}