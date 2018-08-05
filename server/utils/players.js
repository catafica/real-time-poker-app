class Players{
  constructor(){
    this.players = [];
  }
  addPlayer(id,name, money, room){
    var player = {id ,name, money, room};
    this.players.push(player);
    return player;
  }
  removePlayer(id){
    var deletedPlayer = this.players.filter(function(item){
      return item.id === id;
    })
    this.players = this.players.filter(function(item){
      return item.id != id;
    });
    return deletedPlayer;
  }
  getPlayer(id){
    var specificPlayer = this.players.filter(function(item){
      if (item.id === id) return item
    });
    return specificPlayer;
  }
  getPlayerByName(name){
    var specificPlayer = this.players.filter(function(item){
      if (item.name === name) return item
    });
    return specificPlayer[0];
  }
  getPlayersList(room){
    var loggedInRoom = this.players.filter(function(item){
      if (item.room === room) return item
    });
    var namesArray = loggedInRoom.map(function(user){
      return user.name
    });
    return loggedInRoom;
  }
  getNameMoneyList(room){
    var loggedInRoom = this.players.filter(function(item){
      if (item.room === room) return item
    });
    var nameMoneyArray = [];
    var i = 0;
    while (i < loggedInRoom.length){
      var obj = {
        name: loggedInRoom[i].name,
        money: loggedInRoom[i].money
      }
      nameMoneyArray.push(obj);
      i++;
    }
    return nameMoneyArray;
  }
}





module.exports = {Players};
