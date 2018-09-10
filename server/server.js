const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');
const path = require('path');
const publicPath = path.join(__dirname, '../public');
const hbs = require('hbs');
const session = require('express-session');

var Hand = require('pokersolver').Hand;
var pokerOdds = require('poker-odds-calculator');
var {User} = require('./models/users');
var {mongoose} = require('./db/mongoose');
var {Clients} = require('./utils/client');
var {Players} = require('./utils/players');
var {newShuffledDeck} = require('./utils/generateDeck');
var players = new Players();

var clients = new Clients();
var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var deck = newShuffledDeck();
var m = [];

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


app.post('/getPlayerCards', (req,res) => {
    if (deck.length <= 48){
      deck = newShuffledDeck();
    };
     firstCard = deck[0];
     secondCard = deck[1];
     stringPlayer1 = firstCard + secondCard;
     objectPlayer1 = [
       firstCard,
       secondCard
    ];
    deck.shift();
    deck.shift();
    res.send(objectPlayer1);

});

app.post('/getSecondPlayerCards', (req,res) => {
  if (deck.length <= 48){
    deck = newShuffledDeck();
  };
  thirdCard = deck[0];
  fourthCard  = deck[1];
  stringPlayer2 = thirdCard + fourthCard;
  objectPlayer2 = [
    thirdCard,
    fourthCard
  ];
  deck.shift();
  deck.shift();
  res.send(objectPlayer2);

});

app.post('/getFlop', (req,res) => {
    res.send(getFlop());
});

function getFlop(){
   flopFirst = deck[0];
   flopSecond = deck[1];
   flopThird = deck[2];
   stringBoard = flopFirst + flopSecond + flopThird;
  var obj = [
    flopFirst,
    flopSecond,
    flopThird
  ];
  deck.shift();
  deck.shift();
  deck.shift();
  return obj;
}

function getTurn(){
  turn = deck[0];
  stringBoard += turn;
  deck.shift();
  return turn;
}

function getRiver(){
  river = deck[0];
  stringBoard += river;
  deck.shift();
  return river;
}

function getWinner(){
  m = [];
  var player1Cards = pokerOdds.CardGroup.fromString(`${stringPlayer1}`);
  var player2Cards = pokerOdds.CardGroup.fromString(`${stringPlayer2}`);
  var board = pokerOdds.CardGroup.fromString(`${stringBoard}`);
  var result = pokerOdds.OddsCalculator.calculate([player1Cards, player2Cards], board);
  var hand1value = result.equities[0].bestHandCount;
  // console.log('hand1value', stringPlayer1, hand1value);
  var hand2value = result.equities[1].bestHandCount;
  // console.log('hand2value', stringPlayer2, hand2value);
  if (hand1value > hand2value){
    m.push(firstCard);m.push(secondCard);m.push(flopFirst);m.push(flopSecond);m.push(flopThird);m.push(turn);m.push(river);
    hand = Hand.solve(m)
    return 'player1';
  }
  if (hand2value > hand1value){
    m.push(thirdCard);m.push(fourthCard);m.push(flopFirst);m.push(flopSecond);m.push(flopThird);m.push(turn);m.push(river);
    hand = Hand.solve(m)
    return 'player2';
  }
  if (hand1value == hand2value){
    m.push(firstCard);m.push(secondCard);m.push(flopFirst);m.push(flopSecond);m.push(flopThird);m.push(turn);m.push(river);
    hand = Hand.solve(m)
    return 'equal';
  }
}

// var hand = Hand.solve(['Ad', 'As', 'Jc', 'Th', '2d', 'Qs', 'Qd']);
// // var hand = Hand.solve(m);
// console.log(hand.name); // Two Pair
// console.log(hand.descr); // Two Pair, A's & Q's
//



function findAndUpdate(name,money){
  User.findOneAndUpdate({username: name}, {$set:{points: money}}, {new: true}, function(err, doc){
    if(err){
        console.log("Something wrong when updating data!");
    }

    console.log(doc);
  });
}


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

      socket.broadcast.to(roomNr).emit('gameStarts1');
      socket.emit('gameStarts2');


    } else if (players.getNameMoneyList(roomNr).length === 1) {
      socket.emit('soloView', players.getNameMoneyList(roomNr));

    }

  });




blindsCounter = 0;


  socket.on('emitBlinds1',function(){
    if (blindsCounter%2 == 0){
      blinds = [5,10];
    } else {
      blinds = [10,5];
    }
    socket.broadcast.to(roomNr).emit('betAreaPlayer1', blinds);
    socket.emit('betAreaPlayer2', blinds);
    socket.broadcast.to(roomNr).emit('player1Cards');
    socket.emit('player2Cards');

    blindsCounter++;
  })
  // });
  socket.on('emitBlinds2',function(){
    if (blindsCounter%2 == 0){
      blinds = [5,10];
    } else {
      blinds = [10,5];
    }
    socket.broadcast.to(roomNr).emit('betAreaPlayer2', blinds);
    socket.emit('betAreaPlayer1', blinds);
    socket.broadcast.to(roomNr).emit('player2Cards');
    socket.emit('player1Cards');
    blindsCounter++;
  })

  socket.on('initializeFlop', function(){
    io.to(roomNr).emit('flop', getFlop());
  });

  socket.on('initializeTurn', function(){
    io.to(roomNr).emit('turn', getTurn());
  });

  socket.on('initializeRiver', function(){
    io.to(roomNr).emit('river', getRiver());
  });

  socket.on('finalPot', function(){
    io.to(roomNr).emit('finalizePot');
  });

  socket.on('emitActivated1',function(){
        socket.emit('activePlayer', true)
        socket.broadcast.to(roomNr).emit('activePlayer', false);
  })
  socket.on('emitActivated2', function(){
      socket.emit('activePlayer', false)
      socket.broadcast.to(roomNr).emit('activePlayer', true);
  })

  socket.on('changeActivePlayer', function(){

    socket.emit('activePlayer', false)
     socket.broadcast.to(roomNr).emit('activePlayer', true);
  });

  socket.on('setBlinds', function(){

    socket.emit('smallBlindPlayer', false)
    socket.broadcast.to(roomNr).emit('smallBlindPlayer', true);
  })


 socket.on('updateMoney', function(users){
   //findAndUpdate(name,money);
   findAndUpdate(users.player1name, users.player1money);
   findAndUpdate(users.player2name, users.player2money);

 });

socket.on('activateCheckForOpponent',function(){
  socket.broadcast.to(roomNr).emit('checkForCheck', true);
})

socket.on('deactivateCheckForCurrent', function(){
  socket.emit('checkForCheck', false);
})

socket.on('allIn', function(){
  io.to(roomNr).emit('finalCountdown');
});

socket.on('winner',function(users){
  socket.emit('player1money', users)
   socket.broadcast.to(roomNr).emit('player2money', users);
});

socket.on('afterCall',function(users){
  socket.emit('player1afterCall', users)
   socket.broadcast.to(roomNr).emit('player2afterCall', users);
})

socket.on('afterBet',function(users){
  socket.emit('player1afterBet', users)
   socket.broadcast.to(roomNr).emit('player2afterBet', users);
})

socket.on('showCards1', function(){
  console.log('showcards1')
  socket.emit('turnCardsPlayer1', objectPlayer2)
  socket.broadcast.to(roomNr).emit('turnCardsPlayer2', objectPlayer1);
  if (getWinner() == 'player1'){
    console.log('player1wins')
    socket.emit('afterShowdown1', hand.descr);
    socket.broadcast.to(roomNr).emit('afterShowdown2', hand.descr);
  }
  if (getWinner() == 'player2'){
    console.log('player2wins')
    socket.emit('afterShowdown2', hand.descr);
    socket.broadcast.to(roomNr).emit('afterShowdown1', hand.descr);
  }
  if (getWinner() == 'equal'){
    console.log('equal');
    socket.emit('equal1', hand.descr);
    socket.broadcast.to(roomNr).emit('equal2', hand.descr);
  }
});


socket.on('showCards2', function(){
  console.log('showcards2');
  socket.emit('turnCardsPlayer1', objectPlayer1)
  socket.broadcast.to(roomNr).emit('turnCardsPlayer2', objectPlayer2);
  if (getWinner() == 'player1'){
    console.log('player1wins');
    socket.emit('afterShowdown2', hand.descr);
    socket.broadcast.to(roomNr).emit('afterShowdown1', hand.descr);
  }
  if (getWinner() == 'player2'){
    console.log('player2wins');
    socket.emit('afterShowdown1', hand.descr);
    socket.broadcast.to(roomNr).emit('afterShowdown2', hand.descr);
  }
  if (getWinner() == 'equal'){
    console.log('equal');
    socket.emit('equal1', hand.descr);
    socket.broadcast.to(roomNr).emit('equal2', hand.descr);
  }
});
  // // socket.on('disconnect',  function(){
  //   console.log('user was disconnected');
  //   var player = players.removePlayer(socket.id);
  //   if (player){
  //     io.to(roomNr).emit('soloView', players.getNameMoneyList(roomNr));
  //
  //   }
  // });
});







server.listen(3000, () => {
  console.log('server up and runnin');
});

module.exports = app;
