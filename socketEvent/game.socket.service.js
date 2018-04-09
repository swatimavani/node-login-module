const uuidv1 = require('uuid/v1');
const _ = require('lodash');
module.exports = new SocketServices;

function SocketServices() {   
}

const maxPlayersInRoom = config.game.maxPlayersInRoom;
const maxRooms = config.game.maxRooms;
const allowSwitchingRoom = config.game.allowSwitchingRoom;       

var connectedUser = [];
var exsistingRooms = [];
var fullRooms = [];
var player = {};
var playerRoom = {};

SocketServices.prototype.addUser = function(data){
    console.log("add user " + data.userId );
    var userId = data.userId?data.userId:"";
    
    addUserInConnectedUser(userId);
    console.log(connectedUser);
   
    
}

SocketServices.prototype.createOrJoin = function(data){
    console.log("create Or Join " + data);

    if(!connectedUser[data.userId]["isInRoom"]){

     

        if(exsistingRooms.length == 0){
            
            CreateRoom(data.userId);
       
        }else{
            JoinRoom(data.userId);

        }
        socket.join(exsistingRooms[0].roomName, () => {
            console.log(JSON.stringify( exsistingRooms));
            
        });
        CkeckIfRoomIsFull();
    }
    else{
        console.log(data.userId + " is already in room");
        
    }
    // console.log("connecte " + connectedUser[data.userId]["isInRoom"]);
    
}

function addUserInConnectedUser(userId){
    if(!connectedUser[userId] ){
        connectedUser[userId] = new Array();
    }
    else{
        return;
    }
    connectedUser[userId]["socketId"] = socket.id;   
    connectedUser[userId]["isInRoom"] = false;
   
    
    
}

function CreateRoom(userId){
    var newRoom = "room" + uuidv1();

    if(_.find(exsistingRooms,{'roomName' : newRoom}) || _.find(fullRooms,{'roomName' : newRoom})){
        CreateRoom(userId);
    }
    else{
        var roomInfo = {
            roomName : newRoom,
            noOfUsers : 1,
            userList : [userId]
        }
        exsistingRooms.push(roomInfo);
        connectedUser[userId]["isInRoom"] = true;
       

    }
}

function JoinRoom(userId){
    console.log("max player " + exsistingRooms[0].noOfUsers);
    
    
    exsistingRooms[0].noOfUsers++;
    exsistingRooms[0].userList.push(userId);
    connectedUser[userId]["isInRoom"] = true;
    
    socket.to(exsistingRooms[0].roomName).emit(exsistingRooms[0]);
    socket.broadcast.to(exsistingRooms[0].roomName).emit(exsistingRooms[0]);
    
 

}

function CkeckIfRoomIsFull(){
    if(exsistingRooms[0].noOfUsers == maxPlayersInRoom){
        var firstRoom = exsistingRooms.shift();
        console.log("leangth  " + exsistingRooms.length);
        
        console.log("first room " + firstRoom);
        fullRooms.push(firstRoom);
    }
    else{
        return;
    }
}

