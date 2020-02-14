function socket_req_handling() {

    //init socket io
    var socket = io();
    //setInterval(check_connection, 1000, socket);

    //Send message with Enter pressed
    $('.send_textarea').keypress(function(e) {
        if (e.which == 13 && !e.shiftKey)
            send_msg(socket);
    });
    //Sending message after button click
    $('.send_photo').click(() => {
        send_msg(socket);
    });
    //Send login data after button click
    $('#login_btn').click(() => {
        send_login_register_form(socket.id);
    });
    //Send login and registration with Enter pressed
    $('.form').keypress(function(e) {
        if (e.which == 13 && !e.shiftKey)
            send_login_register_form(socket.id);
    });
    //Load more messages after top scroll
    $(".nano").bind("scrolltop", function() {
        var list_obj = $(".chat_list");
        var id = list_obj.children().eq(1).attr('id');
        socket.emit('load_more_req', id);
    });
    //Receiving more messages from server
    socket.on('more messages', function(msg) {
            var msg_array = msg.split(';');
            var id_el = msg_array[msg_array.length - 2].split(',')[0];
            id_el++;
            for (var i = msg_array.length - 2; i > 0; i--) {
                append_msg(msg_array[i], true);
            }
            $(".nano").nanoScroller({ scrollTo: $('#' + id_el) });
        })
        //Receiving message from server
    socket.on('chat message', function(msg) {
        append_msg(msg);
    });
    //Update users list
    socket.on('users update', function(msg) {
        var users = msg.split(';', 200);
        var users_list = $('#users_div');
        users_list.empty();
        for (i = 0; i < users.length - 1; i++)
            append_user(users[i]);
    });
    socket.on('user add', function(msg) {
        var msg_div = $('<div>');
        msg_div.attr("class", "container-fluid msg rounded-lg w-100 m-0 mt-2");
        var hours = new Date().getHours();
        var minutes = new Date().getMinutes();
        var seconds = new Date().getSeconds();
        var span = $('<span>').text(msg + " dołączył/a do czatu!");
        var span_time = $('<span>').text(hours + ':' + minutes + ':' + seconds);
        span_time.css('float', 'right');
        var list_obj = $(".chat_list");
        msg_div.append(span);
        msg_div.append(span_time);
        list_obj.append(msg_div);
        append_user(msg);
        $(".nano").nanoScroller();
        $(".nano").nanoScroller({ scroll: 'bottom' });
    });
    socket.on('user delete', function(msg) {
        var msg_div = $('<div>');
        msg_div.attr("class", "container-fluid msg rounded-lg w-100 m-0 mt-2");
        var hours = new Date().getHours();
        var minutes = new Date().getMinutes();
        var seconds = new Date().getSeconds();
        var span = $('<span>').text(msg + " opuścił/a czat!");
        var span_time = $('<span>').text(hours + ':' + minutes + ':' + seconds);
        span_time.css('float', 'right');
        var list_obj = $(".chat_list");
        msg_div.append(span);
        msg_div.append(span_time);
        list_obj.append(msg_div);
        delete_user(msg);
        $(".nano").nanoScroller();
        $(".nano").nanoScroller({ scroll: 'bottom' });
    });

    socket.on('chat all message', function(msg) {
        var msg_array = msg.split(';');
        for (var i = msg_array.length - 2; i >= 0; i--) {
            append_msg(msg_array[i]);
        }
    });
}

function check_connection(socket) {

    if (!socket.connected && !($('#con_err_msg').length)) {
        var el = $('<li>').text("Problem z połączeniem z serwerem.. odśwież strone i zaloguj się ponownie");
        el.css('color', 'red');
        el.css('text-align', 'center');
        el.attr('id', 'con_err_msg');
        $('#chat_list').append(el);
        scroll_list_down();
    }
}

function send_login_register_form(socket_id) {
    if ($('#email').css('display') == 'none') {
        $.post("login", {
                username: $('#username').val(),
                password: $('#password').val(),
                id: socket_id,
            },
            function(msg, status) {
                switch (msg) {
                    case '1':
                        {
                            $('.login').css('display', 'none');
                            $('.find_user').prop('disabled', false);
                            $('.send_textarea').prop('disabled', false);
                            $('.expand_user').prop('disabled', false);
                            $('.send_textarea').focus();
                            break;
                        }
                    case '0':
                        {
                            var info = $('.information');
                            info.text("Błędna nazwa uzytkownika lub hasło!");
                            info.css('color', 'red');
                            break;
                        }
                    case '-1':
                        {
                            var info = $('.information');
                            info.text("Problem z połączeniem z bazą danych. Skontaktuj się z administratorem!");
                            info.css('color', 'red');
                            break;
                        }
                }
            });
    } else {
        if ($('#password').val().length < 7 || $('#username').val().length < 7) {
            var info = $('.information');
            info.text("Login i hasło powinny zawierać conajmniej 6 znaków!");
            info.css('color', 'red');
        } else {
            $.post("register", {
                    username: $('#username').val(),
                    password: $('#password').val(),
                    email: $('#email').val(),
                },
                function(msg, status) {
                    switch (msg) {
                        case '1':
                            {
                                var info = $('.information');
                                info.text("Rejestracja udana. Możesz się zalogować!");
                                info.css('color', 'green');
                                break;
                            }
                        case '0':
                            {
                                var info = $('.information');
                                info.text("Istnieje użytkownik z podanym adresem email!");
                                info.css('color', 'red');
                                break;
                            }
                        case '-1':
                            {
                                var info = $('.information');
                                info.text("Istnieje użytkownik o takiej nazwie. Wybierz inną!");
                                info.css('color', 'red');
                                break;
                            }
                        case '-2':
                            {
                                var info = $('.information');
                                info.text("Problem z połączeniem z bazą danych. Skontaktuj się z administratorem!");
                                info.css('color', 'red');
                                break;
                            }
                    }
                }
            );
        }
    }
}

function send_msg(socket) {
    var msg = $('.send_textarea').val();
    if (msg != '')
        socket.emit('chat message_sended', msg);
    $('.send_textarea').val('');
}

function append_msg(msg_string, more_msg) {
    var msg_line = msg_string.split(',');
    var id = msg_line[0];
    var user = $('<span>').text(msg_line[1]);
    user.attr('class', 'msg_username');
    msg_line[2].replace('\n', "<br />");
    var msg_text = $('<span>').text(msg_line[2])
    msg_text.attr('class', 'msg_text');
    var time = $('<span>').text(msg_line[3]);
    time.attr('class', 'msg_date');

    var msg_div = $('<div>');
    msg_div.attr("class", "container-fluid msg rounded-lg w-100 m-0 mt-2");
    msg_div.attr("id", id);
    msg_div.append(user);
    msg_div.append(time);
    msg_div.append(msg_text);
    var list_obj = $(".chat_list");
    if (more_msg)
        msg_div.insertBefore('.msg:first');
    else
        list_obj.append(msg_div);
    $(".nano").nanoScroller();
    $(".nano").nanoScroller({ scroll: 'bottom' });
}

function append_user(user) {
    var users_list = $('#users_div');
    var user_div = $('<div>').attr('class', 'user_div rounded-lg');
    var user_span = $('<span>').attr('class', 'user');
    user_span.text(user);
    user_div.append(user_span);
    users_list.append(user_div);
    $(".nano2").nanoScroller();
    $(".nano2").nanoScroller({ scroll: 'top' });

}

function delete_user(user) {
    var user_list = $('.user_div');
    for (var i = 0; i < user_list.length; i++) {
        var user_span = user_list[i].firstChild.textContent;
        if (user_span == user)
            user_list[i].remove();
    }
    $(".nano2").nanoScroller();
    $(".nano2").nanoScroller({ scroll: 'top' });
}