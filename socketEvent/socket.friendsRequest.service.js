const uuidv1 = require('uuid/v1');
const _ = require('lodash');
var {   gameData,
    generateRoomName,
    setRoomInfo,
    joinUserInRoom,
    shiftToFullRoom,
    changeStatus
} = require('./gameData/socket.roomData');
const { setSuccessResponse,setErrorResponse} = require('../utility/common');
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
        gameData.connectedUser[socket.userId]["isInRoom"] = true;
        changeStatus(socket,config.userStatus.PLAYING);
        
        console.log(gameData.friendRooms);
        
        socket.join(roomInfo.roomName);
        socket.emit("onCreateFriendRoom",setSuccessResponse("Room created successfully.",{room:roomInfo}));
    
    }else{
        socket.emit('onFailRoomCreate',setErrorResponse('Fail to create room.'));
    }
}

socketFriendRequestServices.prototype.sendRequest = function(socket,data){
    if(gameData.connectedUser[socket.userId]["isInRoom"]){
        if(gameData.connectedUser[data.friendUserId] && gameData.connectedUser[data.friendUserId]["status"] == config.userStatus.ONLINE && !gameData.connectedUser[data.friendUserId]["isInRoom"]){
           console.log("data ", JSON.stringify(data));
            var responseData = setSuccessResponse('Request send',{friendRequest:{userId:socket.userId,roomName:data.room.roomName}})
            socket.to(gameData.connectedUser[data.friendUserId]["socketId"]).emit("onSendRequest",responseData);
            socket.emit("onSendRequest",setErrorResponse("Request sent successfully."));
        }
        else{
            socket.emit("onSendRequest",setErrorResponse("Requested player playing or offline."));
        }
    }
    else{
        socket.emit("onSendRequest",setErrorResponse("You are not in room. please create again."));
    }
}

socketFriendRequestServices.prototype.manageRequest = function(socket,data,io){
    if(data.status == "accept"){
        var roomName = data.room.roomName;
        if(!gameData.friendRooms[roomName]){
            socket.emit("onRoomNotFound",setErrorResponse("Room not found."));        
            return;
        }
       data.user.userId = socket.userId;
       console.log("data.user.userId ",data.user.userId);
        
        joinUserInRoom(gameData.friendRooms,roomName,data);
        
        socket.join(roomName);
        gameData.connectedUser[socket.userId]["isInRoom"] = true;        
        changeStatus(socket,config.userStatus.PLAYING);

        socket.emit("onJoinRoom",setSuccessResponse('Room joined successfully.',{room:gameData.friendRooms[roomName]})); 
        socket.to(roomName).emit("onOpponentJoinRoom",setSuccessResponse('Room joined successfully.',{user:data.user})); 
        
        var isRoomFull = shiftToFullRoom(gameData.friendRooms,roomName);
        if(isRoomFull){
            io.in(roomName).emit("onGameStart",setSuccessResponse('Can play'));   
        }
    }
    else{
        if(gameData.connectedUser[data.requestedUserId])
            socket.to(gameData.connectedUser[data.requestedUserId]["socketId"]).emit("onRejectRequest",setErrorResponse("player reject your request"));
    }
}


