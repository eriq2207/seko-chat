function socket_init()
{
    //init socket io
    var socket = io();
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
      socket.emit('login data', $('#send_login_textbox').val());
    });
    //Receiving login status information
    socket.on('login status',function(msg){
      if(msg=='1')
      {
        removeElement('login_div');
        addElement('chat_div','ul','chat_list','');
        $('#send_textbox').prop('disabled',false);
        $('#send_btn').prop('disabled',false);
      }
      else
      {

      }
    });
    //Sending message to server
    $('#send_form').submit(function(e){
      e.preventDefault(); // prevents page reloading
      socket.emit('chat message', $('#send_textbox').val());
      $('#send_textbox').val('');
      return false;
    });
    //Receiving message from server
    socket.on('chat message', function(msg){
        $('#chat_list').append($('<li>').text(msg));
        var list_obj = document.getElementById("chat_list");
        list_obj.scrollTop = list_obj.scrollHeight;
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