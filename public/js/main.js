const socket = io();
const btnSend = document.querySelector('.chat-footer-right')
const mainChat = document.querySelector('.chat-body')
const privateChat = document.querySelector('.chat-private')
const chatNav = document.querySelector('.pop-up-list-li')
const enterBtn = document.querySelector('#btnEnter')
const inputForm = document.querySelector('.input-field')
const notification = document.querySelector('#notification')
const mainChatToggle = document.querySelector('#mainChatToggle')
let activeChat = "mainChat"
let user1v1 = "";
let currentUserPrivateChat = ""; // korisnik sa kojim je aktivan privatni chat
let listOfActiveUsers = document.querySelector('#users')
let allActiveUsers = ""

// prikazi chat, skloni pocetni zaslon
enterBtn.addEventListener('click', () => {
    document.querySelector('.welcome-container').style.display = "none";
    document.querySelector('.chat-container').style.display = "flex";
    inputForm.focus();
    mainChat.scrollTop = mainChat.scrollHeight;
    console.log("sdasdasd")
})
//provjeri da li je aktivan grupni ili privatni chat, pa posalji poruku
btnSend.addEventListener('click', (e) => {
    e.preventDefault();
    let text = inputForm.value
    if (activeChat == "mainChat") {
        let msg = { "posiljaoc": localStorage.getItem('nick'), "vrijeme": new Date().toLocaleTimeString(), "text": text }
        socket.emit('newMessage', msg)
    } else {
        let msg = { "posiljaoc": localStorage.getItem('nick'), "primalac": user1v1, "vrijeme": new Date().toLocaleTimeString(), "poruka": text }
        socket.emit('privateMessage', msg)
    }
    inputForm.value = ""
    inputForm.focus();
})
//ispisi prijasnje poruke prije svega
socket.on('Chat-history', msg => {
    for (let i = 0; i < msg.length; i++) {
        outputMessage(msg[i].posiljaoc, msg[i].vrijeme, msg[i].poruka, "mainChat")
    }
})
//prikazi pozdravnu poruku korisniku
socket.on('WelcomeMessage', msg => {
    outputMessage("server", new Date().toLocaleTimeString(), msg, "mainChat")
})
//obavjesti sudionike o novom korisniku
socket.on('newActiveUser', msg => {
    if (msg !== localStorage.getItem('nick')) {
        msgToPrint = "Korisnik " + msg + " se pridružio razgovoru"
        outputMessage("server", new Date().toLocaleTimeString(), msgToPrint, "mainChat")
    }
})
//pozovi funkciju koja ce resetovati listu aktivnih korisnika
socket.on('updatedList', list => {
    resetSidebar(list)
})
//obavijesti koji je korisnik napustio chat
socket.on('userOut', msg => {
    msgToPrint = "Korisnik " + msg + " je napustio razgovor"
    outputMessage("server", new Date().toLocaleTimeString(), msgToPrint, "mainChat")
})
// ispisi novu poruku
socket.on('newMessage', msg => {
    outputMessage(msg.posiljaoc, msg.vrijeme, msg.text, "mainChat")
})
// prikazi historiju razgovora za odabranog korisnika, ako postoji
socket.on("newConversation", msg => {
    console.log(msg)
    for (let i = 0; i < msg.length; i++) {
        outputMessage(msg[i].posiljaoc, msg[i].vrijeme, msg[i].poruka, "privateChat")
    }
})
/*primljena nova privatna poruka, ako je otvoren chat, prikazi obavijest korisniku da ima novu poruku
i ispisi tu poruku ako je prikazan chat bas sa tim korisnikom*/
socket.on("privateMessage", msg => {
    if (msg.posiljaoc === currentUserPrivateChat || msg.primalac === currentUserPrivateChat) {
        outputMessage(msg.posiljaoc, msg.vrijeme, msg.poruka, "privateChat")
    }
    if (msg.posiljaoc != localStorage.getItem('nick')) {
        zadnjaPoruka = msg.posiljaoc
        document.querySelector('#new-msg-notifiation').innerHTML = "Imate novu poruku od: " + msg.posiljaoc
        document.querySelector('#new-msg-notifiation').addEventListener('click', () => {
            openPrivateChat(msg.posiljaoc)
        })
        mainChatToggle.style.display = "none"
        notification.style.display = "block"
        setTimeout(function () {
            mainChatToggle.style.display = "block"
            notification.style.display = "none"
        }, 5000);
    }
})
// prikazi poruku, i dodjeli klasu u zavisnosti ko salje 
function outputMessage(user, time, text, destination) {
    let class_ = "";
    const div = document.createElement('div')
    if (user === localStorage.getItem("nick")) {
        class_ = 'message-user'
    } else if (user === "server") {
        class_ = 'message-server'
    } else {
        class_ = 'message'
    }
    div.classList.add(class_)
    div.innerHTML = `
    <div class="${class_}">
    <p class="meta">${user} <span>${time}</span></p>
    <p class="text">
        ${text}
    </p>
    </div>
   `
    if (destination === "mainChat") {
        document.querySelector('.chat-body').appendChild(div)
        mainChat.scrollTop = mainChat.scrollHeight

    } else {
        document.querySelector('.chat-private').appendChild(div)
        privateChat.scrollTop = privateChat.scrollHeight
    }
}
// update za listu aktivnih korisnika
const resetSidebar = (list) => {
    let listUsers = ``
    for (let i = 0; i < list.length; i++) {
        if (list[i] == localStorage.getItem('nick')) continue
        listUsers += `
        <li onclick="openPrivateChat('${list[i]}')">${list[i]}</>
        `
    }
    listOfActiveUsers.innerHTML = listUsers;
    chatNav.innerHTML = listUsers;

}  
//  prikazi chat sa odabranim korisnikom
function openPrivateChat(e) {
    document.querySelector('#openChat').innerHTML = "Vrati se na grupni chat"
    activeChat = "chat1v1"
    user1v1 = e;
    if (e != currentUserPrivateChat) {
        //provjeri da li postoji historija izmedju 2 korisnika
        let msg = { "posiljaoc": localStorage.getItem('nick'), "primalac": e }
        socket.emit('newConversation', msg)
        privateChat.innerHTML = ""
        currentUserPrivateChat = e;
    }
    // sakri grupni, prikazi privatni i podesi vidljivost
    mainChat.style.display = "none"
    privateChat.style.display = "block"
    privateChat.scrollTop = privateChat.scrollHeight
}
// sakri privatni, prikazi grupni chat i podesi vidljivost poruka
mainChatToggle.addEventListener('click', () => {
    document.querySelector('#openChat').innerHTML = "Grupni chat"
    activeChat = "mainChat"
    mainChat.style.display = "block"
    privateChat.style.display = "none"
    mainChat.scrollTop = mainChat.scrollHeight
})
// ako je novi korisnik, pozovi funkciju za generisanje random nika, ako nije smao ucitaj njegov nik
function getNick() {
    if (localStorage.getItem("nick") === null) {
        generateNick();
    } else {
        document.querySelector('#nick').innerHTML = localStorage.getItem("nick")
        socket.emit('makeMeActive', localStorage.getItem("nick"))
    }
}
// generisanje random nika ali suglasnik/samoglasnik/suglasnik... 
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
    // provjeri da li random nik vec postoji u bazi
    socket.emit("checkNick", nick.join(''))
}
//ako je nik unikatan, koristi ga, ako nije ponovo pozovi funkciju za generisanje
socket.on('checkNick', msg => {
    if (msg) {
        document.querySelector('#nick').innerHTML = msg;
        localStorage.setItem('nick', msg);
        socket.emit('makeMeActive', msg)
    } else {
        generateNick()
    }
})



