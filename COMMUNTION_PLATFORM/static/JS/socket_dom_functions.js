
//description for the socket_dom_function in the socket event_listener


function handle_msg(data) {
    //a socket_dom_function
    console.log(data);
        const msg = document.createElement('div');
        const encryped = data.msg;
        const plaintext = decrypt(encryped,room_id);
        msg.innerHTML = `<b>${data.username}:&nbsp;</b> ${plaintext}`;
        if(data.username===user_name) {
            msg.classList.add("my-message")
        }
        else {
            msg.classList.add('remote-message')
        }
        msg.classList.remove("message-static");
        chat_box.appendChild(msg);

}

let handle_new_user = function (data) {

    //a socket_dom_function


        const greeting  = document.createElement('div');
        users_lst.push(data.username);
        greeting.innerHTML = `Look Whos Here!  ${data.username}'s here!!!!'`
         greeting.style.fontWeight = "normal";
        document.getElementById('history-log').appendChild(greeting);

        greeting.classList.add("logs");
        const user = document.createElement('div');
        user.id = `${data.username}`
        user.innerHTML = `${data.username}`;
        user.style.fontWeight= "normal"



        document.getElementById('current-members').appendChild(user);


    }


let handle_user_leaving = function (data)
{
    //a socket_dom_function
    console.log(data.username, "has left the room")
            const greeting = document.createElement('div')
    greeting.style.fontWeight = "normal";

    if(!data['kicked']) {
        greeting.innerHTML = data['disconnect-announcement']
        document.getElementById('history-log').appendChild(greeting);
    }
    else
    {
        greeting.innerHTML = data['kick-announcement']
        document.getElementById('history-log').appendChild(greeting);

    }

            const left = document.getElementById(`${data.username}`);

            users_lst = users_lst.filter(element => element !== data.username )

            document.getElementById('current-members').removeChild(left);
}






let load_members_to_DOM= function (data){
//a socket_dom_function
        users_lst = data['users'];
        let member;
        if(data.username!== host_name) {
            users_lst.forEach(function (item) {
                member = document.createElement('div');
                member.id = item;
                member.innerHTML = item;
                member.style.fontWeight = "normal";



                document.getElementById('current-members').appendChild(member);

            })
        }

    }
