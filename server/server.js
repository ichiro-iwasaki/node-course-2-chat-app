require('./config/config');

const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');
const _ = require('lodash');
const passport = require('passport');

const {generateMessage, generateLocationMessage} = require('./utils/message');
const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');
var {authenticate} = require('./middleware/authenticate');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();

var {mongoose} = require('./db/mongoose');
var {User} = require('./models/user');


app.use(express.static(publicPath));
app.use(bodyParser.json());

io.on('connection', (socket) => {
  console.log('---New user connected');

  // ログイン
  socket.on('login', function(params){
    // emitでユーザー名を返却して、ルーム選択ページに追加したい

    console.log('---server.jsにつきました。');

    User.findByCredentials(params.name, params.password).then((user) => {
      console.log('---findByCredentialsが通りました。');
      return user.generateAuthToken().then((token) => {
        console.log('---generateAuthTokenが通りました。');
        res.header('x-auth', token);
        // .send(user)
        socket.emit('userFromDB', user);
      });
    }).catch((e) => {
      res.status(400).send();
    });
  });


  // チャットルームに参加
  socket.on('join', (params, callback) => {
    if (!isRealString(params.name) || !isRealString(params.room)) {
      return callback('Name and room name are required.');
    }

    socket.join(params.room);
    users.removeUser(socket.id);
    users.addUser(socket.id, params.name, params.room);

    io.to(params.room).emit('updateUserList', users.getUserList(params.room));
    socket.emit('newMessage', generateMessage('運営', 'イワチャットへようこそ！'));
    socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined.`));
    callback();
  });


  socket.on('createMessage', (message, callback) => {
    var user = users.getUser(socket.id);

    if (user && isRealString(message.text)) {
      io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
    }

    callback();
  });


  socket.on('createLocationMessage', (coords) => {
    var user = users.getUser(socket.id);

    if (user) {
      io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));
    }
  });

  socket.on('disconnect', () => {
    var user = users.removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('updateUserList', users.getUserList(user.room));
      io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left.`));
    }
  });
});

// user-sign up
app.post('/signup', (req, res) => {
  var body = _.pick(req.body, ['name', 'password']);
  var user = new User(req.body);

  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    // res.send(body);
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    res.status(400).send(e);
  })
});

// // user-login
// app.post('/users/login', (req, res) => {
//   var body = _.pick(req.body, ['name', 'password']);
//   // res.send(req.body);

//   User.findByCredentials(body.name, body.password).then((user) => {
//     return user.generateAuthToken().then((token) => {
//       // res.send(token);
//       res.header('x-auth', token).send(user);
//     });
//   }).catch((e) => {
//     res.status(400).send();
//   });
// });


server.listen(port, () => {
  console.log(`Server is up on ${port}`);
});
