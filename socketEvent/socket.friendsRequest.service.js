const uuidv1 = require('uuid/v1');
const _ = require('lodash');
var {gameData,generateRoomName} = require('./gameData/socket.gameData');
const {
        setSuccessResponse,
        setErrorResponse,
        setPlayerData,
        setRoomInfo,
        joinUserInRoom
    } = require('../utility/common');
const constant = require('../config/constant.conf');

module.exports = new socketFriendRequestServices;
function socketFriendRequestServices(){

}

socketFriendRequestServices.prototype.createRoom =  function(socket,data){
    if(gameData.connectedUser[socket.userId] && !gameData.connectedUser[socket.userId]["isInRoom"]){
        
        var newRoom =  generateRoomName();
        data.room.roomName = newRoom;
        data.room.roomStatus = constant.roomStatus.FRIEND_ROOM;
        
        data.user.userId = socket.userId;
        
        var roomInfo = setRoomInfo(data);
        gameData.friendRooms[newRoom] = roomInfo; 
        // gameData.friendRooms.push(roomInfo);
        gameData.connectedUser[socket.userId]["isInRoom"] = true;
        
        console.log(gameData.friendRooms);
        
        socket.join(roomInfo.roomName);
        socket.emit("onCreateFriendRoom",setSuccessResponse("Room created successfully.",{room:roomInfo}));
    
    }else{
        socket.emit('onFailRoomCreate',setErrorResponse('Fail to create room.'));
    }
}

socketFriendRequestServices.prototype.sendRequest = function(socket,data){
    if(gameData.connectedUser[socket.userId]["isInRoom"]){
        if(gameData.connectedUser[data.friendUserId]["status"] == config.userStatus[1] && !gameData.connectedUser[data.friendUserId]["isInRoom"]){
           console.log("data ", JSON.stringify(data));
           
           // var index = getPlayerRoomIndex(data.room.roomName);
            socket.to(gameData.connectedUser[data.friendUserId]["socketId"]).emit("onRequestSend",setSuccessResponse("Request Send",setPlayerData(socket.userId,data.room.roomName)));
        }
        else{
            socket.emit("onSendRequest",setErrorResponse("Requested player playing or offline."));
        }
    }
    else{
        socket.emit("onSendRequest",setErrorResponse("You are not in room. please create again."));
    }
}

socketFriendRequestServices.prototype.manageRequest = async function(socket,data,io){
    if(data.status == "accept"){
       // var index = await getPlayerRoomIndex(data.room.roomName);
        // if(index < 0){
        if(!gameData.friendRooms[data.room.roomName]){
            socket.emit("onRoomNotFound",setErrorResponse("player reject your request"));
            
            return;
        }
       data.user.userId = socket.userId;
       console.log("data.user.userId ",data.user.userId);
        
        joinUserInRoom(gameData.friendRooms,index,data);
        
        socket.join(data.room.roomName);
        gameData.connectedUser[socket.userId]["isInRoom"] = true;
        var responseData = {room:gameData.friendRooms[data.room.roomName],joinedUserId:data.user.userId};
        socket.emit("onJoinFriendRoom",setSuccessResponse('Room joined successfully.',responseData));   
        io.in(data.room.roomName).emit("onJoinFriendRoom",setSuccessResponse('Room joined successfully.',responseData));   
        var shiftedRoomName = shiftFromFriendToFullRoom(index);
        if(shiftedRoomName){
            io.in(data.room.roomName).emit("onGameStart",setSuccessResponse('Can play'));   
            
        }
    }
    else{
        socket.to(gameData.connectedUser[data.requestedUserId]["socketId"]).emit("onRejectRequest",setErrorResponse("player reject your request"));
    }
}

function shiftFromFriendToFullRoom(index){
    if(gameData.friendRooms[index].noOfUsers == gameData.friendRooms[index].roomSize){
        var firstRoom = _.pullAt(gameData.friendRooms,[index]);
        if(firstRoom.length > 0){
            firstRoom[0].roomStatus = constant.roomStatus.FULL_ROOM;
            gameData.fullRooms.push(firstRoom[0]);
            return firstRoom[0].roomName;
        }
        return false;
    }
    else{
        return false;
    }
}

// function getPlayerRoomIndex(roomName){
  
//     return _.findIndex(gameData.friendRooms, {roomName : roomName});
 
// }


