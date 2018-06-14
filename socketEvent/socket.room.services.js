const _ = require('lodash');
var {   gameData,
        generateRoomName,
        setRoomInfo,
        joinUserInRoom,
        shiftToFullRoom,
        changeStatus
    } = require('./gameData/socket.roomData');
const { setSuccessResponse,setErrorResponse,setUser,getUser,deleteUser} = require('../utility/common');
const {messages} = require('./../utility/messages'); 
const constant = require('../config/constant.conf');
module.exports = new socketRoomServices;

let newRoom,roomInfo,roomIndex,removedUser,isRoomFull;

function socketRoomServices(){
    this.rooms = {};
    this.room = {};
   
    this.userData= null;
    
}

socketRoomServices.prototype.createOrJoin = async function(socket,data,io){
    console.log('Create or Join: user id - ' + socket.userId);
    let userData = {};
    userData = await getUser(socket.userId,gameData.connectedUser);
    
    if(userData && userData.isInRoom === false){
        console.log("Create",userData); 
        if(gameData.existingRooms.length == 0){
            await CreateRoom(socket,data, userData);
        }else{
            console.log("Join",userData);
            JoinRoom(socket,data,io,userData);
        }
    }
    else{
        socket.emit('onFailRoomCreate',setErrorResponse(messages.roomCreateFail));
    }    
}
socketRoomServices.prototype.leaveRoom = async function(socket){
    let userData;
    let room;
    let rooms;
    userData = await getUser(socket.userId,gameData.connectedUser);
    if(userData && userData.isInRoom){
       rooms = Object.assign({}, gameData.fullRooms, gameData.existingRooms,gameData.friendRooms);
       
        room = await _.find(rooms, function(o) {
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
        socket.emit('onLeaveRoom',setErrorResponse(messages.roomNotExist));
        return;
    }
    socket.emit('onLeaveRoom',setErrorResponse(messages.userNotConnected));
}

function CreateRoom(socket,data,userData){   
    console.log("Create room",data);  
    let newRoom;
    let roomInfo;
    newRoom =  generateRoomName();
    
    data.room.roomName = newRoom;
    data.room.roomStatus = constant.roomStatus.EXISTING_ROOM;
    data.user.userId = socket.userId;
    
    roomInfo = setRoomInfo(data);

    gameData.existingRooms.push(roomInfo);
    

    
    changeStatus(socket,config.userStatus.PLAYING,true);

    socket.join(data.room.roomName);

    socket.emit("onCreateRoom",setSuccessResponse(messages.roomCreateSuccessfully,{room:roomInfo}));      
}
function JoinRoom(socket,data,io,userData){
    console.log("Join room : ",data ); 
    let roomIndex;
    let roomName;
    let isRoomFull;
    roomIndex = _.findIndex(gameData.existingRooms, {roomSize : data.room.roomSize});
    if(roomIndex >= 0){
        
        data.user.userId = socket.userId;
        roomName = gameData.existingRooms[roomIndex].roomName;
        joinUserInRoom(gameData.existingRooms,roomIndex,data);
        socket.join(roomName);
    
        changeStatus(socket,config.userStatus.PLAYING,true);

        socket.emit("onJoinRoom",setSuccessResponse(messages.roomJoinSuccessfully,{room:gameData.existingRooms[roomIndex]})); 
        socket.to(roomName).emit("onOpponentJoinRoom",setSuccessResponse(messages.roomJoinSuccessfully,{user:data.user})); 
        
        isRoomFull = shiftToFullRoom(gameData.existingRooms,roomIndex);
        if(isRoomFull){  
            io.in(roomName).emit("onGameStart",setSuccessResponse(messages.gameStart));      
        }
    }else{
        CreateRoom(socket,data);
    }
}

function removePlayerFromRoom(socket,rooms,roomName,user){
    let roomIndex;
    let removedUser;
    console.log("removePlayerFromRoom : ",roomName);
    socket.leave(roomName);
    roomIndex = _.findIndex(rooms,{roomName:roomName});
    removedUser = removeUserFromRoom(rooms,roomIndex,socket.userId);
    rooms[roomIndex].noOfUsers--;
    
    //reset user data in redis 
    user.isInRoom = false;
    setUser(user,gameData.connectedUser);
    //
    socket.emit('onLeaveRoom',setSuccessResponse(messages.roomLeaveSuccessfully));     
    

    socket.to(roomName).emit("onOpponentLeaveRoom",setSuccessResponse(messages.roomLeaveSuccessfully,{room:rooms[roomIndex],user:{userId:socket.userId}}));    
    
    if(rooms[roomIndex].noOfUsers == 0){
        _.unset(rooms,roomIndex);           
    }   
}

function removeUserFromRoom(room,roomIndex,userId){
    return _.remove(room[roomIndex].userList,function(user){
        if(user.userId == userId)
            return true;
        return false;
    });       
}