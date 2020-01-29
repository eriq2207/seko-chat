const express = require('express')
const app = express()
const http = require('http').createServer(app)
const path = require('path')
const io = require('socket.io')(http)

app.get('/', (req,res )=> {
    res.sendFile(path.join(__dirname,'/chat.html'))
})
app.listen(80,()=> console.log("Serwer uruchomiony na porcie 80"))

io.on('connection', (socket)=>{
    console.log("User connected")
})
io.on('disconnect', (socket) =>{
    console.log("User disconnected")
})
