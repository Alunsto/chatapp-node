var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('css'));
app.use(express.static('js'));
app.get('/', function(req, res){
  res.sendfile('index.html');
});

var clients = {};
var current_users = 0;

//Whenever someone connects this gets executed
io.on('connection', function(socket){
  socket.emit('assign_user_id', {user_id: socket.id});

  socket.on('disconnect', function(data) {
    if (clients[socket.id] !== undefined) {
      current_users--;
      io.sockets.emit('remove_user', {current_users: current_users, disconnected_user: clients[socket.id]});
      delete clients[socket.id];
    }
    else {
      io.sockets.emit('remove_anon', {current_users: current_users});
    }
  });

  socket.on('connect_user', function(data) {
    current_users++;
    clients[socket.id] = data.user_name;
    io.sockets.emit('add_user', {current_users: current_users, new_user: data.user_name});
  });

  socket.on('sendMessage', function(data) {
    var sender_id = socket.id;
    socket.broadcast.emit('user_message', {sender_name: clients[sender_id], sender_id: sender_id, message: data.message});
  });

});
http.listen(3000, '0.0.0.0', function(){
  console.log('listening on *:3000');
});
