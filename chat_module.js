class Chat {
    constructor(socket_io, actual_users) {
      this.socket = socket_io;
      this.actual_users = [];
    }
  
    update_all_users_to_one = (user_to_update_id) => {
        var users_login = this.actual_users.map(a => a.login);
        var unique_users_login = [...new Set(users_login)];
        var msg = unique_users_login.join(';');
        this.socket.sockets.connected[user_to_update_id].emit('users update', msg + ';');
    }
    emit_new_user_to_all = (user_add_login, user_to_ignore_id) => {
        var result = this.actual_users.filter(obj => {
            return obj.login == user_add_login;
        });
        if (result.length == 1) {
            for (var i = 0; i < this.actual_users.length; i++) {
                var socket = this.socket.sockets.connected[this.actual_users[i].id];
                if (socket != null && socket.id != user_to_ignore_id)
                    socket.emit('user add', user_add_login);
            }
        }
    }
    
    emit_deleted_user_to_all = (user_to_delete_login) => {
        var result = this.actual_users.filter(obj => {
            return obj.login == user_to_delete_login;
        });
        if (result.length == 0) {
            for (var i = 0; i < this.actual_users.length; i++) {
                var socket = this.socket.sockets.connected[this.actual_users[i].id];
                if (socket != null)
                    socket.emit('user delete', user_to_delete_login);
            }
        }
    }
    all_message_to_one_user_update = (sql_con, user_to_update_id) => {
        var sql = "SELECT * FROM seko_chat_msg ORDER BY id DESC LIMIT 30";
        if (sql_con.state === "authenticated") {
            sql_con.query(sql, (err, result) => {
                if (err) console.log(err);
                var msg = '';
    
                for (var i = 0; i < result.length; i++) {
                    msg += result[i].user;
                    msg += ',';
                    msg += result[i].message;
                    msg += ',';
                    msg += result[i].time;
                    msg += ';';
                }
                var socket = this.socket.sockets.connected[user_to_update_id];
                if (socket != null)
                    socket.emit('chat all message', msg);
            });
        }
    }
    check_users_connection = () => {
        for (var i = 0; i < this.actual_users.length; i++) {
            var socket = this.socket.sockets.connected[this.actual_users[i].id];
            if (socket == null) {
                this.emit_deleted_user_to_all(this.actual_users[i].login);
                this.actual_users.splice(i, 1);
            }
        }
    }
  }
  
  module.exports = Chat;