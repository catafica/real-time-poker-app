class Room{
  constructor(){
    this.room = [];
  }
  removeRoom(){
    this.room = [];
  }
  addRoom(room){
    this.room.push(room);
    return room;
  }
  getRoom(){
    return this.room[0];
  }
}

module.exports = {Room};
