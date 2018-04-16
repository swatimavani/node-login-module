const _ = require('lodash');
var {gameData,generateRoomName} = require('./gameData/socket.gameData');
const {setSuccessResponse,setErrorResponse,setPlayerData,setRoomInfo} = require('../utility/common');
const constant = require('../config/constant.conf');
module.exports = new socketRoomServices;

function socketRoomServices(){

}

socketRoomServices.prototype.createOrJoin = async function(socket,data,io){
    console.log('Create or Join: user id -' + socket.userId);
    if(gameData.connectedUser[socket.userId] && !gameData.connectedUser[socket.userId]["isInRoom"]){
        if(gameData.existingRooms.length == 0){
            await CreateRoom(socket,data);
        }else{
            JoinRoom(socket,data,io);
        }
        socket.join(gameData.existingRooms[0].roomName);
        shiftFromExistingToFullRoom();
    }
    else{
        socket.emit('OnFailRoomCreate',setErrorResponse('Fail to create room.'));
    }    
}
socketRoomServices.prototype.leaveRoom = async function(socket,gameData){
    if(connectedUser[socket.userId] && connectedUser[socket.userId]["isInRoom"]){ 
        if(room){
            if(room.roomStatus == constant.roomStatus.EXISTING_ROOM){
                removePlayerFromRoom(gameData.existingRooms,socket.userId);
                return true;
            }
            
            else if(room.roomStatus == constant.roomStatus.FULL_ROOM){
                removePlayerFromRoom(gameData.fullRooms,socket.userId);
                return true;
            }
            
            else{
                removePlayerFromRoom(gameData.friendRooms,socket.userId);
                return true;
            } 
        }
        socket.emit('OnLeaveRoom',setErrorResponse('Room does not exist.'));
        return;
    }
    socket.emit('OnLeaveRoom',setErrorResponse('user not connected.'));
}

function CreateRoom(socket,data){   
    console.log("Create room");  
    var newRoom =  generateRoomName();
    data.roomName = newRoom;
    data.roomStatus = constant.roomStatus.EXISTING_ROOM;
    data.userId = socket.userId;
    var roomInfo = setRoomInfo(data);
    gameData.existingRooms.push(roomInfo);
    gameData.connectedUser[socket.userId]["isInRoom"] = true;
    socket.emit("onCreateRoom",setSuccessResponse("Room created successfully.",roomInfo));      
}

function JoinRoom(socket,data,io){
    console.log("Join room"); 

    for(var i = 0; i < gameData.existingRooms.length; i++){
        if(gameData.existingRooms[i].roomSize == data.roomSize){
            var user = {};
            user.userId = socket.userId;
            user.userName = data.userName;
            user.profileLink = data.profileLink;
            gameData.existingRooms[0].noOfUsers++;
            gameData.existingRooms[0].userList.push(user);
            gameData.connectedUser[userId]["isInRoom"] = true;
            io.in(gameData.existingRooms[0].roomName).emit("onJoinRoom",setSuccessResponse('Room joined successfully.',setPlayerData(socket.userId,gameData.existingRooms[i].roomName,data))); 
            return;  
        }
    }
    CreateRoom(socket,data);
    socket.emit('OnFailJoinRoom',setErrorResponse('Room does not exist.'));
    
    
}
function shiftFromExistingToFullRoom(){
    if(gameData.existingRooms[0].noOfUsers == gameData.existingRooms[0].roomSize){
        var firstRoom = gameData.existingRooms.shift();
        firstRoom.roomStatus = constant.roomStatus.FULL_ROOM;
        gameData.fullRooms.push(firstRoom);
    }
    else{
        return;
    }
}
function removePlayerFromRoom(rooms,uId){
    var roomIndex = _.findIndex(rooms, function(roomObj) {
        var usersInRoom = _.find(roomObj.userList, {userId : uId});
        if(usersInRoom){
            return roomObj;
        }
    });
   
    socket.leave(room.roomName);
    _.remove(rooms[roomIndex].userList,socket.userId);           
    rooms[roomIndex].noOfUsers--;
    connectedUser[socket.userId]["isInRoom"] = false;
    connectedUser[socket.userId]["status"] = config.userStatus[1];  
    socket.emit('OnLeaveRoom',setSuccessResponse('Leave room successfully.'));     
    socket.to(rooms[roomIndex].roomName).emit("onOpponentLeaveRoom",setPlayerData(socket.userId,room.roomName));
}