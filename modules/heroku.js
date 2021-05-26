const axios = require('axios');
const {HEROKU_APP_NAME , HEROKU_API_KEY} = require('../config.js')
const buildData = {
    buildpacks: [
    ],
    source_blob: {
    //   url: "https://github.com/WhatsGram/WhatsGram/tarball/main",
      url: "https://github.com/AffanTheBest/test-repo/tarball/main",
      version: "main"
    }
}
const headers = {
    Accept: 'application/vnd.heroku+json; version=3',
    Authorization: 'Bearer '+ HEROKU_API_KEY
}

const updateHerokuApp = async () => {
    let output = {};
    try{
        if(HEROKU_APP_NAME && HEROKU_API_KEY) {
            const updateRequest = (await axios({method:'POST',url:'https://api.heroku.com/apps/'+ HEROKU_APP_NAME +'/builds',data: JSON.stringify(buildData) , headers: headers}));
            if(updateRequest && updateRequest.status == 201){
                output = {
                    status: true,
                    message: 'Updating....',
                    build_logs: updateRequest.data.output_stream_url
                }
            }
        }else{
            output = {
                status: false,
                message: 'Not a heroku app. If it is then please check heroku vars.',
                build_logs: ''
            }
        }
    }catch(err){
        output = {
            status: false,
            message: 'Some error occurred, please check heroku vars and try again.',
            build_logs: ''
        }
    }
    return output;
}

module.exports = {updateHerokuApp}