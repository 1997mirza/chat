const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const {
    PORT = 3000,
    NODE_ENV = "development"
} = process.env;
const IN_PROD = NODE_ENV == "production" // za do
const app = express();
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(path.join(__dirname,'public')))

// slusam na konekciju klijenta, odgovaram pozdravnom porukom
io.on('connection',scoket => {
    console.log('kova konekcija klijenta')
    scoket.emit('pozdrav','pozdrav')
})

server.listen(PORT,() => {
    console.log('slusam na 3000');
})