var express = require('express');
var app = express();
var path = require('path');
var mysql = require('mysql');
var bcrypt = require('bcrypt');
var bodyParser = require('body-parser');

const saltRounds = 10;
var actual_chat_users = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/static'));

//HTTP Server
const port = process.env.PORT || 3000;
var server = app.listen(port, () => console.log("Serwer uruchomiony na porcie:" + port));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/chat.html'));
})
app.post('/login', (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    var id = req.body.id;
    var sql = "SELECT * FROM seko_chat_users WHERE login = '" + username + "'";
    if (con.state === 'authenticated') {
        con.query(sql, (err, result) => {
            if (err) throw err;
            if (result.length === 1 && username===result[0].login) {
                bcrypt.compare(password, result[0].password, function (err, res) {
                    if (err) throw err;
                    if (res) {
                        var user = {
                            id: req.body.id,
                            login: req.body.username,
                        }
                        io.sockets.connected[id].emit('login request status', '1');
                        actual_chat_users.push(user);
                        update_users(actual_chat_users,io, user.id);
                        add_new_user(actual_chat_users,io, user.login, user.id);
                    }
                    else 
                        io.sockets.connected[id].emit('login request status', '0');
                })
            }
            else
                io.sockets.connected[id].emit('login request status', '0');
        })
    }
    else {
        io.sockets.connected[id].emit('login request status', '-1');
    }
})


//MySql connection
var con = mysql.createConnection({
    host: 'remotemysql.com',
    port: 3306,
    user: 'fmMb3PtZox',
    password: 'HnCxMUYeT7',
    database: 'fmMb3PtZox',
})
con.connect((err) => {
    if (err) throw err;
    console.log("Połączono do bazy danych");
})
//Socket io
var io = require('socket.io').listen(server);
io.on('connection', function (user) {

    user.on('disconnect', function () {
        var index = actual_chat_users.findIndex(obj => obj.id === user.id);
        if(index >=0)
        {
            var login = actual_chat_users[index].login;
            actual_chat_users.splice(index, 1);
            delete_user(actual_chat_users, io, login);
        }
    })

    user.on('chat message', function (msg) {
        var result = actual_chat_users.filter(obj => {
            return obj.id == user.id;
        })
        if (result.length === 1) {
            for (i = 0; i < actual_chat_users.length; i++)
                io.sockets.connected[actual_chat_users[i].id].emit('chat message', result[0].login + ': ' + msg);
        }

    });
})
function update_users(actual_users, io, user_to_update_id) {
    //Take login table from table of objects
    var users_login = actual_users.map(a => a.login);
    var msg = users_login.join(';');
    io.sockets.connected[user_to_update_id].emit('users update', msg + ';');
}
function add_new_user(actual_users, io, user_add, user_ignore_id) {
    for (var i = 0; i < actual_chat_users.length; i++)
    {
        var socket = io.sockets.connected[actual_users[i].id];
        if(socket!=null && socket.id!=user_ignore_id)
            socket.emit('user add', user_add);
    }
}
function delete_user(actual_users, io, user_delete) {
    for (var i = 0; i < actual_chat_users.length; i++)
    {
        var socket = io.sockets.connected[actual_users[i].id];
        if(socket!=null)
            socket.emit('user delete', user_delete);
    }
}