var userController = require('../controller/userController');
var roomServices = require('./socket.room.services');
var friendRequestServices = require('./socket.friendsRequest.service');
var {gameData,changeStatus} = require('./gameData/socket.roomData');
const {setSuccessResponse,setErrorResponse} = require('../utility/common');
module.exports = new SocketServices;

function SocketServices() {   
}
const maxPlayersInRoom = config.game.maxPlayersInRoom;

SocketServices.prototype.addUser = async function(socket,data){   
    console.log("connected user ", data.userId);  
    var userId = data.userId?data.userId:"";  
    await addUserInConnectedUser(socket,userId);
}

SocketServices.prototype.createOrJoin = function(socket,data,io){
    // console.log("create Or Join ", data);
    roomServices.createOrJoin(socket,data,io);
}

SocketServices.prototype.gameStarted = function(data){
    if(data.room){
        data.room.userList.forEach(function(value){
            console.log(value);
        });
    }
}

SocketServices.prototype.removeUser = async function(socket){  
    console.log('Remove User');  
    await this.leaveRoom(socket,null);
    if(gameData.connectedUser[socket.userId]){
        delete gameData.connectedUser[socket.userId];   
        changeStatus(socket,config.userStatus.OFFLINE)             
    }
 }
 
 SocketServices.prototype.leaveRoom = async function(socket,data){   
    roomServices.leaveRoom(socket,data);
    changeStatus(socket.userId,config.userStatus.ONLINE);
 }

 SocketServices.prototype.createFriendsRoom = async function(socket,data){
    friendRequestServices.createRoom(socket,data);
 }

 SocketServices.prototype.sendRequest = async function(socket,data){
    friendRequestServices.sendRequest(socket,data);
 }

 SocketServices.prototype.manageRequest = async function(socket,data,io){
    friendRequestServices.manageRequest(socket,data,io);
 }

 SocketServices.prototype.message = function (socket,data) {	   
    if(data){
        if(data.room)
            socket.to(data.room.roomName).emit(data.methodName, data);
        else
            socket.emit(data.methodName, data);
    }
}

SocketServices.prototype.messageToAll = function (data,io) {		           
    if(data){
        if(data.room)
            io.in(data.room.roomName).emit(data.methodName, data);  
    }
        
}
function addUserInConnectedUser(socket,userId){
    socket.userId = userId;
    if(!gameData.connectedUser[userId] ){
        gameData.connectedUser[userId] = new Array();
        gameData.connectedUser[userId]["socketId"] = socket.id;   
        gameData.connectedUser[userId]["isInRoom"] = false;
        socket.emit("onAddUser",setSuccessResponse("Player is added"));   
        changeStatus(socket,config.userStatus.ONLINE);
    }
    else{
        socket.emit("errorEvent",setErrorResponse("Player is already added"));
    }
    
}


