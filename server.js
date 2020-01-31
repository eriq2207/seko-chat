var express = require('express');
var app = express();
var path = require('path');

//Temp users
var chat_user1 = {
    id:'',
    login:'Eryk',
    password:'1234'
}
var chat_user2 = {
    id:'',
    login:'Maciek',
    password:'1234'
}
var actual_chat_users =[];
var chat_all_users = [];
chat_all_users.push(chat_user1);
chat_all_users.push(chat_user2);
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
        var index = actual_chat_users.findIndex(obj => obj.id === user.id);
        actual_chat_users.splice(index,1);
        update_users(actual_chat_users,io, actual_chat_users);
    })

    user.on('login request', function(msg){
        var chat_user = {
            id:'',
            login:'',
            password:''
        }
        var login_data = msg.split(';',2);

        chat_user.id = user.id;
        chat_user.login = login_data[0];
        chat_user.password =login_data[1];

        var result = chat_all_users.findIndex(obj => obj.login == chat_user.login);

        if(chat_all_users[result].password === chat_user.password)
        {
            actual_chat_users.push(chat_user);
            user.emit('login request status','1');
            update_users(actual_chat_users,io, actual_chat_users);
        }
        else
        {
            user.emit('login request status','0');
        }
    });
    user.on('chat message', function(msg){
        var result = actual_chat_users.filter(obj =>{
            return obj.id == user.id;
        })
        if(result.length===1)
        {  
            for(i=0;i<actual_chat_users.length;i++)
                io.sockets.connected[actual_chat_users[i].id].emit('chat message',result[0].login + ': ' + msg);
        }

    });
})
function update_users(actual_users, io, actual_users)
{
    //Take login table from table of objects
    var users_login = actual_users.map(a =>a.login);
    var msg =users_login.join(';');
    
    for(var i=0;i<actual_chat_users.length;i++)
        io.sockets.connected[actual_chat_users[i].id].emit('users update',msg +';');
}
