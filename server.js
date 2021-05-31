const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const mongojs = require('mongojs')
const { Socket } = require('dgram')
const { count } = require('console')
const {
    PORT = 3000,
    NODE_ENV = "development"
} = process.env;
const IN_PROD = NODE_ENV == "production" // za do
const app = express();
const server = http.createServer(app)
const io = socketio(server)
const db = mongojs('chat', ['otvoreni'])
const { removeDuplicates, removeUserFromList, connectionsCounter, findUserToOut } = require('./utils/functions')

let activeUsersList = []

app.use(express.static(path.join(__dirname, 'public')))

// listen to user conn...
io.on('connection', socket => {
    db.otvoreni.find({}, (err, messages) => {
        socket.emit('chat', messages)
        socket.emit('WelcomeMessage', 'Dobro došli na chat!')
    })
    
    socket.on('makeMeActive', user => {
        let userToList = { "nick": user, "id": socket.id }
        activeUsersList.push(userToList)
        //number of  connections of the same user (more tabs, one browser)
        let counter = connectionsCounter(activeUsersList, userToList)
        // counter = 1 => new active user, emit newActiveUser
        // counter > 1 => new tab in browser, send list of active users
        if (counter == 1) {
            socket.broadcast.emit('newActiveUser', user)
            uniqueArray = removeDuplicates(activeUsersList)
            io.emit('updatedList', uniqueArray)
        } else {
            io.to(socket.id).emit("updatedList", removeDuplicates(activeUsersList))
        }
    })
    // listen to user conn...
    socket.on('disconnect', () => {
        let userForOut = findUserToOut(activeUsersList, socket.id)
        activeUsersList = removeUserFromList(activeUsersList, userForOut)
        let counter = connectionsCounter(activeUsersList, userForOut)
        if (counter == 0) {
            // counter = 0 => no more tabs, user is out, broadcast to other users
            // counter > 0 do nothing
            let index = uniqueArray.indexOf(userForOut.nick)
            uniqueArray.splice(index, 1)
            io.emit('updatedList', uniqueArray)
            io.emit('userOut', userForOut)
        }
    })
    //listen to the chat
    socket.on('newMessage', (msg) => {
        db.otvoreni.insert({ "posiljaoc": msg.posiljaoc, 'vrijeme': msg.vrijeme, "poruka": msg.text }, (err, messages) => {
             if (err) throw err
             io.emit('newMessage', msg)
         })
    })
})

server.listen(PORT, () => {
    console.log('slusam na 3000');
})

