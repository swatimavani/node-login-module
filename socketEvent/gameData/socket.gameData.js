const uuidv1 = require('uuid/v1');
const _ = require('lodash');
var gameData = {
    maxPlayersInRoom : config.game.maxPlayersInRoom,
    connectedUser : [],
    existingRooms : [],
    friendRooms : [],
    fullRooms : [],
    
}

function generateRoomName(){
    var rooms =  _.union(gameData.fullRooms,gameData.existingRooms,gameData.friendRooms);
    if(_.find(rooms,{'roomName' : newRoom})){
        generateRoomName();
    }else{
        var newRoom = "room" + uuidv1();
        return newRoom;
    }
}
var roomName = async function(){
    return await generateRoomName();
}
module.exports = {gameData,roomName}