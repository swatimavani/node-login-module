const uuidv1 = require('uuid/v1');
const _ = require('lodash');
const constant = require('../../config/constant.conf');
var userController = require('../../controller/userController');

var {setUser,getUser} = require('../../utility/common');

const {messages} = require('./../../utility/messages');
let newRoom,rooms,roomInfo,firstRoom,userData = {};


var gameData = {
    maxPlayersInRoom : config.game.maxPlayersInRoom,
    connectedUser: {},
    existingRooms: {},
    friendRooms: {},
    fullRooms: {}
    
}

var generateRoomName = function(){
    newRoom = "room" + uuidv1();
    rooms = Object.assign({}, gameData.fullRooms, gameData.existingRooms,gameData.friendRooms);
    if(_.find(rooms,{'roomName' : newRoom})){
        generateRoomName();
    }else{
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
   //only for teenpatti

    // if(rooms[index].noOfUsers == rooms[index].roomSize){

    //mapping
    firstRoom = _.pick(rooms, [index]);
    delete rooms[index];
    //
    // firstRoom =  _.pullAt(rooms,[index]);
    console.log("firstRoom", JSON.stringify(firstRoom));

    console.log("shiftToFullRoom", JSON.stringify(rooms));

    if (firstRoom) {
        //mapping
        firstRoom[index].roomStatus = constant.roomStatus.FULL_ROOM;
        gameData.fullRooms[index] = firstRoom[index];

        //
        // firstRoom[0].roomStatus = constant.roomStatus.FULL_ROOM;
        // gameData.fullRooms.push(firstRoom[0]);           
        return true;

    }
    return false;
    // }
    // else{
    // return false;
    // }
}


var changeStatus = async (socket,status,isInRoom)=>{ 
    if (socket) {
        try {


            userData = gameData.connectedUser[socket.userId];
            //console.log("userData ", userData);
           
            if (gameData.connectedUser[socket.userId]) {
                
                gameData.connectedUser[socket.userId].isInRoom = isInRoom ? isInRoom : false;
                
                gameData.connectedUser[socket.userId].status = status;
                //console.log("before setUser");

               // setUser(userData, gameData.connectedUser);
                //console.log("after setUser");

                userController.manageUserStatus(socket.userId,status); 
                socket.broadcast.emit('onChangeStatus', { user: { userId: socket.userId, status: status } });
            }
        } catch (e) {
            console.log("change Status", e);

        }
    }   
}



module.exports = {gameData,generateRoomName,setRoomInfo,joinUserInRoom,shiftToFullRoom,changeStatus}