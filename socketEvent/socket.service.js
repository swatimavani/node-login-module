var userController = require('../controller/userController');
var roomServices = require('./socket.room.services');
var friendRequestServices = require('./socket.friendsRequest.service');
var {gameData} = require('./gameData/socket.gameData');
const {setSuccessResponse,setErrorResponse} = require('../utility/common');
module.exports = new SocketServices;

function SocketServices() {   
}
const maxPlayersInRoom = config.game.maxPlayersInRoom;

SocketServices.prototype.addUser = async function(socket,data){   
    console.log("connected user ", socket.id);  
    var userId = data.userId?data.userId:"";  
    await addUserInConnectedUser(socket,userId);
    await manageUserStatus(userId,config.userStatus[1]);
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
    socket.emit("leaveRoom");
    // await this.leaveRoom(socket);
    if(gameData.connectedUser[socket.userId]){
        delete gameData.connectedUser[socket.userId];   
        manageUserStatus(socket.userId,config.userStatus[0])             
    }
 }
 
 SocketServices.prototype.leaveRoom = async function(socket){   
    var leave = roomServices.leaveRoom(socket);
    if(leave){
        userController.manageUserStatus(socket.userId,config.userStatus[1]);
    }
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

 SocketServices.prototype.changeStatus = async function(socket,data){
    socket.broadcast.emit('onChangeStatus',data);
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
    }
    else{
        socket.emit("errorEvent",setErrorResponse("Player is already added"));
    }
    
}
async function manageUserStatus(userId,status){   
    await userController.manageUserStatus(userId,status); 
    if(gameData.connectedUser[userId]){
        gameData.connectedUser[userId]["status"] = status; 
        socket.emit('changeStatus',{user:{userId:userId,status:status}});
    }
    else
        socket.emit("errorEvent",setErrorResponse("Somthing went wrong"));
        
}

