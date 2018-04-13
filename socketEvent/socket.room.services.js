const _ = require('lodash');
var {gameData,generateRoomName} = require('./gameData/socket.gameData');
const {setSuccessResponse,setErrorResponse} = require('../utility/common');

module.exports = new socketRoomServices;

function socketRoomServices(){

}

socketRoomServices.prototype.createOrJoin = async function(socket,gameData,io){
    console.log('Create or Join: user id -' + socket.userId);
    if(gameData.connectedUser[socket.userId] && !gameData.connectedUser[socket.userId]["isInRoom"]){
        if(gameData.existingRooms.length == 0){
            await CreateRoom(socket,socket.userId);
        }else{
            JoinRoom(socket.userId,io);
        }
        socket.join(gameData.existingRooms[0].roomName);
        shiftFromExistingToFullRoom();
    }
    else{
        socket.emit('OnFailRoomCreate',setErrorResponse('Fail to create room.')) 
    }    
}
socketRoomServices.prototype.leaveRoom = async function(socket,gameData){
    if(connectedUser[socket.userId] && connectedUser[socket.userId]["isInRoom"]){
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
            socket.emit('OnLeaveRoom',setSuccessResponse('Leave room successfully.'));         
            return true;
        }
        socket.emit('OnLeaveRoom',setErrorResponse('Room does not exist.'));
        return;
    }
    socket.emit('OnLeaveRoom',setErrorResponse('user not connected.'));
}

function CreateRoom(socket,userId){   
    console.log("Create room");  
    var newRoom =  generateRoomName();
    var roomInfo = {
        roomName : newRoom,
        noOfUsers : 1,
        userList : [socket.userId]
    }
    gameData.existingRooms.push(roomInfo);
    gameData.connectedUser[socket.userId]["isInRoom"] = true;
    socket.emit("onCreateRoom",setSuccessResponse("Room created successfully.",roomInfo));      
}

function JoinRoom(userId,io){
    console.log("Join room"); 
    if(gameData.existingRooms.length > 0){
        gameData.existingRooms[0].noOfUsers++;
        gameData.existingRooms[0].userList.push(userId);
        gameData.connectedUser[userId]["isInRoom"] = true;
        io.in(gameData.existingRooms[0].roomName).emit("onJoinRoom",setSuccessResponse('Room joined successfully.',gameData.existingRooms[0]));   
    }else{
        socket.emit('OnFailJoinRoom',setErrorResponse('Room does not exist.'));
    }
    
}
function shiftFromExistingToFullRoom(){
    if(gameData.existingRooms[0].noOfUsers == gameData.maxPlayersInRoom){
        var firstRoom = gameData.existingRooms.shift();
        gameData.fullRooms.push(firstRoom);
    }
    else{
        return;
    }
}