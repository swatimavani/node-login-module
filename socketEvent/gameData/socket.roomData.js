const nano = require('nanoseconds');
const _ = require('lodash');
const constant = require('../../config/constant.conf');
var {setSuccessResponse} = require('../../utility/common');

let newRoom,rooms,roomInfo,firstRoom;

var gameData = {
    maxPlayersInRoom : config.game.maxPlayersInRoom,
    connectedUser: {},
    existingRooms: {},
    friendRooms: {},
    fullRooms: {}
    
}

var generateRoomName = function(){
    newRoom = (nano(process.hrtime())).toString();

    rooms = Object.assign({}, gameData.fullRooms, gameData.existingRooms,gameData.friendRooms);
    if(rooms[newRoom]){
        generateRoomName();
    }else{
        rooms= null;
        return newRoom;
    }
}

var setRoomInfo = (roomData) => {
    roomInfo = roomData.room;
    roomInfo.noOfUsers = 1;
    roomInfo.userList = [];
    roomInfo.roomSize = roomInfo.roomSize ? roomInfo.roomSize : 2; 
    roomInfo.userList.push(roomData.user);
    return roomInfo;
    
}
var joinUserInRoom = (rooms,roomIndex,data) => {
    rooms[roomIndex].noOfUsers++;
    rooms[roomIndex].userList.push(data.user);
} 

var shiftToFullRoom = function (rooms,index){
    firstRoom = _.pick(rooms, [index]);
    delete rooms[index];

    if (firstRoom) {
        
        firstRoom[index].roomStatus = constant.roomStatus.FULL_ROOM;
        gameData.fullRooms[index] = firstRoom[index];
         
        return true;

    }
    return false;
}


var changeStatus = async (socket,status,isInRoom)=>{ 
    if (socket) {
        try {
            if(gameData.connectedUser[socket.userId]) {
                
                gameData.connectedUser[socket.userId].isInRoom = isInRoom ? isInRoom : false;
                
                gameData.connectedUser[socket.userId].status = status;               

                socket.broadcast.emit('onChangeStatus', setSuccessResponse('Status changed',{user: { userId: socket.userId, status: status }}));
            }
        } catch (e) {
            console.log("change Status", e);
        }
    }   
}

module.exports = {gameData,generateRoomName,setRoomInfo,joinUserInRoom,shiftToFullRoom,changeStatus}