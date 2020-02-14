function page_animations() {
    $(".nano ").nanoScroller();
    $(".nano_users").nanoScroller();
    $('.rejestracja').click(() => {
        if ($('.rejestracja').html() == "Rejestracja") {
            $('#email').css('display', 'block');
            $('#login_btn').html("Zarejestruj się");
            $('#rejestracja_btn').html("Zaloguj się");
            $('#login_header').html("Zarejestruj się");
        } else {
            $('#email').css('display', 'none');
            $('#login_btn').html("Zaloguj się");
            $('#rejestracja_btn').html("Rejestracja");
            $('#login_header').html("Zaloguj się");
        }
        $('.information').text("");
        $('#username').val("");
        $('#password').val("");
        $('#email').val("");
    })

    $(".expand_user").click(() => {
        if (parseInt($(".users_div").css('width')) <= 10)
            animation_show_users_div();
    });

    $('.chat_div').click(() => {
        if ($(".users_div_block").css('display') == 'block' && parseInt($(".users_div_block").css('width')) >= 180)
            animation_hide_users_div();
    })
}

function animation_show_users_div() {
    var max_div_width = 180;
    var show_time_ms = 100;
    var frame_rate = 40;
    var users_div = $(".users_div");
    if (users_div.length == 0) {
        users_div = $(".users_div_block");
    } else {
        users_div.addClass('users_div_block');
        users_div.removeClass('users_div');
    }
    var users_div_width = parseInt(users_div.css('width'));
    if (users_div_width < max_div_width) {
        var loop_time = show_time_ms / 1000 * frame_rate;
        var add = max_div_width / loop_time;
        users_div.css('width', users_div_width + add + 'px');
        setTimeout(animation_show_users_div, 1000 / frame_rate);
    }

}

function animation_hide_users_div() {
    var max_div_width = 180;
    var show_time_ms = 100;
    var frame_rate = 40;
    var users_div = $(".users_div_block");
    var users_div_width = parseInt(users_div.css('width'));
    if (users_div_width >= 10) {
        var loop_time = show_time_ms / 1000 * frame_rate;
        var sub = max_div_width / loop_time;
        users_div.css('width', users_div_width - sub + 'px');
        setTimeout(animation_hide_users_div, 1000 / frame_rate);
    } else {
        users_div.removeClass('users_div_block');
        users_div.addClass('users_div');
    }
}