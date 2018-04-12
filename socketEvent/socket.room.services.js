const uuidv1 = require('uuid/v1');
const _ = require('lodash');
var {gameData} = require('./gameData/socket.gameData');

module.exports = new socketRoomServices;

function socketRoomServices(){

}

socketRoomServices.prototype.createOrJoin = function(socket,gameData,io){

    console.log('user id ' + socket.userId);
    if(!gameData.connectedUser[socket.userId]["isInRoom"]){
        console.log('existingRooms ' + gameData.existingRooms.length);
        
        if(gameData.existingRooms.length == 0){
            CreateRoom(socket,socket.userId);
       
        }else{
            JoinRoom(socket.userId,io);

        }
        socket.join(gameData.existingRooms[0].roomName);
        shiftFromExistingToFullRoom();
    }
    else{
        console.log(socket.userId + " is already in room");
        
    }    
}
socketRoomServices.prototype.leaveRoom = async function(socket,gameData){
    if(connectedUser[socket.userId]["isInRoom"]){
        var rooms = await _.union(fullRooms,existingRooms,friendRooms);   
        var room = await _.find(rooms,function(o){
            return _.includes(o.userList, socket.userId);
        }); 
        if(room){
            socket.leave(room.roomName);
            _.remove(room.userList,socket.userId);           
            room.noOfUsers--;
            connectedUser[socket.userId]["isInRoom"] = false;
            connectedUser[socket.userId]["status"] = "online";  
            return true;            
        }   
        return false;    
    }
    return false;
}

async function CreateRoom(socket,userId){   
    console.log("Create room");
    // var newRoom = "room" + uuidv1();

    // if(_.find(existingRooms,{'roomName' : newRoom}) || _.find(fullRooms,{'roomName' : newRoom})){
    //     CreateRoom(userId);
    // }
    // else{
        var newRoom =  generateRoomName();
        console.log("room name " , newRoom);
        var roomInfo = {
            roomName : newRoom,
            noOfUsers : 1,
            userList : [socket.userId]
        }
        gameData.existingRooms.push(roomInfo);
        gameData.connectedUser[socket.userId]["isInRoom"] = true;
        console.log('Connected User: ',gameData.connectedUser);
        socket.emit("onCreateRoom",roomInfo);   
    // }
}

function JoinRoom(userId,io){
    console.log("Join room");
  //  console.log("max player " + gameData.existingRooms[0].noOfUsers); 
    gameData.existingRooms[0].noOfUsers++;
    gameData.existingRooms[0].userList.push(userId);
    gameData.connectedUser[userId]["isInRoom"] = true;
    io.in(gameData.existingRooms[0].roomName).emit("onJoinRoom",gameData.existingRooms[0]);   
}
 function generateRoomName(){
    var rooms =  _.union(gameData.fullRooms,gameData.existingRooms,gameData.friendRooms);
    if(_.find(rooms,{'roomName' : newRoom})){
        generateRoomName();
    }else{
        var newRoom = "room" + uuidv1();
        return newRoom;
    }
}

function shiftFromExistingToFullRoom(){
    if(gameData.existingRooms[0].noOfUsers == gameData.maxPlayersInRoom){
        var firstRoom = gameData.existingRooms.shift();
        console.log("leangth  " + gameData.existingRooms.length);
        
        console.log("first room ", firstRoom);
        gameData.fullRooms.push(firstRoom);
    }
    else{
        return;
    }
}