function socket_init()
{
    var socket = io();
    $('#send_textbox').keypress(function(e){
        if(e.which == 13 && !e.shiftKey) {        
            $('#send_form').submit();
            e.preventDefault();
        }
    });
    $('#send_form').submit(function(e){
      e.preventDefault(); // prevents page reloading
      socket.emit('chat message', $('#send_textbox').val());
      $('#send_textbox').val('');
      return false;
    });
    socket.on('chat message', function(msg){
        $('#chat_list_id').append($('<li>').text(msg));
        var list_obj = document.getElementById("chat_list_id");
        list_obj.scrollTop = list_obj.scrollHeight;
      });
}