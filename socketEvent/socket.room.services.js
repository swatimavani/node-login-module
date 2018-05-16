const _ = require('lodash');
var {   gameData,
        generateRoomName,
        setRoomInfo,
        joinUserInRoom,
        shiftToFullRoom,
        changeStatus
    } = require('./gameData/socket.roomData');
const { setSuccessResponse,setErrorResponse,setUser,getUser,deleteUser} = require('../utility/common');
const constant = require('../config/constant.conf');
module.exports = new socketRoomServices;

function socketRoomServices(){

}

socketRoomServices.prototype.createOrJoin = async function(socket,data,io){
    console.log('Create or Join: user id - ' + socket.userId);

    let userData = await getUser(socket.userId);
    
    if(userData && userData.isInRoom === false){
        console.log("Create",userData); 
        if(gameData.existingRooms.length == 0){
            await CreateRoom(socket,data,userData);
        }else{
            console.log("Join",userData);
            JoinRoom(socket,data,io,userData);
        }
    }
    else{
        socket.emit('onFailRoomCreate',setErrorResponse('Fail to create room.'));
    }    
}
socketRoomServices.prototype.leaveRoom = async function(socket){
    let userData = await getUser(socket.userId);
    if(userData && userData.isInRoom){
        var rooms = Object.assign({}, gameData.fullRooms, gameData.existingRooms,gameData.friendRooms);
       
        var room = await _.find(rooms, function(o) {
            return _.find(o.userList, {userId : socket.userId});
        });
        
        if(room){
            if(room.roomStatus == constant.roomStatus.EXISTING_ROOM){
                removePlayerFromRoom(socket,gameData.existingRooms,room.roomName,userData);               
            }
            else if(room.roomStatus == constant.roomStatus.FULL_ROOM){
                removePlayerFromRoom(socket,gameData.fullRooms,room.roomName,userData);               
            }
            else{
                removePlayerFromRoom(socket,gameData.friendRooms,room.roomName,userData);
            } 
            return;
        }
        socket.emit('onLeaveRoom',setErrorResponse('Room does not exist.'));
        return;
    }
    socket.emit('onLeaveRoom',setErrorResponse('user not connected.'));
}

function CreateRoom(socket,data,userData){   
    console.log("Create room",data);  

    var newRoom =  generateRoomName();
    
    data.room.roomName = newRoom;
    data.room.roomStatus = constant.roomStatus.EXISTING_ROOM;
    data.user.userId = socket.userId;
    
    var roomInfo = setRoomInfo(data);

    gameData.existingRooms.push(roomInfo);
    

    
    changeStatus(socket,config.userStatus.PLAYING,true);

    socket.join(data.room.roomName);

    socket.emit("onCreateRoom",setSuccessResponse("Room created successfully.",{room:roomInfo}));      
}
function JoinRoom(socket,data,io,userData){
    console.log("Join room : ",data ); 
    var existingRoomIndex = _.findIndex(gameData.existingRooms, {roomSize : data.room.roomSize});
    if(existingRoomIndex >= 0){
        
        data.user.userId = socket.userId;
        roomName = gameData.existingRooms[existingRoomIndex].roomName;
        joinUserInRoom(gameData.existingRooms,existingRoomIndex,data);
        socket.join(roomName);
    
        changeStatus(socket,config.userStatus.PLAYING,true);

        socket.emit("onJoinRoom",setSuccessResponse('Room joined successfully.',{room:gameData.existingRooms[existingRoomIndex]})); 
        socket.to(roomName).emit("onOpponentJoinRoom",setSuccessResponse('Room joined successfully.',{user:data.user})); 
        
        var isRoomFull = shiftToFullRoom(gameData.existingRooms,existingRoomIndex);
        if(isRoomFull){  
            io.in(roomName).emit("onGameStart",setSuccessResponse('Game Started.'));      
        }
    }else{
        CreateRoom(socket,data);
    }
}

function removePlayerFromRoom(socket,rooms,roomName,user){
    console.log("removePlayerFromRoom : ",roomName);
    socket.leave(roomName);
    var removedUser = removeUserFromRoom(roomName,socket.userId);
    var roomIndex = _.findIndex(rooms,{roomName:roomName});
    rooms[roomIndex].noOfUsers--;
    
    //reset user data in redis 
    user.isInRoom = false;
    setUser(user);
    //
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