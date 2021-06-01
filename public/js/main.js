const socket = io();
const chatMessages = document.querySelector('.chat-messages')
const chatForm = document.querySelector('.btn-send')
let listOfActiveUsers = document.querySelector('#users')
let allActiveUsers = ""
const mainChat = document.querySelector('.chat-messages')
const chat1v1 = document.querySelector('.chat-messages1-1')
const showMainChat = document.querySelector('#show-chat')
let activeChat = "mainChat"
let user1v1="";
let currentUser1v1="";



chatForm.addEventListener('click', (e) => {
    e.preventDefault();
    let text = document.querySelector('#msg').value
    if(activeChat == "mainChat") {
        let msg = {"posiljaoc":localStorage.getItem('nick'),"vrijeme":new Date().toLocaleTimeString(),"text":text}
        socket.emit('newMessage',msg) 
    }else {
        let msg={"posiljaoc":localStorage.getItem('nick'),"primalac":user1v1,"vrijeme":new Date().toLocaleTimeString(),"poruka":text}
        socket.emit('new1v1Message',msg) 
    }
     document.querySelector('#msg').value = ""
     document.querySelector('#msg').focus();
})
socket.on('WelcomeMessage', msg => {
    outputMessage("server",new Date().toLocaleTimeString(),msg)
    socket.emit('makeMeActive', localStorage.getItem("nick"))

})
socket.on('newActiveUser', msg => {
    if (msg !== localStorage.getItem('nick')){
    msgToPrint = "Korisnik " + msg + " se pridružio razgovoru"
    outputMessage("server",new Date().toLocaleTimeString(),msgToPrint)
} 
    
})
socket.on('updatedList', list => {
    resetSidebar(list)
})
socket.on('chat', msg => {
    for (let i = 0; i < msg.length; i++) {
      outputMessage(msg[i].posiljaoc,msg[i].vrijeme,msg[i].poruka)
    }
})
socket.on('userOut',msg => {
    msgToPrint = "Korisnik " + msg.nick + " je napustio razgovor"
    outputMessage("server",new Date().toLocaleTimeString(),msgToPrint)
})
socket.on('newMessage',msg => {
    outputMessage(msg.posiljaoc,msg.vrijeme,msg.text)
})

//// p2p
// socket.on("1v1message",msg=>{
//     outputMessage1(msg.posiljaoc,msg.vrijeme,msg.text)
// })
socket.on("newConversation",msg=>{
    console.log(msg)
   for (let i = 0; i < msg.length; i++) {
    outputMessage1(msg[i].posiljaoc,msg[i].vrijeme,msg[i].poruka) 
   }
})
socket.on("new1v1Message",msg=>{
     outputMessage1(msg.posiljaoc,msg.vrijeme,msg.poruka) 
 })


function outputMessage(user,time,text) {
    let class_="";
    const div = document.createElement('div')
    if(user === "server" ){
    class_='message-server'
    } else if (user === localStorage.getItem("nick")){
        class_='message-user'
    } else {
        class_='message-mes'
    }
    div.classList.add('message')    

    div.innerHTML = `
    <div class="message">
    <p class="meta">${user} <span>${time}</span></p>
    <p class="text">
        ${text}
    </p>
    </div>
   `
    document.querySelector('.chat-messages').appendChild(div)
    chatMessages.scrollTop = chatMessages.scrollHeight
}
function outputMessage1(user,time,text) {
    let class_="";
    const div = document.createElement('div')
    if(user === "server" ){
    class_='message-server'
    } else if (user === localStorage.getItem("nick")){
        class_='message-user'
    } else {
        class_='message-mes'
    }
    div.classList.add('message')    

    div.innerHTML = `
    <div class="message">
    <p class="meta">${user} <span>${time}</span></p>
    <p class="text">
        ${text}
    </p>
    </div>
   `
    document.querySelector('.chat-messages1-1').appendChild(div)
    chatMessages.scrollTop = chatMessages.scrollHeight
}
const resetSidebar =(list)=> {
    let listUsers = ``
    for (let i = 0; i < list.length; i++) {
        if (list[i] == localStorage.getItem('nick')) continue
        listUsers += `
        <li onclick="myFunction('${list[i]}')" class="sidebar-li">${list[i]}</>
        `
    }
    listOfActiveUsers.innerHTML = listUsers;

}
function myFunction(e) {
    //  kad se klikne neki na sidebaru
    activeChat = "chat1v1"
    user1v1 = e;
    if(e != currentUser1v1) {
        // odi po historiju chata ako ima
        let msg= {"posiljaoc":localStorage.getItem('nick'),"primalac":e}
        socket.emit('newConversation',msg) 
        chat1v1.innerHTML=""
        currentUser1v1=e;
    }
    mainChat.style.display="none"
    chat1v1.style.display="block"

}
showMainChat.addEventListener('click',()=>{
    activeChat = "mainChat"
    mainChat.style.display="block"
    chat1v1.style.display="none"
})


/* Set the width of the side navigation to 250px */
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    document.querySelector('.trigger-text').style.display = "none";
}

/* Set the width of the side navigation to 0 */
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.querySelector('.trigger-text').style.display = "block";

}
function getNick() {
    if (localStorage.getItem("nick") === null) {
        generateNick();
    } else {
        document.querySelector('#nik').innerHTML = localStorage.getItem("nick")
    }
}
function generateNick() {
    const nick = [];
    const suglasnici = 'bcdfghjklmnpqrstvwxyz';
    const samoglasnici = 'aeiou';
    const brojevi = '0123456789';
    for (let i = 0; i < 6; i++) {
        if (i == 0 || i == 2) {
            nick.push(suglasnici.charAt(Math.floor(Math.random() *
                suglasnici.length)));
        } else if (i == 1 || i == 3) {
            nick.push(samoglasnici.charAt(Math.floor(Math.random() *
                samoglasnici.length)));
        } else {
            nick.push(brojevi.charAt(Math.floor(Math.random() *
                brojevi.length)));
        }
    }
    document.querySelector('#nik').innerHTML = nick.join('');
    localStorage.setItem('nick', nick.join(''));

}
function showChat() {
    document.querySelector('#pocetna').style.display = "none";
    document.querySelector('#chat').style.display = "block";
    chatMessages.scrollTop = chatMessages.scrollHeight
    document.querySelector('#msg').focus();
}

