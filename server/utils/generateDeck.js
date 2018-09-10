function newShuffledDeck(){
  var deck = ['As','Ad','Ac','Ah','2s','2d','2c','2h','3s','3d','3c','3h','4s','4d','4c','4h','5s','5d','5c','5h','6s','6d','6c','6h','7s','7d','7c','7h','8s','8d','8c','8h','9s','9d','9c','9h','Ts','Td','Tc','Th','Js','Jd','Jc','Jh','Qs','Qd','Qc','Qh','Ks','Kd','Kc','Kh'];
  shuffleDeck(deck);
  return(deck);
}



function shuffleDeck(array){
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}


module.exports = {newShuffledDeck};
