const socket = io();
const chatMessages = document.querySelector('.chat-messages')
const chatFrom = document.querySelector('.btn-send')
let listOfActiveUsers = document.querySelector('#users')

chatFrom.addEventListener('click', (e) => {
    e.preventDefault();
    const msg = document.querySelector('#msg').value
    document.querySelector('#msg').value = ""
    document.querySelector('#msg').focus();
    socket.emit('chatMessage', msg)
})
socket.on('msg', msg => {
    console.log(msg)
    outputMessage(msg)
})
socket.on('WelcomeMessage', msg => {
    outputMessage(msg)
    socket.emit('makeMeActive', localStorage.getItem("nick"))

})
socket.on('newActiveUser', msg => {
    if (msg !== localStorage.getItem('nick')){
    msgToPrint = "Korisnik " + msg + " se pridružio razgovoru"
    outputMessage(msgToPrint)
} 
    
})
socket.on('updatedList', list => {
    console.log(list)
    resetSidebar(list)
})
socket.on('chat', msg => {
    console.log(msg)

})
function outputMessage(msg) {
    const div = document.createElement('div')
    div.classList.add('message')
    div.innerHTML = `
    <p class="meta">Brad <span>9:12pm</span></p>
    <p class="text">
        ${msg}
    </p>
   `
    document.querySelector('.chat-messages').appendChild(div)
    chatMessages.scrollTop = chatMessages.scrollHeight
}
function resetSidebar(list) {
    console.log(list)
    let listUsers = ``
    for (let i = 0; i < list.length; i++) {
        if (list[i] == localStorage.getItem('nick')) continue
        listUsers += `
        <li>${list[i]}</>
        `
    }
    listOfActiveUsers.innerHTML = listUsers;

}

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

}

