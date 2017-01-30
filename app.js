var express = require('express');
var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit: 100,
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'chatapp'
});
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
  var address = socket.handshake.address;
  socket.emit('assign_user_id', {user_id: socket.id});

socket.on('disconnect', function(data) {
  if (clients[socket.id] !== undefined) {
    current_users--;
    io.sockets.emit('remove_user', {current_users: current_users, disconnected_user: clients[socket.id]});
    delete clients[socket.id];

      var date = new Date();
      var utcDate = date.toUTCString();
    pool.query("UPDATE users SET end_session = NOW() WHERE user_id = ?", [socket.id], function(err, rows, fields) {
      if (!err) {
        console.log("successful update");
      }
      else {
        console.log('update failure');
      }
      //  connection.end();
    });
  }
  else {
    io.sockets.emit('remove_anon', {current_users: current_users});
  }
});

socket.on('connect_user', function(data) {
  var sender_id = socket.id;
  current_users++;
  clients[sender_id] = data.user_name;
  io.sockets.emit('add_user', {current_users: current_users, new_user: data.user_name});

  pool.query("INSERT INTO users (username, user_id) VALUES (?,?)", [clients[sender_id], sender_id], function(err, rows, fields) {
    if (!err) {
      console.log("successful insert");
    }
    else {
      console.log('insert failure');
    }
  });
});

socket.on('sendMessage', function(data) {
  var sender_id = socket.id;
  socket.broadcast.emit('user_message', {sender_name: clients[sender_id], sender_id: sender_id, message: data.message});

  pool.query("INSERT INTO messages (message, time_sent, sent_by) VALUES (?,NOW(),?)", [data.message, sender_id], function(err, rows, fields) {
    if (!err) {
      console.log("successful insert");
    }
    else {
      console.log(err);
    }
  });
});

});
http.listen(3000, '0.0.0.0', function(){
  console.log('listening on *:3000');
});
