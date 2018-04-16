const uuidv1 = require('uuid/v1');
const _ = require('lodash');
var gameData = {
    maxPlayersInRoom : config.game.maxPlayersInRoom,
    connectedUser : [],
    existingRooms : [],
    friendRooms : [],
    fullRooms : [],
    
}

var generateRoomName = function(){
    console.log(gameData.existingRooms);
    var newRoom = "room" + uuidv1();
    var rooms =  _.union(gameData.fullRooms,gameData.existingRooms,gameData.friendRooms);
    if(_.find(rooms,{'roomName' : newRoom})){
        generateRoomName();
    }else{
        return newRoom;
    }
    
}

module.exports = {gameData,generateRoomName}