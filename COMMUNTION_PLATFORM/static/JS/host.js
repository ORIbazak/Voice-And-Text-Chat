let hostMute = document.getElementById("host-mute");
let hostKick = document.getElementById("host-kick")


//granting host permission to the user who holds the host_name
if (host_name===user_name){
    host_permissions = true;
}
    hostMute.innerHTML = "FORCEMUTE"
hostKick.innerHTML = "FORCEKICK"
    hostKick.disabled = !host_permissions; hostKick.hidden = !host_permissions
    hostMute.disabled = !host_permissions; hostMute.hidden = !host_permissions



//eventlistener for clicking on host-kick btn, asks for names to kick, convert the input to a name arr
// and emits validate and activate on the input if it is not null
hostKick.onclick = function ()
{
        const whoToKick = window.prompt("HOSTKICK: comma between each name")

    if(whoToKick) {
        if (whoToKick.trim().length > 0) {
            const kick_arr = handle_prompt(whoToKick);
            validate_and_activate(kick_arr, false)
        } else {
            alert("no one is getting kicked....wrong input perhaps?")
        }
    }

}


//event listener for clicking on host mute btn, asks for names to mute , converts the input to a name arr,
// and emits validate if the input it is not null
hostMute.onclick = function ()
{
    const whoToMute = window.prompt("Enter names to be muted with , between names");
    if(whoToMute) {
        if (whoToMute.trim().length > 0) {
            const mute_arr = handle_prompt(whoToMute);
            validate_and_activate(mute_arr, true)
        } else {
            alert("no one is getting muted....wrong input perhaps?")
        }
    }
}


//Interval for checking permissions, and granting host functionality if a client becomes the host
setInterval(function (){
  if(host_permissions)
  {
    hostMute.disabled = false; hostMute.hidden = false;
    hostKick.disabled= false;hostKick.hidden = false;


  }
},200);


//takes a string that contain ame seperated by commas  prompt and returns a name array
let handle_prompt = function (str)
{
    let arr = str.split(",")
    arr.forEach(function (element)
    {
        element = element.trim()
    })
    return arr;
}


//function that checks the entered names: if the name exists in users_lst (a list holding the usernames),
// it emits the mute member or the kick with his name as the param if it exists (type of events based on a boolean
//input bool that determines from what event listener request came from.
let validate_and_activate = function (arr,bool)
{
    let once = false;
    arr.forEach(function (item)
    {
        if (users_lst.includes(item))
        {
            if (item !== host_name)
            {
                once = true;
                if (bool) {

                    socket.emit('mute-member', {mute_name: item, room: room_id, host: host_name})
                }
                 else {

                    socket.emit('kick-member', {kick_name: item, room: room_id, host: host_name})
                }

            }
            else
            {
                once = true;
                // if one of the names entered ia the host name
                // the host gets alert you cant emit host function on yourself
                if (bool) alert("you cannot mute yourself in this method!");
                else alert("you cannot kick yourself in this method!") ;

            }
        }

    })

        // if no event is being emitted, the host gets informed (response based on bool value and on the event listener ):
            if (!once &&bool)
            {
                alert("no one is getting Muted....wrong input perhaps?")
            }
            if(!once && !bool)
            {
                alert("no one is getting kicked....wrong input perhaps?")

            }

}

let handle_host_leaving = function () {
//a fucntion thatasks the user for a name to emit host permissions.


    if (host_permissions) {

        let name = prompt("Enter a user to inherit Host Permissions");
        if (name === '')
        {
            //if no name is entered, oldest_participant will get host permissions
            // (backend knows to connect name= 'Nan' to the oldest client)
            alert("Nothing Entered, oldest participant will get host permissions, type yourself to remove permission")

            socket.emit('pass-host', {username: 'NaN', room: room_id, host_name: host_name});

        } else {
            if(name === user_name)
            {
                alert("If you typed yourself, no one will get host!")
            }
            else {
                if( check_Valid(name))
                {

                    socket.emit('pass-host', {username: name, room: room_id, host_name: host_name});
                }
                else alert("Name not Valid, no one gets host")
                //alert the user if input is not valid
            }
            //emits the pass host event to the server if the name returns true in check_Valid (exists in the room)


        }
    }
}
let check_Valid = function (name)
//function that returns true if a name inside the prompt is not  the host's name  it exists in the room, false otherwise
{
    return(users_lst.includes(name.trim()) && name.trim()!==host_name);
}



