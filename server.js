var express = require('express');
var app = express();
var path = require('path');
var mysql = require('mysql');
var bcrypt = require('bcrypt');
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/static'));

var actual_chat_users =[];

//HTTP Server
const port = process.env.PORT || 3000;
var server = app.listen(port,()=> console.log("Serwer uruchomiony na porcie:" + port));
app.get('/', (req,res )=> {
    res.sendFile(path.join(__dirname,'/chat.html'));
})
app.post('/login',(req,res) =>{
    var username = req.body.username;
    var password = req.body.password;
    var id = req.body.id;
    bcrypt.hash(password,10,(err,hash) =>{
        if(err) throw err;
        var sql = "SELECT 'password' FROM seko_chat_users WHERE login = '"+username+"'";
        if(con.state === 'authenticated')
        {
            con.query(sql,(err,result) =>{
                if(err) throw err;
                if(result.length === 1)
                {
                    bcrypt.compare(result[0].password, hash, function(err, res) {
                        if (err) throw err;
                        if(res)
                        {
                            var user={
                                id: req.body.id,
                                login: req.body.username,
                            }
                            io.sockets.connected[id].emit('login request status','1');
                            actual_chat_users.push(user);
                        }
                        else
                        {
                            io.sockets.connected[id].emit('login request status','0');
                        }
                    })
                }
            })
        }
        else
        {
            io.sockets.connected[id].emit('login request status','-1');
        } 
    })
})


//MySql connection
var con = mysql.createConnection({
    host: 'remotemysql.com',
    port: 3306,
    user: 'fmMb3PtZox',
    password: 'HnCxMUYeT7',
    database: 'fmMb3PtZox',
})
con.connect((err) =>{
    if(err) throw err;
    console.log("Połączono do bazy danych");
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
            password_hash:''
        }
        var login_data = msg.split(';',2);

        chat_user.id = user.id;
        chat_user.login = login_data[0];
        bcrypt.hash(login_data[1],10,(err,hash) =>{
            if(err) throw err;
            chat_user.password_hash = hash;
        });
        var sql = '';
        if(con.connected)
        {
            con.query(sql,(err,result) =>{
                if(err) throw err;
                if(result.length === 1)
                {

                }
                else
                {
                    user.emit('login request status','0');
                }
            })
        }
        else
        {
            user.emit('login request status','-1');
        } 
        
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
