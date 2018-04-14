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
    await manageUserStatus(userId,'online');
}

SocketServices.prototype.createOrJoin = function(socket,io){
    // console.log("create Or Join ", data);
    roomServices.createOrJoin(socket,io);
}

SocketServices.prototype.removeUser = function(socket){
    socket.emit("leaveRoom");
    if(gameData.connectedUser[socket.userId]){
        delete gameData.connectedUser[socket.userId];  
        manageUserStatus(socket.userId,'offline'); 
    }
 }
 
 SocketServices.prototype.leaveRoom = async function(socket){   
    var leave = roomServices.leaveRoom(socket,gameData);
    if(leave){
        userController.manageUserStatus(socket.userId,'online');
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

function addUserInConnectedUser(socket,userId){
    socket.userId = userId;
    if(!gameData.connectedUser[userId] ){
        gameData.connectedUser[userId] = new Array();
        gameData.connectedUser[userId]["socketId"] = socket.id;   
        gameData.connectedUser[userId]["isInRoom"] = false;
    }
    else{
        socket.emit("errorEvent",setErrorResponse("Player is already added"));
    }
    
}
async function manageUserStatus(userId,status){   
    await userController.manageUserStatus(userId,status); 
    if(gameData.connectedUser[userId])
        gameData.connectedUser[userId]["status"] = status; 
    else
        socket.emit("errorEvent",setErrorResponse("Somthing went wrong"));
        
}

