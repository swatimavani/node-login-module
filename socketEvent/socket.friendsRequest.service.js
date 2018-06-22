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

function socketFriendRequestServices(){}

socketFriendRequestServices.prototype.createRoom =  async function(socket,data){
    let userData = gameData.connectedUser[socket.userId];
    
    if(userData && userData.isInRoom === false){
        
        var newRoom =  await generateRoomName();
        
        data.room.roomName = newRoom;
        data.room.roomStatus = constant.roomStatus.FRIEND_ROOM;
        
        data.user.userId = socket.userId;
        
        var roomInfo = setRoomInfo(data);
        gameData.friendRooms[newRoom] = roomInfo; 
        
        changeStatus(socket,config.userStatus.PLAYING,true);
        
        socket.join(roomInfo.roomName);
        socket.emit("onCreateFriendRoom",setSuccessResponse("Room created successfully.",{room:roomInfo}));
    
    }else{
        socket.emit('onFailRoomCreate',setErrorResponse('Fail to create room.'));
    }
}

socketFriendRequestServices.prototype.sendRequest = async function(socket,data){
    
    let userData = gameData.connectedUser[socket.userId];
    
    if(userData.isInRoom){

        let friendUserData = gameData.connectedUser[data.friendUserId]?gameData.connectedUser[data.friendUserId]:null;
        
        if(friendUserData && friendUserData.status == config.userStatus.ONLINE && friendUserData.isInRoom === false){
            gameData.connectedUser[data.friendUserId].status = config.userStatus.PLAYING;
            var responseData = setSuccessResponse('Request received.',{friendRequest:{userId:socket.userId,roomName:data.room.roomName}})
            socket.to(friendUserData.socketId).emit("onReceiveRequest",responseData);
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
        let roomName = data.room.roomName;
        if(!gameData.friendRooms[roomName]){
            socket.emit("onRoomNotFound",setErrorResponse("Room not found."));        
            return;
        }
        
        data.user.userId = socket.userId;
        joinUserInRoom(gameData.friendRooms,friendRoomIndex,data);
        
        socket.join(roomName);  
        changeStatus(socket,config.userStatus.PLAYING,true);

        socket.emit("onJoinRoom",setSuccessResponse('Room joined successfully.',{room:gameData.friendRooms[roomName]})); 
        socket.to(roomName).emit("onOpponentJoinRoom",setSuccessResponse('Room joined successfully.',{user:data.user})); 
        
        var isRoomFull = shiftToFullRoom(gameData.friendRooms,roomName);
        if(isRoomFull){
            io.in(roomName).emit("onGameStart",setSuccessResponse('Can play'));   
        }
    }
    else{
        let userData = gameData.connectedUser[data.requestedUserId];
        gameDate.connectedUser[socket.userId].status = config.userStatus.ONLINE;
        if(userData)
            socket.to(userData.socketId).emit("onRejectRequest",setErrorResponse("player reject your request"));
    }
}


