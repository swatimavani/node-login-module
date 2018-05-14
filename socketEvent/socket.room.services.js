const _ = require('lodash');
var {   gameData,
        generateRoomName,
        setRoomInfo,
        joinUserInRoom,
        shiftToFullRoom,
        changeStatus
    } = require('./gameData/socket.roomData');
const { setSuccessResponse,setErrorResponse} = require('../utility/common');
const constant = require('../config/constant.conf');
module.exports = new socketRoomServices;

function socketRoomServices(){

}

socketRoomServices.prototype.createOrJoin = async function(socket,data,io){
    console.log('Create or Join: user id - ' + socket.userId);
    if(gameData.connectedUser[socket.userId] && !gameData.connectedUser[socket.userId]["isInRoom"]){
        if(Object.keys(gameData.existingRooms).length == 0){
            await CreateRoom(socket,data);
        }else{
            JoinRoom(socket,data,io);
        }
    }
    else{
        socket.emit('onFailRoomCreate',setErrorResponse('Fail to create room.'));
    }    
}
socketRoomServices.prototype.leaveRoom = async function(socket,data){
    console.log('leave room',data);
    if(gameData.connectedUser[socket.userId] && gameData.connectedUser[socket.userId]["isInRoom"]){
        var rooms = Object.assign({}, gameData.fullRooms, gameData.existingRooms,gameData.friendRooms);
       
        var room = await _.find(rooms, function(o) {
            return _.find(o.userList, {userId : socket.userId});
        });
        
        if(room){
            if(room.roomStatus == constant.roomStatus.EXISTING_ROOM){
                removePlayerFromRoom(socket,gameData.existingRooms,room.roomName);               
            }
            else if(room.roomStatus == constant.roomStatus.FULL_ROOM){
                removePlayerFromRoom(socket,gameData.fullRooms,room.roomName);               
            }
            else{
                removePlayerFromRoom(socket,gameData.friendRooms,room.roomName);
            } 
            return;
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
    
    gameData.connectedUser[socket.userId]["isInRoom"] = true;
    
    changeStatus(socket,config.userStatus.PLAYING);

    socket.join(data.room.roomName);

    socket.emit("onCreateRoom",setSuccessResponse("Room created successfully.",{room:roomInfo}));      
}
function JoinRoom(socket,data,io){
    console.log("Join room : ",data ); 
    var existingRoomIndex = _.findIndex(gameData.existingRooms, {roomSize : data.room.roomSize});
    if(existingRoomIndex >= 0){
        data.user.userId = socket.userId;
        roomName = existingRoom[existingRoomIndex].roomName;
        
        joinUserInRoom(gameData.existingRooms,existingRoomIndex,data);
        socket.join(roomName);
        gameData.connectedUser[socket.userId]["isInRoom"] = true;
        changeStatus(socket,config.userStatus.PLAYING);

        socket.emit("onJoinRoom",setSuccessResponse('Room joined successfully.',{room:existingRoom[existingRoomIndex]})); 
        socket.to(roomName).emit("onOpponentJoinRoom",setSuccessResponse('Room joined successfully.',{user:data.user})); 
        
        var isRoomFull = shiftToFullRoom(gameData.existingRooms,existingRoomIndex);
        if(isRoomFull){  
            io.in(roomName).emit("onGameStart",setSuccessResponse('Game Started.'));      
        }
    }else{
        CreateRoom(socket,data);
    }
}

function removePlayerFromRoom(socket,rooms,roomName){
    console.log("removePlayerFromRoom : ",roomName);
    socket.leave(roomName);
    var removedUser = removeUserFromRoom(roomName,socket.userId);
    var roomIndex = _.findIndex(rooms,{roomName:roomName});
    rooms[roomIndex].noOfUsers--;
    gameData.connectedUser[socket.userId]["isInRoom"] = false;
    
    socket.emit('onLeaveRoom',setSuccessResponse('Leave room successfully.'));     
    
    var responseData = setSuccessResponse('Leave room successfully.',{room:rooms[roomIndex],user:{userId:socket.userId}});
    socket.to(roomName).emit("onOpponentLeaveRoom",responseData);    
    
    if(rooms[roomIndex].noOfUsers == 0){
        _.unset(rooms,roomIndex);           
    }   
}

function removeUserFromRoom(room,userId){
    return _.remove(room.userList,function(user){
        if(user.userId == userId)
            return true;
        return false;
    });       
}