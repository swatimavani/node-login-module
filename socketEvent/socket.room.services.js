const _ = require('lodash');
var {   gameData,
        generateRoomName,
        setRoomInfo,
        joinUserInRoom,
        shiftToFullRoom,
        changeStatus
    } = require('./gameData/socket.roomData');
const { setSuccessResponse,setErrorResponse, log} = require('../utility/common');
const {messages} = require('./../utility/messages'); 
const constant = require('../config/constant.conf');
module.exports = new socketRoomServices;


function socketRoomServices(){}

socketRoomServices.prototype.createOrJoin = async function(socket,data,io){
    log('Create or Join: ' + JSON.stringify(data));
    log('Create or Join: ' + socket.userId);
    let userData = {};

    if(gameData.connectedUser[socket.userId] && gameData.connectedUser[socket.userId].isInRoom === false){

        if(Object.keys(gameData.existingRooms).length == 0){
            await CreateRoom(socket,data);
        }else{
            JoinRoom(socket,data,io,userData);
        }
    }
    else{
        socket.emit('onFailRoomCreate',setErrorResponse(messages.roomCreateFail));
    }     
}
socketRoomServices.prototype.leaveRoom = async function(socket){
    log('Leave Room: ' + socket.userId);
    if(gameData.connectedUser[socket.userId] && gameData.connectedUser[socket.userId].isInRoom){

       let rooms = Object.assign({}, gameData.fullRooms, gameData.existingRooms,gameData.friendRooms);
       
       let roomName = _.findKey(rooms, function(roomElement){
            return roomElement.userList.find(function(e) {
                return e.userId == socket.userId; 
            });
        });
        
        if(roomName){

            if(rooms[roomName].roomStatus === constant.roomStatus.EXISTING_ROOM){
                
                removePlayerFromRoom(socket,gameData.existingRooms,roomName);               
                
            }
            else if(rooms[roomName].roomStatus === constant.roomStatus.FULL_ROOM){
                
                removePlayerFromRoom(socket,gameData.fullRooms,roomName);               
                
            }
            else{
                removePlayerFromRoom(socket,gameData.friendRooms,roomName);
            } 
            return;
        }
        socket.emit('onLeaveRoom',setErrorResponse(messages.roomNotExist));
        return;
    }
    socket.emit('onLeaveRoom',setErrorResponse(messages.userNotConnected));
}

function CreateRoom(socket,data){   
    log('Create Room: ' + JSON.stringify(data));
    let newRoom =  generateRoomName();

    data.room.roomStatus = constant.roomStatus.EXISTING_ROOM;
    data.room.roomName = newRoom;
    data.user = { userId:socket.userId, isHost:true };
    
    let roomInfo = setRoomInfo(data);

    gameData.existingRooms[newRoom] = roomInfo;
    
    changeStatus(socket,config.userStatus.PLAYING,true);

    socket.join(newRoom);

    socket.emit("onCreateRoom",setSuccessResponse(messages.roomCreateSuccessfully,{room:roomInfo}));
    
}
function JoinRoom(socket,data,io){
    log('Join Room: ' + JSON.stringify(data));
        
    let isRoomFull;
    let roomName = _.findKey(gameData.existingRooms,function(roomElement) {
        return roomElement.roomSize == data.room.roomSize;
    });

    if(roomName){

        data.user = { userId:socket.userId, isHost:false };
        
        joinUserInRoom(gameData.existingRooms,roomName,data);
        socket.join(roomName);
    
        changeStatus(socket,config.userStatus.PLAYING,true);

        socket.emit("onJoinRoom",setSuccessResponse(messages.roomJoinSuccessfully,{room:gameData.existingRooms[roomName]})); 
        socket.to(roomName).emit("onOpponentJoinRoom",setSuccessResponse(messages.roomJoinSuccessfully,{user:data.user})); 
        
        if(gameData.existingRooms[roomName].noOfUsers == gameData.existingRooms[roomName].roomSize){
            
            isRoomFull = shiftToFullRoom(gameData.existingRooms,roomName);
        }
        if(isRoomFull){  
            io.in(roomName).emit("onGameStart",setSuccessResponse(messages.gameStart));      
        }
    }else{
        CreateRoom(socket,data);
    }
}

function removePlayerFromRoom(socket,rooms,roomName){
    log("Remove Player From Room : "+ roomName ); 

    let roomIndex;

    socket.leave(roomName);
        
    removeUserFromRoom(rooms,roomName,socket.userId);
 
    rooms[roomName].noOfUsers--;
    
    gameData.connectedUser[socket.userId].isInRoom = false;
 
    socket.to(roomName).emit("onOpponentLeaveRoom",setSuccessResponse(messages.roomLeaveSuccessfully,{room:rooms[roomIndex],user:{userId:socket.userId}}));    
    
    socket.emit('onLeaveRoom',setSuccessResponse(messages.roomLeaveSuccessfully));     
 
    if(rooms[roomName].noOfUsers == 0){       
        delete rooms[roomName];         
    }else{
        rooms[roomName].userList[0].isHost = true;
    }
}

function removeUserFromRoom(room,roomName,userId){    
    return _.remove(room[roomName].userList,function(user){
        if(user.userId == userId)
            return true;
        return false;
    });  
         
}