const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const mongojs = require('mongojs')
const app = express();
const server = http.createServer(app)
const io = socketio(server)
const mongoose = require('mongoose');
const { findInactiveUsers, updateActiveList, isUserActive, makeOnlineList } = require('./utils/functions')
const {
    PORT = 3000,
    NODE_ENV = "development"
} = process.env;

const IN_PROD = NODE_ENV == "production"

let activeUsers = [] // lista koja cuva aktivne korisnike sa pripadajucim id-ivima konekcija

// konekcija na mongodb
mongoose
    .connect(
        //'mongodb://mongo:27017/chat-node',
        'mongodb://localhost:27017/',
        {useNewUrlParser: true, useUnifiedTopology: true}
    )
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

const ChatHistory = require('./models/ChatHistory');
const User = require('./models/User');
const ChatPrivate = require('./models/ChatPrivate');

app.use(express.static(path.join(__dirname, 'public')))

// slusam na konekciju, posalji pozdravnu poruku i historiju chata novom sudioniku
io.on('connection', socket => {
    ChatHistory.find({}).then(data => {
        socket.emit('Chat-history', data)
        socket.emit('WelcomeMessage', 'Dobro došli na chat!')
        let clients = Object.keys(io.sockets.sockets);
        let onlineUsers = makeOnlineList(clients, activeUsers)
        socket.emit('updatedList', onlineUsers)
    })
        .catch(err => console.log(err));

    //novi korisnik ako random nik vec postoji u bazi, vrati false, a frontend ce generisati novi nik
    //i taka sve dok ne dobije slobodan nik, kad dobije slobodan nik spremi ga u bazu i vrati korisniku true tj. nik
    socket.on('checkNick', (nick) => {

        ChatHistory.findOne({user:nick}).then(result => {
            if (!result) {
                socket.emit('checkNick', nick)
                const user = new User({
                    user: nick,
                });
                user.save().then(item => {
                });
            } else {
                socket.emit('checkNick', false)
            }

        })
    })

    socket.on('makeMeActive', user => {
        let clients = Object.keys(io.sockets.sockets);
        let newUser = { "nick": user, "id": socket.id }
        /*provjeri da li je korisnik vec pristupio iz drugog taba,
       ako nije obavijesti ostale sudionike o novom korisniku,
       te osvježi njihove liste aktivnih korisnika,
       a ako jeste emituj listu aktivnih korisnika*/
        let check = isUserActive(activeUsers, newUser)
        if (!check) {
            socket.broadcast.emit('newActiveUser', newUser.nick)
            activeUsers.push(newUser)
            let onlineUsers = makeOnlineList(clients, activeUsers)
            socket.broadcast.emit('updatedList', onlineUsers)
        } else {
            activeUsers.push(newUser)
            let onlineUsers = makeOnlineList(clients, activeUsers)
            socket.broadcast.emit('updatedList', onlineUsers)
        }
    })
    /*kada korisnik izadje, obavjesti ostale sudionike,
    osim ako ima jos aktivnih tabova*/
    socket.on('disconnect', () => {
        var clients = Object.keys(io.sockets.sockets);
        /*poređenje liste prijavljenih korisnika sa listom akvtivnih konekcija
        kako lista aktivnih korisnika nebi sadržavala korisnike
        kojima je pukla veza*/
        let userWithNoConn = findInactiveUsers(clients, activeUsers)
        if (userWithNoConn.length > 0) {
            for (let i = 0; i < userWithNoConn.length; i++) {
                io.emit('userOut', userWithNoConn[i])
            }
        }
        /*osvježi listu prijavljenih korisnika,
        te na osnovu nje kreiraj novu listu online korisnika,
        ali bez duplikata( ako je neko otvorio više tabova )*/
        activeUsers = updateActiveList(clients, activeUsers)
        let onlineUsers = makeOnlineList(clients, activeUsers)
        io.emit('updatedList', onlineUsers)
    })
    /*nova poruka u grupnom chatu, poruku spremiti u bazu,
    pa tek onda emitovati svima ukljucujuci i posiljatelja*/
    socket.on('newMessage', (msg) => {
        const chatHistory = new ChatHistory({
            posiljaoc: msg.posiljaoc,
            vrijeme: msg.vrijeme,
            poruka: msg.text
        });

        chatHistory.save().then(item => {
            io.emit('newMessage', msg)
        });
    })
    // novi privatni razgovor
    /* Provjeri u bp da li postoji historija otvorenog razgovora,
    ako postoji, posalji je  */
    socket.on('newConversation', msg => {
        let primalac = msg.primalac;
        let posiljaoc = msg.posiljaoc;
        ChatPrivate.find({
            $or: [{ $and: [{ "posiljaoc": posiljaoc }, { "primalac": primalac }] },
            { $and: [{ "posiljaoc": primalac }, { "primalac": posiljaoc }] }]
        }).then(data => {
            socket.emit("newConversation", data)
        }).catch(err => console.log(err));
    })
    
    /* nova poruka u privatnom razgovoru,
    spremiti poruku u bazu pa je emitovati ucesnicima u daom razgovoru */
    socket.on('privateMessage', msg => {
       console.log(msg)
        const chatPrivate = new ChatPrivate({
            posiljaoc: msg.posiljaoc,
            primalac: msg.primalac,
            vrijeme: msg.vrijeme,
            poruka: msg.poruka
        });
        chatPrivate.save().then(item => {
            for (let i = 0; i < activeUsers.length; i++) {
                if (activeUsers[i].nick === msg.posiljaoc || activeUsers[i].nick === msg.primalac) {
                    io.to(activeUsers[i].id).emit("privateMessage", msg)
                }
            }
        })
        .catch(err => console.log(err));
    })

})


server.listen(PORT, () => {
    console.log('slusam na port 3000');
})

