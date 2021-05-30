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
let activeUsersList = []
let arrayToFilter = [];


app.use(express.static(path.join(__dirname, 'public')))

// slusam na konekciju klijenta, odgovaram pozdravnom porukom
io.on('connection', socket => {

    db.otvoreni.find({}, (err, messages) => {
        io.emit('chat', messages)
    })
    socket.emit('WelcomeMessage', 'Dobro došli na chat!')
    socket.on('makeMeActive', user => {
        let userToList = { "nick": user, "id": socket.id }
        activeUsersList.push(userToList)
        let counter = 0;
        activeUsersList.forEach(element => {
            if(element.nick === userToList.nick) counter++
        });
        if(counter == 1) 
        {
            socket.broadcast.emit('newActiveUser', user)
        arrayToFilter = []
        for (let i = 0; i < activeUsersList.length; i++) {
            arrayToFilter.push(activeUsersList[i].nick)
        }
        uniqueArray = removeDuplicates(arrayToFilter)
        console.log(uniqueArray)
        io.emit('updatedList', uniqueArray)
        }
    })
    // when client disc.
    socket.on('disconnect', () => {
        let userForOut = ""
        let counter = 0;
        for (let i = 0; i < activeUsersList.length; i++) {
            if (socket.id === activeUsersList[i].id) userForOut = activeUsersList[i]
        }
        activeUsersList = removeDuplicates1(activeUsersList,userForOut)

        for (let i = 0; i < activeUsersList.length; i++) {
            if (userForOut.nick === activeUsersList[i].nick) counter++
        }
        if(counter == 0) {
            let index = uniqueArray.indexOf(userForOut.nick)
            uniqueArray.splice(index,1)
            io.emit('updatedList', uniqueArray)
        }
       
    })
    //Listen for chatMessage
    socket.on('chatMessage', (msg) => {
        db.otvoreni.insert({ "posiljalac": 'Ivo', 'vrijeme': "20:20", "poruka": msg }, (err, messages) => {
            io.emit('msg', msg)
        })
    })
})

server.listen(PORT, () => {
    console.log('slusam na 3000');
})

function removeDuplicates(data) {
    return data.filter((value,index) => data.indexOf(value) === index)
}
function removeDuplicates1(data,za) {
    let newArray = [];
    newArray = data.filter(el => {
        return el.id != za.id
    })
    return newArray
}