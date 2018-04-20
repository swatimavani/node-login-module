const _ = require('lodash');
var {gameData,generateRoomName} = require('./gameData/socket.gameData');
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
socketRoomServices.prototype.leaveRoom = async function(socket){
    console.log('leave room');
    if(gameData.connectedUser[socket.userId] && gameData.connectedUser[socket.userId]["isInRoom"]){
        
        var rooms = gameData.fullRooms.concat(gameData.existingRooms).concat(gameData.friendRooms);
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
    console.log("Create room",data);  
    var newRoom =  generateRoomName();
    data.room.roomName = newRoom;
    data.room.roomStatus = constant.roomStatus.EXISTING_ROOM;
    data.user.userId = socket.userId;
    var roomInfo = setRoomInfo(data);
    gameData.existingRooms.push(roomInfo);

    console.log("existing room : ", gameData.existingRooms);
    
    gameData.connectedUser[socket.userId]["isInRoom"] = true;
    socket.join(data.room.roomName);
    console.log("onCreateRoom",setSuccessResponse("Room created successfully.",{room:roomInfo}));
    
    socket.emit("onCreateRoom",setSuccessResponse("Room created successfully.",{room:roomInfo}));      
}

function JoinRoom(socket,data,io){
    console.log("Join room : ",gameData.existingRooms.length ); 

    var existingRoomIndex = _.findIndex(gameData.existingRooms, {roomSize : data.room.roomSize});
    if(existingRoomIndex >= 0){
        data.user.userId = socket.userId;
        joinUserInRoom(gameData.existingRooms,existingRoomIndex,data);
        gameData.connectedUser[socket.userId]["isInRoom"] = true;
        var existingRoom = gameData.existingRooms[existingRoomIndex];
        socket.join(existingRoom.roomName);
        console.log("onJoinRoom",existingRoom);
        socket.emit("onJoinRoom",setSuccessResponse('Room joined successfully.',{room:existingRoom})); 
        socket.to(existingRoom.roomName).emit("onOpponentJoinRoom",setSuccessResponse('Room joined successfully.',{user:data.user})); 
        var shiftedRoomName = shiftFromExistingToFullRoom(existingRoomIndex);
        if(shiftedRoomName){
            io.in(shiftedRoomName).emit("onGameStart",setSuccessResponse('Game Started.'));      
        }
    }else{
        CreateRoom(socket,data);
    }
}
function shiftFromExistingToFullRoom(index){
    if(gameData.existingRooms[index].noOfUsers == gameData.existingRooms[index].roomSize){
        var firstRoom =_.pullAt(gameData.existingRooms,[index]);
        if(firstRoom.length > 0){
            firstRoom[0].roomStatus = constant.roomStatus.FULL_ROOM;
            gameData.fullRooms.push(firstRoom[0]);       
            return firstRoom[0].roomName;
        }
        return false;
    }
    else{
        return false;
    }
}
function removePlayerFromRoom(socket,rooms){
    var roomIndex = _.findIndex(rooms, function(room) {
        var usersInRoom = _.find(room.userList, {userId : socket.userId});
        if(usersInRoom){
            return room;
        }
    });
   console.log("removePlayerFromRoom : ",roomIndex);
    socket.leave(rooms[roomIndex].roomName);
    var removedUser = removeUserFromRoom(rooms[roomIndex],socket.userId);
        
    rooms[roomIndex].noOfUsers--;
    gameData.connectedUser[socket.userId]["isInRoom"] = false;
    gameData.connectedUser[socket.userId]["status"] = config.userStatus[1];  
    
    socket.emit('onLeaveRoom',setSuccessResponse('Leave room successfully.'));     
    
    var responseData = setSuccessResponse('Leave room successfully.',{room:rooms[roomIndex],user:{userId:socket.userId}});
    socket.to(rooms[roomIndex].roomName).emit("onOpponentLeaveRoom",responseData);    
    
    if(rooms[roomIndex].noOfUsers == 0){
        _.pullAt(rooms,[roomIndex]);    
        console.log('rooms ', rooms);       
    }   
}

function removeUserFromRoom(room,userId){
    return _.remove(room.userList,function(user){
        if(user.userId == userId)
            return true;
        return false;
    });       
}