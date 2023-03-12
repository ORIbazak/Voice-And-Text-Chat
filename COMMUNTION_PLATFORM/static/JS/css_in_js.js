
function rainbowStyle() {
  //function that return different color each call
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  if (color[1] === '0' || color[3] === '0' || color[5] === '0')
  {
    return rainbowStyle()
}

    return color;

}
const static_greet = document.getElementsByClassName("static-intro"); //get all the elements  (welcome to..)that need rainbow style

setInterval(function() {
  if(static_greet) {
    for(let element of static_greet)
    {
      element.style.color = rainbowStyle(); //change the color text every 0.3 seconds
    }
  }
  }, 300);


const colorClass = ['purple-placeholder','blue-placeholder','green-placeholder','red-placeholder'] //color class (to change placeholders)
let index =0;

const enter_usernames = document.getElementsByClassName("user-placeholder") //get all textbooks that will change placeholder color

for(let element of enter_usernames)
{
  element.classList.add("purple-placeholder") //give a stating color class
}
const indexes = []
for(let i =0; i<enter_usernames.length;i++)
{
  indexes[i]=0; //start array to all 0
}


setInterval(function (){
  // run a for function that runs in the background and changes the placeholder color on each element that has the class "user-placeholder"
  for(let i=0;i<enter_usernames.length;i++)
  {
    enter_usernames[i].classList.remove(colorClass[indexes[i]])
    indexes[i] = (indexes[i] + 1) % colorClass.length;

    enter_usernames[i].classList.add(colorClass[indexes[i]]);

  }


},300);
