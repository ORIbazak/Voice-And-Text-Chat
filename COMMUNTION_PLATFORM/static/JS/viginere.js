
function get_key_arr(plaintext)
{
    //sub-function
    //input: a string plaintext
    // output: an array containing each character of the input string
    let arr = [];
    for(let char of plaintext)
    {
        arr.push(char);
    }
    return arr;
}
function getNumKeY(key)
{
    //sub-function
    //input: a string key representing the encryption key
    // output: a string containing only the numerical digits of the input string key
    let string ="";
    for(let char of key)
    {
        if(!isNaN(char))
        {
            string+=char;
        }
    }
    return string;
}

function ascii(ascii_arr)
{
    //input: an array ascii_arr of characters
    // output: an array of ASCII codes corresponding to the characters in the input array
    let asc_arr=[];
    for (const char of ascii_arr)
    {
        asc_arr.push(char.charCodeAt(0));
    }
    return asc_arr;
}
function str_arr_int(arr)
{
    //input: an array arr of strings representing decimal numbers
    // output: a new array containing the corresponding integers for each string in the input array
    let newArr = [];
    for (let char of arr)
    {
        newArr.push(parseInt(char,10));
    }
    return newArr;
}
function encrypt(plainMessage, key)
// input: plain text and encryption key
//output: encrypted text with my VIGINERE encryption
{
    let encrypted = "";
    let key_arr= get_key_arr(getNumKeY(key));
    key_arr = str_arr_int(key_arr);
     const ascii_arr = str_arr_int(ascii(plainMessage),10);
    for(let i=0;i<plainMessage.length;i++)
    {
        let difference = (ascii_arr[i]-key_arr[i%key_arr.length]);

        encrypted+=String.fromCharCode(difference);


    }
    return encrypted;

}


function decrypt(encrypedMessage,key)
{
    //input: encrypted message and encryption key
    //output: plaintext
    let plaintext= "";
    let key_arr= get_key_arr(getNumKeY(key));
    key_arr = str_arr_int(key_arr);
    for(let i=0; i<encrypedMessage.length;i++)
    {
        let ascii = encrypedMessage[i].charCodeAt(0);
        let origin = String.fromCharCode(ascii+key_arr[i%key_arr.length]);
        plaintext+=origin;
    }
    return plaintext


}
