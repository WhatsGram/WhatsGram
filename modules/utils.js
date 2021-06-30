const mute = async (chatId, unmuteStr, client) => {
    let unmuteTime;
    if(unmuteStr == Infinity){
        unmuteTime = new Date('December 17, 1995 03:24:00');
    }else{
        const mins =  unmuteStr.includes('m') ? unmuteStr.split('m')[0].split(' ').pop() * 60 : 0;
        const hrs = unmuteStr.includes('h') ? unmuteStr.split('h')[0].split(' ').pop() * 60 * 60 : 0;
        const days = unmuteStr.includes('d') ? unmuteStr.split('d')[0].split(' ').pop() * 60* 60 * 24 : 0;
        const weeks = unmuteStr.includes('w') ? unmuteStr.split('w')[0].split(' ').pop() * 60 * 60 * 24 * 7 : 0;
        unmuteTime = new Date();
        unmuteTime.setSeconds(mins + hrs + days + weeks);
    }
    try{
        await client.muteChat(chatId, unmuteTime);
        return {status: true, msg: `This chat has been muted until *${unmuteStr == Infinity ? 'Forever' : unmuteTime.toLocaleString()}*`}
    }catch(e){
        return {status: false, msg: 'Failed to mute chat. Check `!help mute` for more help.'}
    }
}

const unmute = async (chatId, client) => {
    try{
        await client.unmuteChat(chatId);
        return {status: true, msg: 'Chat unmuted successfully!'}
    }
    catch(e){
        return {status: false, msg: '*Error:* Failed to unmute chat.'}
    }
}

module.exports = {mute, unmute}