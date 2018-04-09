const uuidv1 = require('uuid/v1');
const _ = require('lodash');
module.exports = new SocketServices;

function SocketServices() {   
}

const maxPlayersInRoom = config.game.maxPlayersInRoom;
const maxRooms = config.game.maxRooms;
const allowSwitchingRoom = config.game.allowSwitchingRoom;       

var connectedUser = [];
var existingRooms = [];
var fullRooms = [];
var player = {};
var playerRoom = {};

SocketServices.prototype.addUser = function(data){   
    var userId = data.userId?data.userId:"";   
    addUserInConnectedUser(userId);
    console.log(" add connectedUser",connectedUser);
}

SocketServices.prototype.createOrJoin = function(data){
    // console.log("create Or Join ", data);

    if(!connectedUser[socket.userId]["isInRoom"]){
        if(existingRooms.length == 0){
            CreateRoom(socket.userId);
       
        }else{
            JoinRoom(socket.userId);

        }
        socket.join(existingRooms[0].roomName);
        shiftFromExistingToFullRoom();
    }
    else{
        console.log(socket.userId + " is already in room");
        
    }    
}

SocketServices.prototype.removeUser = function(){
   socket.emit("leaveRoom");
   delete connectedUser[socket.userId];
   console.log(connectedUser);
}

SocketServices.prototype.leaveRoom = function(){   
    if(connectedUser[socket.userId]["isInRoom"]){
        var rooms = _.unionBy(fullRooms,existingRooms);    
        rooms.forEach(function(room){
            var userIndex = room.userList.indexOf(socket.userId);
            if(userIndex >= 0){               
                socket.leave(room.roomName);
                room.userList.splice(userIndex,1);
                room.noOfUsers--;
                connectedUser[socket.userId]["isInRoom"] = false;               
            }
        });
    }
}


function addUserInConnectedUser(userId){
    socket.userId = userId;
    if(!connectedUser[userId] ){
        connectedUser[userId] = new Array();
        connectedUser[userId]["socketId"] = socket.id;   
        connectedUser[userId]["isInRoom"] = false;    
    }
    
}

function removeUserFromConnectedUser(userId){
    delete connectedUser[userId];       
}

function CreateRoom(userId){   
    var newRoom = "room" + uuidv1();

    if(_.find(existingRooms,{'roomName' : newRoom}) || _.find(fullRooms,{'roomName' : newRoom})){
        CreateRoom(userId);
    }
    else{
        var roomInfo = {
            roomName : newRoom,
            noOfUsers : 1,
            userList : [userId]
        }
        existingRooms.push(roomInfo);
        connectedUser[userId]["isInRoom"] = true;
    }
}

function JoinRoom(userId){
    console.log("max player " + existingRooms[0].noOfUsers); 
    existingRooms[0].noOfUsers++;
    existingRooms[0].userList.push(userId);
    connectedUser[userId]["isInRoom"] = true;
    
    socket.to(existingRooms[0].roomName).emit(existingRooms[0]);
    socket.broadcast.to(existingRooms[0].roomName).emit(existingRooms[0]);
}

function shiftFromExistingToFullRoom(){
    if(existingRooms[0].noOfUsers == maxPlayersInRoom){
        var firstRoom = existingRooms.shift();
        console.log("leangth  " + existingRooms.length);
        
        console.log("first room " + firstRoom);
        fullRooms.push(firstRoom);
    }
    else{
        return;
    }
}

