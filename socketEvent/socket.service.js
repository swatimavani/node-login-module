const uuidv1 = require('uuid/v1');
const _ = require('lodash');
var userController = require('../controller/userController');
var roomServices = require('./socket.room.services');
var {gameData} = require('./gameData/socket.gameData');
module.exports = new SocketServices;

function SocketServices() {   
}
const maxPlayersInRoom = config.game.maxPlayersInRoom;

SocketServices.prototype.addUser = async function(socket,data){   
    console.log("addUser ",data);
    var userId = data.userId?data.userId:"";   
   
    
    await addUserInConnectedUser(socket,userId);
    await manageUserStatus(userId,'online');
    console.log("connected user ",gameData.connectedUser);  
}

SocketServices.prototype.createOrJoin = function(socket,data,io){
    // console.log("create Or Join ", data);
    roomServices.createOrJoin(socket,gameData,io);
}

SocketServices.prototype.removeUser = function(socket){
    socket.emit("leaveRoom");
    delete connectedUser[socket.userId];  
    manageUserStatus(userId,'offline');   
 }
 
 SocketServices.prototype.leaveRoom = async function(socket){   

    var leave = roomServices.leaveRoom(socket,gameData);
    if(leave){
        userController.manageUserStatus(socket.userId,'online');
    }
 }


function addUserInConnectedUser(socket,userId){
    socket.userId = userId;
    if(!gameData.connectedUser[userId] ){
        gameData.connectedUser[userId] = new Array();
        gameData.connectedUser[userId]["socketId"] = socket.id;   
        gameData.connectedUser[userId]["isInRoom"] = false;
    }
    
}
async function manageUserStatus(userId,status){
    console.log("socket " + status);
    console.log("userId " + userId);
    await userController.manageUserStatus(userId,status); 
    if(gameData.connectedUser[userId])
        gameData.connectedUser[userId]["status"] = "Online"; 
}

