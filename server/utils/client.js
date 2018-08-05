class Clients{
  constructor(){
    this.clients = [];
  }
  addClient(username,points,room){
    var obj = {
      username,
      points,
      room
    }
    this.clients.push(obj);
    return obj;
  }
  removeClient(username){
    var deletedPlayer = this.clients.filter(function(item){
      return item.username === username;
    })
    this.clients = this.clients.filter(function(item){
      return item.username != username;
    });
    return deletedPlayer;
  }
  getClient(username){
    var specificPlayer = this.clients.filter(function(item){
      if (item.username === username) return item
    });
    return specificPlayer[0];
  }
  getAll(){
    return this.clients;
  }
}


module.exports = {Clients};
