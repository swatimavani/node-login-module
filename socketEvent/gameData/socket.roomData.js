const uuidv1 = require('uuid/v1');
const _ = require('lodash');
const constant = require('../../config/constant.conf');
var userController = require('../../controller/userController');

var gameData = {
    maxPlayersInRoom : config.game.maxPlayersInRoom,
    connectedUser : [],
    existingRooms : [],
    friendRooms : [],
    fullRooms : [],
    
}

var generateRoomName = function(){
    var newRoom = "room" + uuidv1();
    var rooms = Object.assign({}, gameData.fullRooms, gameData.existingRooms,gameData.friendRooms);
    if(_.find(rooms,{'roomName' : newRoom})){
        generateRoomName();
    }else{
        return newRoom;
    }
    
}

var setRoomInfo = (roomData) => {
    var roomInfo = roomData.room;
    roomInfo.noOfUsers = 1;
    roomInfo.userList = [];
    roomInfo.userList.push(roomData.user);
    return roomInfo;
    
}
var joinUserInRoom = (rooms,roomIndex,data) => {
    rooms[roomIndex].noOfUsers++;
    rooms[roomIndex].userList.push(data.user);
} 

var shiftToFullRoom = function (rooms,index){
    if(rooms[index].noOfUsers == rooms[index].roomSize){
        var firstRoom =  _.pullAt(rooms,[index]);
        if(firstRoom.length > 0){
            firstRoom[0].roomStatus = constant.roomStatus.FULL_ROOM;
            gameData.fullRooms[firstRoom[0].roomName] = firstRoom[0];           
        }
        return true;
    }
    else{
        return false;
    }
}

var changeStatus = async function(socket,status){   
    if(socket){
        await userController.manageUserStatus(socket.userId,status); 
        if(gameData.connectedUser[socket.userId]){
            gameData.connectedUser[socket.userId]["status"] = status; 
            socket.broadcast.emit('onChangeStatus',{user:{userId:socket.userId,status:status}});
        }
        
    }
    // else
        // socket.emit("errorEvent",{"Somthing went wrong"});
        
}
module.exports = {gameData,generateRoomName,setRoomInfo,joinUserInRoom,shiftToFullRoom,changeStatus}