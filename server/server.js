const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');
const path = require('path');
const publicPath = path.join(__dirname, '../public');
const hbs = require('hbs');
const session = require('express-session');

var {User} = require('./models/users');
var {mongoose} = require('./db/mongoose');
// var {Room} = require('./utils/roomNumber');
var {Clients} = require('./utils/client');
var {Players} = require('./utils/players');
var players = new Players();

// var room = new Room();
var clients = new Clients();
var app = express();
var server = http.createServer(app);
var io = socketIO(server);


app.use(bodyParser.json());

app.set('trust proxy', 1) // trust first proxy
var sess = {
  secret: 'keyboard cat',
  cookie: {}
}

if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
  sess.cookie.secure = true // serve secure cookies
}

app.use(session(sess))

app.set('view engine', 'hbs');
app.use(express.static(publicPath));

app.get('/', (req, res) => {

  if (req.session.user == null) {
    res.render('index.hbs');
    return;
  } else {
    res.writeHead(301,
        {Location: '/pokerRoom'}
      );
      res.end();
  }
});


app.get('/pokerRoom', (req, res) => {

  if (req.session.user != null) {
    // if(client.getClient() != []) {
        // }

    res.render('pokerRoom.hbs', {
      username: req.session.user.username,
      points: req.session.user.points,
      roomNumber: req.session.room
    });

  } else {
    res.writeHead(301,
      {Location: '/'}
    );
    res.end();
  }

});

app.post('/user', (req,res) => {
  var user = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  });
  user.save().then((doc) => {
    res.send(doc);
  }, (err) => {
    res.status(400).send(err);
  });
});

app.get('/getClient', (req,res) =>{
    // console.log('ajax',clients.getClient(req.session.user.username)[0]);
    res.send(clients.getClient(req.session.user.username));

});

app.get('/getUser', (req,res) =>{
  User.findOne({
    username: req.session.user.username
  }).then((user) =>{
   if (!user){
     return res.status(404).send();
   };
   res.send(user);
  }).catch((e) => {
    res.status(400).send();
  })
});


app.post('/login', (req,res) => {

  User.findOne({
    username: req.body.username,
    password: req.body.password
  }).then((user) =>{
   if (!user){
     return res.status(404).send();
   }
   req.session.user = user;
   req.session.room = req.body.room;
   room = req.session.room;

   if (clients.getClient(req.body.username)){
     clients.removeClient(req.body.username)
   }
   clients.addClient(req.body.username,user.points,req.session.room);

   if (!req.body.room){
     return res.send(false);
   }
   res.send(true);
  }).catch((e) => {
    res.status(400).send();
  })
});

app.get('/logout', (req, res) => {

  req.session.user = null;
  req.session.room = null;
  res.send(true);

});



io.on('connection', (socket) => {
  console.log('new user connected');

  socket.on('join', function(params){

    roomNr = room;
    socket.join(roomNr);


    players.removePlayer(socket.id);
    players.addPlayer(socket.id, params.username, params.points, roomNr);

    // if (players.getNameMoneyList(roomNr).length > 2){
    // socket.emit('bye');
    // }
    if (players.getNameMoneyList(roomNr).length === 2){
      socket.broadcast.to(roomNr).emit('firstPlayerView',players.getNameMoneyList(roomNr));
      socket.emit('secondPlayerView', players.getNameMoneyList(roomNr));
      io.to(roomNr).emit('gameStarts');


    } else if (players.getNameMoneyList(roomNr).length === 1) {
      socket.emit('soloView', players.getNameMoneyList(roomNr));

    }

  });





  socket.on('initializeBetArea',function(){
    var blinds = changeBlinds();
    socket.broadcast.to(roomNr).emit('betAreaPlayer1', blinds);
    socket.emit('betAreaPlayer2', blinds);

  });




  // socket.on('disconnect',  function(){
  //   console.log('user was disconnected');
  //   var player = players.removePlayer(socket.id);
  //   if (player){
  //     io.to(roomNr).emit('soloView', players.getNameMoneyList(roomNr));
  //
  //   }
  // });
});

var counter = 0;
function changeBlinds(){
  if (counter%2 == 0){
    var arr = [5,10];
  } else {
    var arr = [10,5];
  }
  counter ++;
  return arr;
}




server.listen(3000, () => {
  console.log('server up and runnin');
});

module.exports = app;
