const uuidv1 = require('uuid/v1');
const _ = require('lodash');
var userController = require('../controller/userController');
module.exports = new SocketServices;

function SocketServices() {   
}

const maxPlayersInRoom = config.game.maxPlayersInRoom;

var connectedUser = [];
var existingRooms = [];
var friendRooms = [];
var fullRooms = [];

SocketServices.prototype.addUser = async function(socket,data){   
    console.log("addUser ",data);
    var userId = data.userId?data.userId:"";   
    await addUserInConnectedUser(socket,userId);
    manageUserStatus(userId,'online');
     
}

SocketServices.prototype.createOrJoin = function(socket,data,io){   
    console.log('user id ' + socket.userId);
    if(!connectedUser[socket.userId]["isInRoom"]){
        if(existingRooms.length == 0){
            CreateRoom(socket,socket.userId);  
        }else{
            JoinRoom(socket.userId,io);

        }
        socket.join(existingRooms[0].roomName);
        shiftFromExistingToFullRoom();
    }
    else{
        console.log(socket.userId + " is already in room");
    }    
}

SocketServices.prototype.generateRequest = function(socket,data){
    
    var newRoom = generateRoomName();
    var roomInfo = {
        roomName : newRoom,
        noOfUsers : 1,
        userList : [userId]
    }
    friendRooms.push(roomInfo);
    connectedUser[userId]["isInRoom"] = true;
    console.log('Connected User: ',connectedUser);
    socket.emit("onCreateRoom",roomInfo);  
    socket.emit("onChallengeRequest",roomInfo);

}
SocketServices.prototype.removeUser = function(socket){
    socket.emit("leaveRoom");
    delete connectedUser[socket.userId];  
    manageUserStatus(socket.userId,'offline');   
 }
 
 SocketServices.prototype.leaveRoom = async function(socket){   
     if(connectedUser[socket.userId]["isInRoom"]){
         var rooms = await _.unionBy(fullRooms,existingRooms,friendRooms);   
         var room = await _.find(rooms,function(o){
             return _.includes(o.userList, socket.userId);
         }); 
         if(room){
             socket.leave(room.roomName);
             _.remove(room.userList,socket.userId);           
             room.noOfUsers--;
             connectedUser[socket.userId]["isInRoom"] = false;
             connectedUser[socket.userId]["status"] = "online";  
             userController.manageUserStatus(socket.userId,'online');             
         }       
     }
 }


function addUserInConnectedUser(socket,userId){
    socket.userId = userId;
    if(!connectedUser[userId] ){
        connectedUser[userId] = new Array();
        connectedUser[userId]["socketId"] = socket.id;   
        connectedUser[userId]["isInRoom"] = false;
    }
    
}

async function generateRoomName(){
    var rooms = await _.union(fullRooms,existingRooms,friendRooms);
    if(_.find(rooms,{'roomName' : newRoom})){
        generateRoomName();
    }else{
        var newRoom = "room" + uuidv1();
        return newRoom;
    }
}
async function CreateRoom(socket,userId){   
    console.log("Create room");
    // var newRoom = "room" + uuidv1();

    // if(_.find(existingRooms,{'roomName' : newRoom}) || _.find(fullRooms,{'roomName' : newRoom})){
    //     CreateRoom(userId);
    // }
    // else{
        var newRoom = generateRoomName();
        var roomInfo = {
            roomName : newRoom,
            noOfUsers : 1,
            userList : [userId]
        }
        existingRooms.push(roomInfo);
        connectedUser[userId]["isInRoom"] = true;
        console.log('Connected User: ',connectedUser);
        socket.emit("onCreateRoom",roomInfo);   
    // }
}

function JoinRoom(userId,io){
    console.log("Join room");
    console.log("max player " + existingRooms[0].noOfUsers); 
    existingRooms[0].noOfUsers++;
    existingRooms[0].userList.push(userId);
    connectedUser[userId]["isInRoom"] = true;
    io.in(existingRooms[0].roomName).emit("onJoinRoom",existingRooms[0]);   
}

function sendRequest(friendId){

}

function shiftFromExistingToFullRoom(){
    if(existingRooms[0].noOfUsers == maxPlayersInRoom){
        var firstRoom = existingRooms.shift();
        console.log("leangth  " + existingRooms.length);
        
        console.log("first room ", firstRoom);
        fullRooms.push(firstRoom);
    }
    else{
        return;
    }
}

function manageUserStatus(userId,status){
    userController.manageUserStatus(userId,status); 
    if(connectedUser[userId])
        connectedUser[userId]["status"] = "online"; 
}

