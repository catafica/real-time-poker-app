var socket = io();
var stats1 = document.getElementById('first-player-stats');
var stats2 = document.getElementById('second-player-stats');
var user1 = document.querySelector('.user1');
var user2 = document.querySelector('.user2');
var betAreaPlayer1 = document.querySelector('.betAreaPlayer1');
var betPlayer1 = document.querySelector('.baniPlayer1');
var betAreaPlayer2  = document.querySelector('.betAreaPlayer2');
var betPlayer2 = document.querySelector('.baniPlayer2');
var potArea = document.querySelector('.potArea');
var pot = document.querySelector('.pot');
var board1 = document.getElementById('board1');
var board2 = document.getElementById('board2');
var board3 = document.getElementById('board3');
var card1 = document.getElementById('card1');
var card2 = document.getElementById('card2');
var card3 = document.getElementById('card3');
var card4 = document.getElementById('card4');
var money1 = document.getElementById('money1');
var money2 = document.getElementById('money2');
var clock = document.getElementById('clock');
var fold = document.getElementById('fold');
var check =  document.getElementById('check');
var call =  document.getElementById('call');
var bet =  document.getElementById('bet');
var betRangeMax = document.getElementById('test5');
var betInput = document.getElementById('bet-input');
var minButton = document.getElementById('min');
var bbButton = document.getElementById('bb');
var potButton = document.getElementById('pot');
var maxButton = document.getElementById('max');
var myPot = document.getElementById('myPot');
var descriptionBox = document.getElementById('hand-description');
var handPlayerHolding = document.getElementById('playerHolding');
var handPlayerName = document.getElementById('playerName');
var bigPot = 0;
activePlayer = false;
smallBlind = false;
bbPlayer = false;
checkActivated = false;
next = true;
allInValue = false;

$.ajax({
    url: `/getUser`,
    method: "Get",
    dataType: "json",
    contentType: 'application/json',
  }).done(function(results){
    params = results;
  })

  socket.on('connect', function(){
    console.log('client connected');

    socket.emit('join', params);

  });

  socket.on('bye', function(){
  window.location.href = '/';
  alert('Two players max per room');
})

socket.on('firstPlayerView',function(players){
  stats1.style.background = 'linear-gradient(#f9a825 , #f57f17)';
  user1.innerHTML = `${players[0].name}`;
  money1.innerHTML = `${players[0].money}$`;
  stats2.style.background = 'linear-gradient(#f9a825 , #f57f17)';
  user2.innerHTML = `${players[1].name}`;
  money2.innerHTML = `${players[1].money}$`;
  player1money = players[0].money;
  player1name = players[0].name
  player2money = players[1].money;
  player2name = players[1].name;

});


socket.on('secondPlayerView', function(players){
  stats1.style.background = 'linear-gradient(#f9a825 , #f57f17)';
  user1.innerHTML = `${players[1].name}`;
  money1.innerHTML = `${players[1].money}$`;
  stats2.style.background = 'linear-gradient(#f9a825 , #f57f17)';
  user2.innerHTML = `${players[0].name}`;
  money2.innerHTML = `${players[0].money}$`;
  player1money = players[1].money;
  player1name = players[1].name;
  player2money = players[0].money;
  player2name = players[0].name;

});


socket.on('gameStarts1',function(){
  introGame();
  setTimeout(function(){
      setBlinds();
  }, 9500);
  setTimeout(function(){
      emitBlinds();
  }, 9600)
});

socket.on('gameStarts2',function(){
  introGame();

});


socket.on('betAreaPlayer1',function(bet){
  allInValue = false;
  descriptionBox.classList.add('no-display');
  potArea.classList.add('no-display');
  betAreaPlayer1.classList.remove('no-display');
  betAreaPlayer2.classList.remove('no-display');
  betPlayer1.innerHTML = `${bet[0]}$`;
  betPlayer2.innerHTML = `${bet[1]}$`;
  player1money -= bet[0];

  player2money -= bet[1];
  betRangeMax.setAttribute('max', player1money);
  smallPot1 = bet[0];
  smallPot2 = bet[1];

  money1.innerHTML = `${player1money}$`;
  money2.innerHTML = `${player2money}$`;
  if (bet[1] < bet[0]){
    changeActivePlayer();
    bbPlayer = true;
  } else {
    bbPlayer = false;
  }
});

socket.on('betAreaPlayer2', function(bet){
  allInValue = false;
  descriptionBox.classList.add('no-display');
  potArea.classList.add('no-display');
  betAreaPlayer1.classList.remove('no-display');
  betAreaPlayer2.classList.remove('no-display');
  betPlayer1.innerHTML = `${bet[1]}$`;
  betPlayer2.innerHTML = `${bet[0]}$`;
  player1money -= bet[1];
  player2money -= bet[0];
  betRangeMax.setAttribute('max', player1money);
  smallPot1 = bet[1];
  smallPot2 = bet[0];


  money1.innerHTML = `${player1money}$`;
  money2.innerHTML = `${player2money}$`;
  if (bet[0] < bet[1]){
    changeActivePlayer();
    bbPlayer = true;
  } else {
    bbPlayer = false;
  }

});

//
// card1.src = 'img/cards/2c.png';
// card2.src = 'img/cards/2d.png';
//



socket.on('player1Cards', function(){
    resetFlop();
    $.ajax({
      url: `/getPlayerCards`,
      method: "POST",
      dataType: "json",
      contentType: 'application/json'
    }).done(function(cards){
      card1.src = `img/cards/${cards[0]}.png`;
      card2.src = `img/cards/${cards[1]}.png`;
      card1.classList.remove('none');
      card2.classList.remove('none');

    });
  });



socket.on('player2Cards',function(){
  resetFlop();
  $.ajax({
    url: `/getSecondPlayerCards`,
    method: "POST",
    dataType: "json",
    contentType: 'application/json'
  }).done(function(cards){
    card1.src = `img/cards/${cards[0]}.png`;
    card2.src = `img/cards/${cards[1]}.png`;
    card3.classList.remove('none');
    card4.classList.remove('none');
  })
});

//
socket.on('flop', function(cards){
    setTimeout(function(){
      board1.src = `img/cards/${cards[0]}.png`;
      board1.classList.remove('none');
      board1.classList.remove('opacity');
    }, 300);
    setTimeout(function(){
      board2.src = `img/cards/${cards[1]}.png`;
      board2.classList.remove('none');
      board2.classList.remove('opacity');
    }, 350);
    setTimeout(function(){
      board3.src = `img/cards/${cards[2]}.png`;
      board3.classList.remove('none');
      board3.classList.remove('opacity');
    }, 400);

     console.log('smallPot1', smallPot1);
     console.log('smallPot2', smallPot2);

    bigPot = smallPot1 + smallPot2;
    console.log('big pot', bigPot)
    smallPot1 = 0;
    smallPot2 = 0;
    setTimeout(function(){
      betAreaPlayer1.classList.add('no-display');
      betAreaPlayer2.classList.add('no-display');
      myPot.innerHTML = `${bigPot}$`;
      potArea.classList.remove('no-display');
    }, 0);

});

socket.on('turn', function(card){
    setTimeout(function(){
      board4.src = `img/cards/${card}.png`;
      board4.classList.remove('none');
      board4.classList.remove('opacity');
    }, 300);

    bigPot += smallPot1 + smallPot2;
    smallPot1 = 0;
    smallPot2 = 0;
    setTimeout(function(){
      betAreaPlayer1.classList.add('no-display');
      betAreaPlayer2.classList.add('no-display');
      myPot.innerHTML = `${bigPot}$`;
      potArea.classList.remove('no-display');
    }, 0);

});

socket.on('river', function(card){
    setTimeout(function(){
      board5.src = `img/cards/${card}.png`;
      board5.classList.remove('opacity');
      board5.classList.remove('none');
    }, 300);

    bigPot += smallPot1 + smallPot2;
    smallPot1 = 0;
    smallPot2 = 0;
    setTimeout(function(){
      betAreaPlayer1.classList.add('no-display');
      betAreaPlayer2.classList.add('no-display');
      myPot.innerHTML = `${bigPot}$`;
      potArea.classList.remove('no-display');
    }, 0);
});

socket.on('finalizePot', function(){
    bigPot += smallPot1 + smallPot2;
    smallPot1 = 0;
    smallPot2 = 0;
    betAreaPlayer1.classList.add('no-display');
    betAreaPlayer2.classList.add('no-display');
    myPot.innerHTML = `${bigPot}$`;
    potArea.classList.remove('no-display');
})


socket.on('activePlayer',function(activ){
  activePlayer = activ;
  if (activePlayer){
    resetWaitActive();
    resetTimer();
    setTimer();
    resetWaitInactive();
    startWaitActive()
  } else if (!activePlayer){
    resetWaitInactive();
    resetTimer();
    startWaitForInactive();
    resetWaitActive();
  }
})

socket.on('smallBlindPlayer', function(activ){
  smallBlindPlayer = activ;

});






socket.on('soloView', function(players){
  (function (){
    stats1.style.background = 'linear-gradient(#f9a825 , #f57f17)';
    user1.innerHTML = `${players[0].name}`;
    money1.innerHTML = `${players[0].money}$`;
    stats2.style.background = 'grey';
    user2.innerHTML = `Empty`;
    money2.innerHTML = 'Seat';
  }())
});


  socket.on('disconnect', function(){
    console.log('user was disconnected');
  });



function introGame(){
  document.getElementById('startsIn');
  var countDown = document.getElementById('startsCD');
  var intro = document.getElementById('intro');
  intro.style.display = 'block';
  counter = 9;
  countDown.innerHTML = counter;
  var firstInterval = setInterval(function(){

    counter -= 1;
    countDown.innerHTML = counter;
    if (counter == 0){
      clearInterval(firstInterval);
      intro.style.display = 'none';
    }
  }, 1000)
}

function resetFlop(){
  card3.src = 'img/cardback.png';
  card4.src = 'img/cardback.png';
  board1.src = 'img/cardback.png';
  board1.classList.add('none');
  board1.classList.add('opacity');
  board2.src = 'img/cardback.png';
  board2.classList.add('none');
  board2.classList.add('opacity');
  board3.src = 'img/cardback.png';
  board3.classList.add('none');
  board3.classList.add('opacity');
  board4.src = 'img/cardback.png';
  board4.classList.add('none');
  board4.classList.add('opacity');
  board5.src = 'img/cardback.png';
  board5.classList.add('none');
  board5.classList.add('opacity');
}

function setTimer(){
  clock.style.display = 'inline';
  var timer = document.getElementById('timer');
  var count = 39;
  timer.innerHTML = count;
   timerInterval = setInterval(function(){

    count -= 1;
    if (count == 1){
      activePlayer = false;
    }
    timer.innerHTML = count;
    if (count == 0){
      foldActivePlayer();
      clearInterval(timerInterval);
      clock.style.display = 'none';
      timer.innerHTML = 40;
    }
  }, 1000)
}

function nextPhase(){
  if (board1.classList.contains('none')){
    next = true;
    socket.emit('initializeFlop');
  } else if (!board1.classList.contains('none') && board4.classList.contains('none')){
    next = true;
    socket.emit('initializeTurn');
  } else if (!board1.classList.contains('none') && !board4.classList.contains('none') && board5.classList.contains('none')){
    next = true;
    socket.emit('initializeRiver');
  } else if (!board1.classList.contains('none') && !board4.classList.contains('none') && !board5.classList.contains('none')){
    next = false;
    socket.emit('finalPot');
    showdown();

  }
}

function hidePots(){
  betAreaPlayer1.classList.add('no-display');
  betAreaPlayer2.classList.add('no-display');
  potArea.classList.add('no-display');
}


function testHighlight(stats){
  setTimeout(function(){
    stats.style.background = '#00e676';
  }, 100)
  setTimeout(function(){
    stats.style.borderColor = 'green';
  }, 200)
  setTimeout(function(){
    stats.style.borderColor = 'white';
  }, 500)
  setTimeout(function(){
    stats.style.borderColor = 'green';
  }, 800)
  setTimeout(function(){
    stats.style.borderColor = 'white';
  }, 1100)
  setTimeout(function(){
    stats.style.borderColor = 'green';
  }, 1400)
  setTimeout(function(){
    stats.style.borderColor = 'white';
  }, 1700)
  setTimeout(function(){
    stats.style.borderColor = 'green';
  }, 2000)
  setTimeout(function(){
    stats.style.borderColor = 'white';
    stats.style.background = 'linear-gradient(#f9a825 , #f57f17)';
  }, 2350)


}

function epic(stats){
  setTimeout(function(){
    stats.style.background = '#00e676';
  }, 100)
  setTimeout(function(){
    stats.style.borderColor = 'green';
  }, 200)
  setTimeout(function(){
    stats.style.borderColor = 'white';
  }, 600)
  setTimeout(function(){
    stats.style.borderColor = 'green';
  }, 1000)
  setTimeout(function(){
    stats.style.borderColor = 'white';
  }, 1400)
  setTimeout(function(){
    stats.style.borderColor = 'green';
  }, 1800)
  setTimeout(function(){
    stats.style.borderColor = 'white';
  }, 2200)
  setTimeout(function(){
    stats.style.borderColor = 'green';
  }, 2600)
  setTimeout(function(){
    stats.style.borderColor = 'white';
  }, 3000)
  setTimeout(function(){
    stats.style.borderColor = 'green';
  }, 3400)
  setTimeout(function(){
    stats.style.borderColor = 'white';
  }, 3800)
  setTimeout(function(){
    stats.style.borderColor = 'green';
  }, 4200)
  setTimeout(function(){
    stats.style.borderColor = 'white';
  }, 4600)
  setTimeout(function(){
    stats.style.borderColor = 'white';
  }, 5000)
  setTimeout(function(){
    stats.style.background = 'linear-gradient(#f9a825 , #f57f17)';
    stats.style.borderColor = 'white';
  }, 5400);

}

function highlight(stats){
  setTimeout(function(){
    stats.style.background = '#00e676';
  }, 100)
  setTimeout(function(){
    stats.style.background = '#76ff03';
  }, 200)
  setTimeout(function(){
    stats.style.background = '#00e676';
  }, 250)
  setTimeout(function(){
    stats.style.background = '#76ff03';
  }, 350)
  setTimeout(function(){
    stats.style.background = '#00e676';
  }, 400)
  setTimeout(function(){
    stats.style.background = '#76ff03';
  }, 500)
  setTimeout(function(){
    stats.style.background = '#00e676';
  }, 550)
  setTimeout(function(){
    stats.style.background = '#76ff03';
  }, 650)
  setTimeout(function(){
    stats.style.background = '#00e676';
  }, 700)
  setTimeout(function(){
    stats.style.background = '#76ff03';
  }, 800)
  setTimeout(function(){
    stats.style.background = '#00e676';
  }, 850)
  setTimeout(function(){
    stats.style.background = '#76ff03';
  }, 950)
  setTimeout(function(){
    stats.style.background = '#00e676';
  }, 100)
  setTimeout(function(){
    stats.style.background = 'linear-gradient(#f9a825 , #f57f17)';
  }, 1100)
}


function startWaitActive(){
  actInterval = setInterval(function(){
    if (stats1.style.borderColor == 'white'){
      stats1.style.borderColor = '#455a64';
    } else {
      stats1.style.borderColor = 'white';
    }
  }, 500)
}

function startWaitForInactive(){
  waitInterval = setInterval(function(){
    if (stats2.style.borderColor == 'white'){
      stats2.style.borderColor = '#455a64';
    } else {
      stats2.style.borderColor = 'white';
    }
  }, 500)
}

function resetWaitInactive(){
  try {
    clearInterval(waitInterval);
  }
  catch(err){

  }
  stats2.style.borderColor = 'white';
}

function resetWaitActive(){
  try {
    clearInterval(actInterval);
  }
  catch(err){

  }
  stats1.style.borderColor = 'white';
}



function stopClocks(){
  resetTimer();
  resetWaitActive();
  resetWaitInactive();
}

function resetTimer(){
  try {
    clearInterval(timerInterval);
  }
  catch(err) {

  }
  clock.style.display = 'none';
}


function changeActivePlayer(){
  socket.emit('changeActivePlayer');
}


function setBlinds(){
  socket.emit('setBlinds')
}

function emitFlop(){
  socket.emit('initializeFlop');
}

function emitBlinds(){
  if (smallBlindPlayer){
    socket.emit('emitBlinds1');
  } else if (!smallBlindPlayer){
    socket.emit('emitBlinds2');
  }
}

function startFromBB(){
  if (bbPlayer){
    socket.emit('emitActivated1');
  } else if (!bbPlayer){
    socket.emit('emitActivated2');
  }
}


function foldActivePlayer(){

  if (bigPot){
    pot = smallPot1 + smallPot2 + bigPot;
  } else {
    pot = smallPot1 + smallPot2;
  }
  player2money += pot;

  var obj = {
    player1money,
    player1name,
    player2money,
    player2name,
    pot
  }
  socket.emit('updateMoney', obj);
  socket.emit('winner', obj);
}



socket.on('player1money',function(users){
  // from socket.emit('winner', obj)
  bigPot = 0;

  hidePots();
  money2.innerHTML = `${users.player2money}$`;
  stopClocks();
  testHighlight(stats2);
  setTimeout(function(){
    emitBlinds();
  }, 2370);

})

socket.on('player2money',function(users){
  // from socket.emit('winner', obj)

  bigPot = 0;
  player1money += users.pot;
  hidePots();
  money1.innerHTML = `${users.player2money}$`;
  money2.innerHTML = `${users.player1money}$`;
  stopClocks();
  testHighlight(stats1);


})


function callBet(){
  var valueToCall = smallPot2;
  if (smallPot1){
     if (smallPot1 == 5){
       moveToNext = false;
     } else {
       moveToNext = true;
     }
     valueCalled = smallPot2 - smallPot1;
     smallPot1 += valueCalled;
  } else {
    valueCalled = smallPot2;
    smallPot1 = valueCalled;
    moveToNext = true;
  }
  player1money -= valueCalled;
    var obj = {
      player1money,
      player1name,
      player2money,
      player2name,
      smallPot1
    }
    socket.emit('afterCall', obj);
    if (player1money == 0){
      allIn();
    }
}



socket.on('player1afterCall',function(users){

  money1.innerHTML = `${users.player1money}$`;
  betPlayer1.innerHTML = `${users.smallPot1}$`;
  betAreaPlayer1.classList.remove('no-display');
  betRangeMax.setAttribute('max', users.player1money);
})

socket.on('player2afterCall',function(users){

  money2.innerHTML = `${users.player1money}$`;
  betPlayer2.innerHTML = `${users.smallPot1}$`;
  betAreaPlayer2.classList.remove('no-display');
  smallPot2 = users.smallPot1;
  player2money = users.player1money;
  betRangeMax.setAttribute('max', users.player2money);
})

function allIn(){
  console.log(player1name, ' is all in');
  socket.emit('allIn');
}

socket.on('finalCountdown', function(){
  stopClocks();
  allInValue = true;
  if (board1.classList.contains('none')){
    next = true;
    socket.emit('initializeFlop');
    socket.emit('initializeTurn');
    socket.emit('initializeRiver');
    socket.emit('finalPot');
    showdown();
  }
})

function betAction(){
      if (bet > player2money && !smallPot2){
        bet = player2money;
      } else if (bet > player2money + smallPot2 && smallPot2 && !smallPot1){
        bet = player2money + smallPot2;
      } else if (bet > player2money + smallPot2 && smallPot2 && smallPot1){
        bet = player2money + smallPot2 - smallPot1;
      }
      if (smallPot1){
        var valueBet = bet + smallPot1;
        smallPot1 = valueBet;
        player1money -= bet;
      } else {
        smallPot1 = bet;
        player1money -= bet;
      }
      var obj = {
        player1money,
        player1name,
        player2money,
        player2name,
        smallPot1
      }
      socket.emit('afterBet', obj);
      if (player1money == 0){
        allIn()
      }
}



socket.on('player1afterBet', function(users){
  console.log('bigPot player1', bigPot);
  money1.innerHTML = `${users.player1money}$`;
  betAreaPlayer1.classList.remove('no-display');
  betPlayer1.innerHTML = `${users.smallPot1}$`;
  betRangeMax.setAttribute('max', users.player1money);
})

socket.on('player2afterBet', function(users){
  console.log('bigPot player2', bigPot);
  money2.innerHTML = `${users.player1money}$`;
  betAreaPlayer2.classList.remove('no-display');
  betPlayer2.innerHTML = `${users.smallPot1}$`;
  smallPot2 = users.smallPot1;
  player2money = users.player1money;
  betRangeMax.setAttribute('max', users.player2money);

})








minButton.addEventListener('click',function(){
  betInput.value = 10;
  betRangeMax.value = 10;
})

bbButton.addEventListener('click',function(){
  betInput.value = 30;
  betRangeMax.value = 30;
})

potButton.addEventListener('click',function(){
  if (bigPot){
    betInput.value = smallPot1 + smallPot2 + bigPot;
    betRangeMax.value = betInput.value;
  } else {
    try {
      betInput.value = smallPot1 + smallPot2;
      betRangeMax.value = betInput.value;
    }
    catch(err){

    }
  }
})

maxButton.addEventListener('click',function(){
  betInput.value = betRangeMax.max;
  betRangeMax.value = betInput.value;
})

betRangeMax.addEventListener('click',function(){
  betInput.value = betRangeMax.value;
})







function showdown(){
  if (card3.classList.contains('none')){
    socket.emit('showCards1');
  } else {
    socket.emit('showCards2');
  }
}

socket.on('turnCardsPlayer1', function(cards){
  card3.src = `img/cards/${cards[0]}.png`;
  card4.src = `img/cards/${cards[1]}.png`;
  stopClocks();

});

socket.on('turnCardsPlayer2', function(cards){

  card3.src = `img/cards/${cards[0]}.png`;
  card4.src = `img/cards/${cards[1]}.png`;
  stopClocks();

});



socket.on('afterShowdown1', function(handDescription){
  console.log('aftershowdown1');
  console.log('handdescription', handDescription)
  player1money += bigPot;
  // bigPot = 0;
  money1.innerHTML = `${player1money}$`;
  handPlayerHolding.innerHTML = `${handDescription}`;
  handPlayerName.innerHTML = `You win with:`
  descriptionBox.classList.remove('no-display');
  epic(stats1);
  var obj = {
    player1money,
    player1name,
    player2money,
    player2name
  }
  socket.emit('updateMoney', obj);

  setTimeout(function(){
    emitBlinds();
  }, 5500);

});

socket.on('afterShowdown2', function(handDescription){
  console.log('aftershowdown2');
  console.log('handDescription', handDescription);
  player2money += bigPot;
  money2.innerHTML = `${player2money}$`;
  // bigPot = 0;
  handPlayerHolding.innerHTML = `${handDescription}`;
  handPlayerName.innerHTML = `${player2name} wins with:`
  descriptionBox.classList.remove('no-display');

  epic(stats2);
})









socket.on('equal1',function(handDescription){
    player1money += bigPot/2;
    player2money += bigPot/2;
    money1.innerHTML = `${player1money}$`;
    money2.innerHTML = `${player2money}$`;
    bigPot = 0;
    handPlayerHolding.innerHTML = `${handDescription}`;
    handPlayerName.innerHTML = `Split Pot`;
    descriptionBox.classList.remove('no-display');
    testHighlight(stats1);
    testHighlight(stats2);
    var obj = {
      player1money,
      player1name,
      player2money,
      player2name
    }
    socket.emit('updateMoney', obj);

    setTimeout(function(){
      emitBlinds();
    }, 2500);
})

socket.on('equal2',function(handDescription){
  player1money += bigPot/2;
  player2money += bigPot/2;
  money1.innerHTML = `${player1money}$`;
  money2.innerHTML = `${player2money}$`;
  bigPot = 0;
  handPlayerHolding.innerHTML = `${handDescription}`;
  handPlayerName.innerHTML = `Split Pot`;
  descriptionBox.classList.remove('no-display');
  testHighlight(stats1);
  testHighlight(stats2);
})








function deactivateCheckForCurrent(){
  socket.emit('deactivateCheckForCurrent');
}

function activateCheckForOpponent(){
  socket.emit('activateCheckForOpponent');
}

socket.on('checkForCheck',function(status){
  checkActivated = status;
});













check.addEventListener('click',function(){
  if (activePlayer){
    if (smallPot1 == smallPot2 && !checkActivated){
      changeActivePlayer();
      activateCheckForOpponent();
      deactivateCheckForCurrent();
    } else if (smallPot1 == smallPot2 && checkActivated){
      deactivateCheckForCurrent();
      nextPhase();
      if (next){
        startFromBB();
      }
    }
  };
});

call.addEventListener('click',function(){
  if (activePlayer && (smallPot1< smallPot2)){
    callBet();
    if (moveToNext){
      nextPhase();
      if (next){
          startFromBB();
      }

    } else {
      changeActivePlayer();
      activateCheckForOpponent();
      deactivateCheckForCurrent();
    }
  };
});

fold.addEventListener('click',function(){
  if (activePlayer){
    foldActivePlayer();
  };
});

bet.addEventListener('click',function(){
  if (activePlayer){
    bet = parseFloat(betInput.value);
    if (bet > smallPot2){
      betAction();
      deactivateCheckForCurrent();
      changeActivePlayer();
    }
  };
});
