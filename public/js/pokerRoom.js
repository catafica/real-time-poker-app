var socket = io();
var stats1 = document.getElementById('first-player-stats');
var stats2 = document.getElementById('second-player-stats');
var user1 = document.querySelector('.user1');
var user2 = document.querySelector('.user2');
var money1 = document.querySelector('.money1');
var money2 = document.querySelector('.money2');
var betAreaPlayer1 = document.querySelector('.betAreaPlayer1');
var betPlayer1 = document.querySelector('.baniPlayer1');
var betAreaPlayer2  = document.querySelector('.betAreaPlayer2');
var betPlayer2 = document.querySelector('.baniPlayer2');
var potArea = document.querySelector('.potArea');
var pot = document.querySelector('.pot');



$.ajax({
    url: `/getUser`,
    method: "Get",
    dataType: "json",
    contentType: 'application/json',
  }).done(function(results){
    console.log(results);
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
  stats1.style.background = 'orange';
  user1.innerHTML = `${players[0].name}`;
  money1.innerHTML = `${players[0].money}$`;
  stats2.style.background = 'orange';
  user2.innerHTML = `${players[1].name}`;
  money2.innerHTML = `${players[1].money}$`;

});


socket.on('secondPlayerView', function(players){
  stats1.style.background = 'orange';
  user1.innerHTML = `${players[1].name}`;
  money1.innerHTML = `${players[1].money}$`;
  stats2.style.background = 'orange';
  user2.innerHTML = `${players[0].name}`;
  money2.innerHTML = `${players[0].money}$`;

});


socket.on('gameStarts',function(){
  initializeGame();
  setTimeout(function(){
      socket.emit('initializeBetArea');
  }, 9500);

});

socket.on('betAreaPlayer1',function(bet){
  betAreaPlayer1.classList.remove('no-display');
  betAreaPlayer2.classList.remove('no-display');
  betPlayer1.innerHTML = `${bet[0]}$`;
  betPlayer2.innerHTML = `${bet[1]}$`;



});

socket.on('betAreaPlayer2', function(bet){
  betAreaPlayer1.classList.remove('no-display');
  betAreaPlayer2.classList.remove('no-display');
  betPlayer1.innerHTML = `${bet[1]}$`;
  betPlayer2.innerHTML = `${bet[0]}$`;
});






















socket.on('soloView', function(players){
  (function (){
    stats1.style.background = 'orange';
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

function initializeGame(){
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
      console.log('now');
      clearInterval(firstInterval);
      intro.style.display = 'none';
    }
  }, 1000)
}
