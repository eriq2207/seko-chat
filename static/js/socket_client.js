function socket_req_handling() {
    var login = '';
    var nr_of_msg = 0;
    //init socket io
    var socket = io();
    setInterval(check_connection, 1000, socket);
    //Send message with Enter pressed
    $('#send_textbox').keypress(function(e) {
        if (e.which == 13 && !e.shiftKey) {
            $('#send_form').submit();
            e.preventDefault();
        }
    });
    //Send login with Enter pressed
    $('#send_login_textbox').keypress(function(e) {
        if (e.which == 13 && !e.shiftKey) {
            $('#send_login_form').submit();
            e.preventDefault();
        }
    });
    //Show load more when scrolled to top
    document.getElementById('chat_list').onscroll = () => {
            var pos = document.getElementById('chat_list').scrollTop;
            var show_more_window = $('#load_more_msg_id');
            if (pos > 10)
                show_more_window.css('display', 'none');
            else
                show_more_window.css('display', 'block');
        }
        //Load more messages on click
    $('#load_more_msg_id').on('click', () => {
            socket.emit('load_more_req', nr_of_msg);
        })
        //Sending login data and handle response
    $('#send_login_form').submit(function(e) {
        e.preventDefault();
        $.post("login", {
                username: $('#send_login_textbox').val(),
                password: $('#send_password_textbox').val(),
                id: socket.id,
            },
            function(msg, status) {
                switch (msg) {
                    case '1':
                        {
                            login = $('#send_login_textbox').val();
                            $('#login_div').css('display', 'none');
                            $('#chat_list').css('display', 'block');
                            $('#send_textbox').prop('disabled', false);
                            $('#send_btn').prop('disabled', false);
                            $('#send_textbox').focus();
                        }
                    case '0':
                        {
                            if (!$('#warning_id').length) {
                                var warning = $('<p1>').text("Błędna nazwa użytkownika lub hasło");
                                warning.attr('id', 'warning_id');
                                warning.css('color', 'red');
                                $('#login_div').append(warning);
                            }
                        }
                    case '-1':
                        {
                            var warning = $('<p1>').text("Problem z połączeniem z bazą danych. Skontaktuj się z administratorem.");
                            warning.attr('id', 'warning_id');
                            warning.css('color', 'red');
                            if (!$('#warning_id').length) {
                                $('#login_div').append(warning);
                            }
                        }
                }
            });
    });
    //Sending message to server
    $('#send_form').submit(function(e) {
        e.preventDefault(); // prevents page reloading
        var msg = $('#send_textbox').val();
        if (msg != '')
            socket.emit('chat message', $('#send_textbox').val());
        $('#send_textbox').val('');
        return false;
    });
    //Receiving more messages from server
    socket.on('more messages', function(msg) {
        var msg_array = msg.split(';');
        for (var i = 0; i < msg_array.length - 1; i++) {
            var msg_line = msg_array[i].split(',');
            var chat_msg = $('<li>').text(msg_line[0] + ': ' + msg_line[1]);

            if (msg_line[0] === login)
                chat_msg.attr('class', 'chat_my_message');

            var list_obj = document.getElementById("chat_list");
            var chat_list = $('#chat_list');
            chat_list.prepend(chat_msg);
            nr_of_msg++;
        }
    })

    //Receiving message from server
    socket.on('chat message', function(msg) {
        var el = $('<li>').text(msg);

        var received_login = msg.split(':', 1);
        if (received_login == login) {
            el.attr('class', 'chat_my_message');
        }
        $('#chat_list').append(el);
        nr_of_msg++;
        scroll_list_down();

    });
    //Update users list
    socket.on('users update', function(msg) {
        var users = msg.split(';', 200);
        var users_list = $('#users_list');
        users_list.empty();
        for (i = 0; i < users.length - 1; i++) {
            var el = $('<li>').text(users[i]);
            users_list.append(el);
        }
    });
    socket.on('user add', function(msg) {
        var chat_msg = $('<li>').text(msg + ' dołączył/a do czatu');
        var user_msg = $('<li>').text(msg);
        var user_list = $('#users_list');
        var chat_list = $('#chat_list');

        chat_msg.css('color', 'blue');

        user_list.append(user_msg);
        chat_list.append(chat_msg);
        scroll_list_down();
    });
    socket.on('user delete', function(msg) {
        var chat_msg = $('<li>').text(msg + ' opuścił/a czat');
        var chat_list = $('#chat_list');
        var user_list = $('#users_list');
        chat_msg.css('color', 'blue');
        chat_list.append(chat_msg);
        scroll_list_down();
        var childs = user_list.children();
        for (var i = 0; i < childs.length; i++) {
            var child = childs[i];
            if (child.textContent === msg) {
                child.remove();
                break;
            }
        }
    });
    socket.on('chat all message', function(msg) {
        var msg_array = msg.split(';');
        for (var i = msg_array.length - 2; i >= 0; i--) {
            var msg_line = msg_array[i].split(',');
            var chat_msg = $('<li>').text(msg_line[0] + ': ' + msg_line[1]);

            if (msg_line[0] === login)
                chat_msg.attr('class', 'chat_my_message');

            var list_obj = document.getElementById("chat_list");
            var chat_list = $('#chat_list');
            chat_list.append(chat_msg);
            nr_of_msg++;
            scroll_list_down();
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

function scroll_list_down() {
    $("body").on('DOMSubtreeModified', "#chat_div", function() {
        var list_obj = document.getElementById("chat_list");
        if (list_obj != null)
            list_obj.scrollTop = list_obj.scrollHeight;
    });
}