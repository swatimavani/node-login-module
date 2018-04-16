const _ = require('lodash');
var {gameData,generateRoomName,joinUserInRoom} = require('./gameData/socket.gameData');
const { setSuccessResponse,
        setErrorResponse,
        setPlayerData,
        setRoomInfo,
        joinUserInRoom
    } = require('../utility/common');
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
        
     
    }
    else{
        socket.emit('onFailRoomCreate',setErrorResponse('Fail to create room.'));
    }    
}
socketRoomServices.prototype.leaveRoom = async function(socket,gameData){
    if(gameData.connectedUser[socket.userId] && gameData.connectedUser[socket.userId]["isInRoom"]){
        var rooms = await _.union(gameData.fullRooms,gameData.existingRooms,gameData.friendRooms); 
        console.log("rooms" , JSON.stringify(rooms));
          
        var room = _.find(rooms, function(o) {
            return _.find(o.userList, {userId : socket.userId});
        });

        console.log("room" , JSON.stringify(room));
        
        if(room){
            if(room.roomStatus == constant.roomStatus.EXISTING_ROOM){
                removePlayerFromRoom(socket,gameData.existingRooms);
                return true;
            }
            
            else if(room.roomStatus == constant.roomStatus.FULL_ROOM){
                removePlayerFromRoom(socket,gameData.fullRooms);
                return true;
            }
            
            else{
                removePlayerFromRoom(socket,gameData.friendRooms);
                return true;
            } 
        }
        socket.emit('onLeaveRoom',setErrorResponse('Room does not exist.'));
        return;
    }
    socket.emit('onLeaveRoom',setErrorResponse('user not connected.'));
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
    socket.join(data.roomName);
    console.log("onCreateRoom",setSuccessResponse("Room created successfully.",roomInfo));
    
    socket.emit("onCreateRoom",setSuccessResponse("Room created successfully.",roomInfo));      
}

function JoinRoom(socket,data,io){
    console.log("Join room"); 

    for(var i = 0; i < gameData.existingRooms.length; i++){
        if(gameData.existingRooms[i].roomSize == data.roomSize){
            data.userId = socket.userId;
            joinUserInRoom(gameData.existingRooms,i,data);
            gameData.connectedUser[socket.userId]["isInRoom"] = true;

            socket.join(gameData.existingRooms[i].roomName);
            console.log("onJoinRoom",gameData.existingRooms[i]);
            
            io.in(gameData.existingRooms[i].roomName).emit("onJoinRoom",setSuccessResponse('Room joined successfully.',setPlayerData(socket.userId,gameData.existingRooms[i].roomName,data))); 
            shiftFromExistingToFullRoom(i);
            return;  
        }
    }
    CreateRoom(socket,data);
    socket.emit('onFailJoinRoom',setErrorResponse('Room does not exist.'));
    
    
}
function shiftFromExistingToFullRoom(index){
    if(gameData.existingRooms[index].noOfUsers == gameData.existingRooms[index].roomSize){
        var firstRoom =_.pullAt(gameData.existingRooms,[index]);
        firstRoom.roomStatus = constant.roomStatus.FULL_ROOM;
        gameData.fullRooms.push(firstRoom);
    }
    else{
        return;
    }
}
function removePlayerFromRoom(socket,rooms){
    var roomIndex = _.findIndex(rooms, function(room) {
        var usersInRoom = _.find(room.userList, {userId : socket.userId});
        if(usersInRoom){
            return room;
        }
    });
   
    socket.leave(rooms[roomIndex].roomName);
    var removedUser = removeUserFromRoom(rooms[roomIndex],socket.userId);
        
    rooms[roomIndex].noOfUsers--;
    gameData.connectedUser[socket.userId]["isInRoom"] = false;
    gameData.connectedUser[socket.userId]["status"] = config.userStatus[1];  
    socket.emit('onLeaveRoom',setSuccessResponse('Leave room successfully.', {room :rooms[roomIndex].roomName, userId : socket.userId}));     
    socket.to(rooms[roomIndex].roomName).emit("onOpponentLeaveRoom",setPlayerData(socket.userId,rooms[roomIndex]));    
    if(rooms[roomIndex].noOfUsers == 0){
        _.pullAt(rooms,[roomIndex]);           
    }   
}

function removeUserFromRoom(room,userId){
    return _.remove(room.userList,function(user){
        if(user.userId == userId)
            return true;
        return false;
    });       
}