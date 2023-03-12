function build_home_url() //function  that build the URL based of the IP and the PORT of the server
{
    let home_url = ""
    home_url+="https://"
    home_url+=IP_ADDR;
    home_url+=":";
    home_url+= PORT.toString()
    return home_url;
}
 home_url = build_home_url();




    function clear_chat()
    //a function that clear the chatbox from messages (removes all the child div messages)
    {
            while(chat_box.children.length)
            {
                chat_box.removeChild(chat_box.lastChild);
            }

    }

    const copy_btn = document.getElementById("copy_btn");
//a button event listener that copies the roomid to the clipboard if triggered
    copy_btn.addEventListener("click",function ()
    {
          const div = document.createElement('input');
        div.value = room_id;
        document.body.appendChild(div);
        div.select();
        document.execCommand('copy');
        document.body.removeChild(div);

    })