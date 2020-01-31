function socket_init()
{
    var login='';
    //init socket io
    var socket = io();
    setInterval(check_connection,1000,socket);
    //Send message with Enter pressed
    $('#send_textbox').keypress(function(e){
        if(e.which == 13 && !e.shiftKey) {        
            $('#send_form').submit();
            e.preventDefault();
        }
    });
    //Send login with Enter pressed
    $('#send_login_textbox').keypress(function(e){
      if(e.which == 13 && !e.shiftKey) {        
          $('#send_login_form').submit();
          e.preventDefault();
      }});
    //Sending login data
    $('#send_login_form').submit(function(e){
      e.preventDefault();
      socket.emit('login request', $('#send_login_textbox').val()+';'+$('#send_password_textbox').val());
      login = $('#send_login_textbox').val();
    });
    //Receiving login status information
    socket.on('login request status',function(msg){
      if(msg=='1')
      {
        removeElement('login_div');
        addElement('chat_div','ul','chat_list','');
        $('#send_textbox').prop('disabled',false);
        $('#send_btn').prop('disabled',false);
        $('#send_textbox').focus();
      }
      else
      {
          login ='';
          if(!$('#warning_id').length)
          {
            var warning = $('<p1>').text("Błędna nazwa użytkownika lub hasło");
            warning.attr('id','warning_id');
            warning.css('color', 'red');
            $('#login_div').append(warning);
          }
      }
    });
    //Sending message to server
    $('#send_form').submit(function(e){
      e.preventDefault(); // prevents page reloading
      var msg = $('#send_textbox').val();
      if(msg!='')
        socket.emit('chat message', $('#send_textbox').val());
      $('#send_textbox').val('');
      return false;
    });
    //Receiving message from server
    socket.on('chat message', function(msg){
        console.log("Otrzymalem wiadomosc");
        var el = $('<li>').text(msg);

        var received_login = msg.split(':',1);
        if(received_login==login)
        {
          el.css('color', 'white');
          el.css('text-align','right');
          el.css('padding-right','3%');
        }

        $('#chat_list').append(el);

        var list_obj = document.getElementById("chat_list");
        list_obj.scrollTop = list_obj.scrollHeight;
    });
    //Updating user list
    socket.on('users update', function(msg){
      var users = msg.split(';',200);
      var users_list = $('#users_list');
      users_list.empty();
      for(i=0;i<users.length;i++)
      {
        var el = $('<li>').text(users[i]);
        users_list.append(el);
      }
  });
}
function addElement(parentId, elementTag, elementId, html) {
  // Adds an element to the document
  var p = document.getElementById(parentId);
  var newElement = document.createElement(elementTag);
  newElement.setAttribute('id', elementId);
  newElement.innerHTML = html;
  p.appendChild(newElement);
}
function removeElement(elementId) {
  // Removes an element from the document
  var element = document.getElementById(elementId);
  element.parentNode.removeChild(element);
}
function check_connection(socket){
  
  if(!socket.connected && !($('#con_err_msg').length))
  {
    var el = $('<li>').text("Problem z połączeniem z serwerem.. odśwież strone i zaloguj się ponownie");
    el.css('color', 'red');
    el.css('text-align','center');
    el.attr('id','con_err_msg');
    $('#chat_list').append(el);
  } 
}