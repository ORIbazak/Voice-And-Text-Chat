

const socket = io.connect(home_url); // init a socket instance and connect to the socket server



//important to mention that all events send the room ID as one of the params so the server would
// know where to redirect the response

socket.on('connect', function () {
//function that triggers automatically after new socket connection is made, requesting the server to join a room
        console.log("connected");
        socket.emit('join_room', {

            username: user_name,
            room: room_id,
        });






        let input =  document.getElementById("messageBar")
        document.getElementById("chat-input").onsubmit = function (event)
   //event listener for the send_message button, encrypt the message and sends it to server with relevant params
        {
            event.preventDefault(); //prevent sending the message to the URL
            let message = input.value.trim();
            if (message.length)
            {

                message = encrypt(message,room_id);

                socket.emit('send message', {
            username: user_name,
            room: room_id,
            msg: message
            })
            }
            input.value = '';
            input.focus();    }
    });


socket.on('load_members',(data) => {
  // socket event that calls a function  takes a list from the server of preexisting members and add them to the DOM.
  load_members_to_DOM(data); //function written in socket_dom_functions.js
});



socket.on('join_room_announcement',(data)=>{
//socket event that class a function that add the new members name
// to current members and adds a welcome announcemt to the DOM
        handle_new_user(data); //function written in socket_dom_functions.js
    } );



function leaveRoom()
{
//function that alerts the server a connection wants to leave
// the room, closes the connection and navigates to homepage
    socket.emit('leave_room',{username:user_name,room:room_id});
    socket.disconnect();
    window.location =home_url;
}


leave_btn.addEventListener('click', (event) => {
    event.preventDefault();
 //function that handle a client wanting to leave the room
    let check = confirm("Are you sure you want to leave the room?");

    if (check) {
        if(users_lst.length>1) {
            //special case if the host wants to leave and there are other members in the room.
            //a popup shows  asking the host for a new host.
            // based of the hosts answer, a person can grant host permission (or no one) in handle_host_leaving ( function written host.js)
            handle_host_leaving();
        }


        leaveCall();
        setTimeout(leaveRoom, delay);
         //leaves AGORA channel , the Socket room and navigates from the URL
    }
});




socket.on('leave_room_announcement', function (data) {
    //a function that removes the member from the current memebrs div in the DOM and inits a message informing
    //other users he is gone
    handle_user_leaving(data) //function written in socket_dom_functions.js

        });





socket.on('receive_message',(data)=>{
    //socket event that gets the message from the server, decrypts it at and it to the chatbox
        handle_msg(data); //in socket_dom_functions.js
    } )



socket.on('kick', function (data) {
    //socket event that it triggered after the host emitted a kick event on  your sid.
    //the client is alerted, and emit a "post_kick' event to the server
        alert("THE HOST KICKED YOUUUU!!")
        setTimeout(function (){
            socket.emit('post_kick', {username: user_name, room: room_id, host:host_name})
            leaveCall(); // function written in audioJS

        },5000)
    //closes socket connectino and navigates the client to home_page
      setTimeout(function() {
socket.disconnect();
window.location = home_url;
      }, 8000);
    })


socket.on('force-mute',function (){
    //force mute event from the server, mutes the mic if it is not muted already.
                    if (!muted) {
                        togglemic() //function written in audio.js
                        alert("you have been muted by the host!")
                    }

            })




socket.on('grant-host',function () {
    //socket event that grants host permission (host-kick and host-mute)

host_permissions = true;
alert('you are not the host! congrats!');

    })
