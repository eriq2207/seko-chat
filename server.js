var express = require('express');
var app = express();
var path = require('path');


var chat_users =[];
//Send static files
app.use(express.static(__dirname + '/static'));

//HTTP Server
const port = process.env.PORT || 3000;
var server = app.listen(port,()=> console.log("Serwer uruchomiony na porcie:" + port));
app.get('/', (req,res )=> {
    res.sendFile(path.join(__dirname,'/chat.html'));
})

//Socket io
var io = require('socket.io').listen(server);
io.on('connection', function(user){

    user.on('disconnect', function(){
            
    })

    user.on('login data', function(msg){
        var chat_user = {
            id:'',
            login:''
        }
        chat_user.id = user.id;
        chat_user.login = msg;
        chat_users.push(chat_user);
        user.emit('login status','1');
    });
    user.on('chat message', function(msg){
        var result = chat_users.filter(obj =>{
            return obj.id == user.id;
        })
        if(result.length===1)
            io.emit('chat message',result[0].login + ': ' + msg);

    });
})

