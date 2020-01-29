var express = require('express');
var app = express();
var path = require('path');

//Send static files
app.use(express.static(__dirname + '/static'));

//HTTP Server
var server = app.listen(80,()=> console.log("Serwer uruchomiony na porcie 80"));
app.get('/', (req,res )=> {
    res.sendFile(path.join(__dirname,'/chat.html'));
})
//Socket io
var io = require('socket.io').listen(server);
io.on('connection', function(user){
    console.log('a user connected');
    user.on('disconnect', function(){
        console.log("User disconnected!");
    })
})


