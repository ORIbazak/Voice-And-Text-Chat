const AGORA_ID = "569bb4d904c84bbba6cf04176c12fda3";


toggle_btn.style.backgroundImage = 'static/images/unmute.png';


    let uid=  (Math.floor(Math.random() * 10000) + 1).toString(); //generate uid for each user

let token =null; //paramater of agora io client init

let localTracks =[]; //array that will hold the local microphone tracks



async function joinROOMinit(){
    client = AgoraRTC.createClient({mode:'rtc',codec:'vp8' }) //init agora client
    // with vp8 encoding with real-time-communication mode
    await client.join(AGORA_ID,room_id  , token, uid);
    //join the agora channel

    await joinCall();

    //client event listener that runs astronomically to the application
    client.on('user-published', handleUserPublished)
    client.on('user-left',handleUserDisconnect)
}


let joinCall = async ()=>{
    //record microphone audio and publish it to the channel
    localTracks = await AgoraRTC.createMicrophoneAudioTrack();
    localTracks.setEnabled(false); //mic starts muted
    await client.publish(localTracks);

}

let handleUserPublished =  async (user)=>{
    //handles user transmitting audio, it subscribes the audio and plays it in his audio div if exists
    // and creates a new one if no appropriate div exists.

    await client.subscribe(user,'audio');

    let audioDiv;
    audioDiv = document.getElementById(user.uid);
    if(!audioDiv)
    {
        audioDiv = document.createElement('audio');
        audioDiv.id = user.id;
    }
    //deafen functionality based on boolean changed it toggle headset
    setInterval(() => {
        console.log(deafen);
    if (deafen) {
        user.audioTrack.stop()
    } else {
        user.audioTrack.play();
    }
}, 100);


}


let handleUserDisconnect = async (user)=>
{
    //handles user leaving, deletes it audio div
    delete document.getElementById(user.uid);
}



let togglemic = async ()=> {//muting and umuting the mic
    if (muted) {
        muted = false;
        await localTracks.setEnabled(true);
        toggle_btn.classList.remove("muteClass")
        toggle_btn.classList.add("unmuteClass")
    } else {
        muted = true;
        await localTracks.setEnabled(false);
        toggle_btn.classList.remove("unmuteClass");
        toggle_btn.classList.add("muteClass");
    }
}

let toggle_headset =async  ()=>{//deafen boolea and css implementation
if(deafen)
{
    deafen = false;
    deafen_btn.classList.remove("UnDeafenClass")
    deafen_btn.classList.add("DeafenClass");
}
else {
    deafen = true;

    deafen_btn.classList.remove("DeafenClass")
    deafen_btn.classList.add("UnDeafenClass")


}
}

function leaveCall() //disconnects from agora channel
{
    client.leave(function() {
    console.log('Left channel Successfully');
  }, function(err) {
    console.error('Failed to leave channel:', err);
  });
}

//button event listener for mute and deafen:
toggle_btn.addEventListener("click",togglemic);

deafen_btn.addEventListener("click",toggle_headset);



//join the call asynchronously and init all the functions:
joinROOMinit();










