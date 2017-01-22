 var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('css'));
app.use(express.static('js'));
app.get('/', function(req, res){
  res.sendfile('index.html');
});

var current_users = 0;

//Whenever someone connects this gets executed
io.on('connection', function(socket){
  current_users++;
  io.sockets.emit('current_users', {current_users: current_users});

  socket.on('disconnect', function(data) {
    current_users--;
    io.sockets.emit('current_users', {current_users: current_users});
  });

  socket.on('sendMessage', function(data) {
    socket.broadcast.emit('user_message', {sender_name: data.sender_name, sender_id: data.sender_id, message: data.message});
  });


});
http.listen(3000, '0.0.0.0', function(){
  console.log('listening on *:3000');
});
