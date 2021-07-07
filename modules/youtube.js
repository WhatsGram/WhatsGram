const axios = require('axios');

const getId = (url) => {
    let id;
    if (url.startsWith("https://youtu.be/")) {
        id = url.split("/").pop();
    } else if (url.startsWith("https://www.youtube.com/watch?v=")) {
        id = url.replace("https://www.youtube.com/watch?v=", "").replace("&" + url.split("&")[1], "")
    }
    return id
}

const getYtAudio = async(url) =>{
    const id = getId(url);
    const res = await axios.get(`https://www.yt-download.org/api/widget/mp3/${id}`);
    const data = res.data.split(`<a href="https://www.yt-download.org/download/${id}/mp3/256`)[1].split('</a>')[0];
    const size = data.split('<div class="text-shadow-1">').pop().split('</div>')[0];
    const audioUrl = `https://www.yt-download.org/download/${id}/mp3/256` + data.split('" ')[0];
    try{
        if(size.split(' ')[1] == 'MB' && parseInt(size.split(' ')[0]) > 100){
            return {status: 'File size size exceeded.', msg: 'File size exeeds limit.\n\n*Direct download link:*\n```👉 ' + audioUrl + '```'}
        }else{
            const name = res.data.split('<h2 class="text-lg text-teal-600 font-bold m-2 text-center">')[1].split('</h2>')[0]
            const audio = Buffer.from(((await axios.get(audioUrl, { responseType: 'arraybuffer' })).data)).toString('base64');
            return {status: true, audio, name}
        }
    }catch(e){
        return {status: false, msg: 'Failed to download audio. Make sure yt link is correct.'}
    }
}

const getYtVideo = async(url) => {
    const id = getId(url);
    const res = await axios.get(`https://www.yt-download.org/api/widget/merged/${id}`);
    const data = res.data.split(`<a href="https://www.yt-download.org/download/${id}/merged`);
    data.shift();
    const name = res.data.split('<h2 class="text-lg text-teal-600 font-bold m-2 text-center">')[1].split('</h2>')[0];
    let urls = '';
    data.map(vid => urls += `\n${vid.split('<div class="text-shadow-1">')[1].split('</div>')[0].trim()} ${vid.split('<div class="text-xl font-bold text-shadow-1 uppercase">')[1].split('</div>')[0]} - https://www.yt-download.org/download/${id}/merged` + vid.split('</a>')[0].split('" ')[0] )
    function getInfo(){
        try{
            let d = data.find(x => 
                parseInt(x.split('</a>')[0].split('<div class="text-shadow-1">')[1].split('</div>')[0].trim()) <= 720 && 
                parseInt(x.split('</a>')[0].split('<div class="text-shadow-1">').pop().split('</div>')[0].trim()) <= 50
            ); 
            const size = d.split('<div class="text-shadow-1">').pop().split('</div>')[0].trim()
            const url = `https://www.yt-download.org/download/${id}/merged${d.split('</a>')[0].split('" ')[0]}`;
            return {status: 'found', size, url}
        }catch(e) {
            return {status: 'not found'}
        }
    }

    try{
        const info = getInfo();
        if(info.status == 'found'){
            const video = Buffer.from(((await axios.get(info.url, { responseType: 'arraybuffer' })).data)).toString('base64');
            return {status: true, video, name}
        }else{
            return {status: 'File size size exceeded.', msg: 'File size exeeds limit.\n\n*Direct download link:*\n```👉 ' + urls + '```'}
        }
    }catch(e){
        return {status: false, msg: 'Failed to download video. Make sure yt link is correct.'}
    }
}

const getYtDownloadUrl = async(url) => {
    const id = getId(url);
    const fetchVideoUrl = async(id) => {
        const res = await axios.get(`https://www.yt-download.org/api/widget/merged/${id}`);
        const data = res.data.split(`<a href="https://www.yt-download.org/download/${id}/merged`);
        data.shift();
        const name = res.data.split('<h2 class="text-lg text-teal-600 font-bold m-2 text-center">')[1].split('</h2>')[0];
        let urls = [];
        data.map(vid => {
            if(`${vid.split('<div class="text-xl font-bold text-shadow-1 uppercase">')[1].split('</div>')[0]}` != 'webm'){
                urls.push({
                        url: `https://www.yt-download.org/download/${id}/merged` + vid.split('</a>')[0].split('" ')[0],
                        quality: `${vid.split('<div class="text-shadow-1">')[1].split('</div>')[0].trim()}`,
                        size: `${vid.split('<div class="text-shadow-1">').pop().split('</div>')[0].trim()}`
                })}
        })
        return {urls, name};
    }

    const fetchAudioUrl = async(id) => {
        const res = await axios.get(`https://www.yt-download.org/api/widget/mp3/${id}`);
        const data = res.data.split(`<a href="https://www.yt-download.org/download/${id}/mp3/256`)[1].split('</a>')[0];
        const size = data.split('<div class="text-shadow-1">').pop().split('</div>')[0];
        const urls = [ { url: `https://www.yt-download.org/download/${id}/mp3/256` + data.split('" ')[0], size } ];
        return {urls, size};
    }

    try{
        const v = fetchVideoUrl(id);
        const a = fetchAudioUrl(id);
        const videoUrls = await v;
        const audioUrls = await a;
        let finalMsg = `Download links for *${videoUrls.name}*\n\n`; 
        videoUrls.urls.map((url, i) => i == 0 ? finalMsg += `*Videos:* \n${url.quality} ${url.size} - ${url.url}` : finalMsg += `\n${url.quality} ${url.size} - ${url.url}`)
        finalMsg += `\n\n*Audios:* \n256kbps ${audioUrls.urls[0].size} - ${audioUrls.urls[0].url}`
        return {status: 'found', msg: finalMsg }; 
    }catch(e){
        return {status: 'not found', msg: 'Failed to extract links. Make usre yt link is correct.'}
    }
}

module.exports = {getYtAudio, getYtVideo, getYtDownloadUrl};