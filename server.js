var express = require('express');
var app = express();
var path = require('path');
var mysql = require('mysql');
var bcrypt = require('bcrypt');
var bodyParser = require('body-parser');
var fs = require('fs');
var chat = require('./chat_module.js');

const port = process.env.PORT || 3000;
var server = app.listen(port, () => console.log("Serwer uruchomiony na porcie:" + port));
var io = require('socket.io').listen(server);

const saltRounds = 10;
chat = new chat(io)
var sql_con;

setInterval(chat.check_users_connection, 10000);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/static'));

//HTTP Server
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/chat.html'));
})
app.post('/login', (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    var id = req.body.id;
    var sql = "SELECT * FROM seko_chat_users WHERE login = '" + username + "'";
    if (sql_con.state === 'authenticated') {
        sql_con.query(sql, (err, result) => {
            if (err) throw err;
            if (result.length === 1 && username === result[0].login) {
                bcrypt.compare(password, result[0].password, function(err, compare_res) {
                    if (err) throw err;
                    if (compare_res) {
                        var user = {
                            id: id,
                            login: username,
                        }
                        chat.actual_users.push(user);
                        chat.update_all_users_to_one(user.id);
                        chat.emit_new_user_to_all(user.login, user.id);
                        chat.all_message_to_one_user_update(sql_con, user.id);
                        res.end('1');
                    } else
                        res.end('0');
                })
            } else
                res.end('0');

        })
    } else
        res.end('-1');
})

//MySql connection
fs.readFile('config.json', (err, data) => {
    if (err) throw err;
    else {
        config_json = JSON.parse(data);
        sql_con = mysql.createConnection({
            host: config_json.host,
            port: config_json.port,
            user: config_json.user,
            password: config_json.password,
            database: config_json.database
        });
        sql_con.connect((err) => {
            if (err) throw err;
            console.log("Połączono do bazy danych");
        })
    }
})
if (sql_con != null) {
    sql_con.on('error', (err) => {
        console.log(err);
    })
}

//Socket io
io.on('connection', function(user) {

    user.on('disconnect', function() {
        var index = chat.actual_users.findIndex(obj => obj.id === user.id);
        if (index >= 0) {
            var login = chat.actual_users[index].login;
            chat.actual_users.splice(index, 1);
            chat.emit_deleted_user_to_all(login);
        }
    })

    user.on('chat message', function(msg) {

        var result = chat.actual_users.filter(obj => {
            return obj.id == user.id;
        })
        if (result.length === 1) {
            var sql = "INSERT INTO seko_chat_msg (id, user, message, time) VALUES (NULL,'" + result[0].login + "','" + msg + "'," + "CURRENT_TIME())";
            if (sql_con.state === "authenticated")
                sql_con.query(sql, (err, result) => {
                    if (err) console.log(err);
                });
            for (i = 0; i < chat.actual_users.length; i++)
                io.sockets.connected[chat.actual_users[i].id].emit('chat message', result[0].login + ': ' + msg);
        }

    });
    user.on('load_more_req', (msg) => {
        chat.send_more_msg_to_user(user.id, msg, sql_con);
    });
})