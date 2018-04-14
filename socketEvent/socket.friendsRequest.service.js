const uuidv1 = require('uuid/v1');
const _ = require('lodash');
var {gameData,generateRoomName} = require('./gameData/socket.gameData');
const {setSuccessResponse,setErrorResponse} = require('../utility/common');

module.exports = new socketFriendRequestServices;
function socketFriendRequestServices(){

}

socketFriendRequestServices.prototype.createRoom =  function(socket,data){
    if(gameData.connectedUser[socket.userId] && !gameData.connectedUser[socket.userId]["isInRoom"]){
        var newRoom =  generateRoomName();
        var roomInfo = {
            roomName : newRoom,
            noOfUsers : 1,
            maxPlayer : data.roomSize,
            userList : [socket.userId]
        }
        gameData.friendRooms.push(roomInfo);
        gameData.connectedUser[socket.userId]["isInRoom"] = true;
        console.log(gameData.friendRooms);
        socket.join(roomInfo.roomName);
        socket.emit("onCreateFriendRoom",setSuccessResponse("Room created successfully.",roomInfo));
    }else{
        socket.emit('onFailRoomCreate',setErrorResponse('Fail to create room.'));
    }
}

socketFriendRequestServices.prototype.sendRequest = function(socket,data){
    if(gameData.connectedUser[socket.userId]["isInRoom"]){

        if(gameData.connectedUser[data.friendUserId]["status"] == "online" && !gameData.connectedUser[data.friendUserId]["isInRoom"]){
            var index = getPlayerRoomIndex(data.roomName);
            socket.to(gameData.connectedUser[data.friendUserId]["socketId"]).emit("onRequestSend",setSuccessResponse("Request Send",gameData.friendRooms[index]));
        
        }
        else{
    
            socket.emit("onRejectRequest",setErrorResponse("Requested player playing or offline"));
        }
    }
    // else{
    //     socket.emit("OnRejectRequest",setErrorResponse("Requested player already playing"));

    // }
}

socketFriendRequestServices.prototype.manageRequest = async function(socket,data,io){
    console.log("status " ,data.status);
    if(data.status == "accept"){
        var index = await getPlayerRoomIndex(data.roomName);
        if(index < 0){
            socket.emit("onRejectRequest",setErrorResponse("player reject your request"));
            
            return;
        }
        gameData.friendRooms[index].userList.push(socket.userId);
        gameData.friendRooms[index].noOfUsers++;
        socket.join(data.roomName);
        io.in(data.roomName).emit("onJoinFriendRoom",setSuccessResponse('Room joined successfully.',gameData.friendRooms[index]));   
        var isPlayersReadyToPlay = shiftFromFriendToFullRoom(index);
        if(isPlayersReadyToPlay){
            io.in(data.roomName).emit("onGameStart",setSuccessResponse('Can play',gameData.friendRooms[index]));   
            
        }
    }
    else{
        socket.to(gameData.connectedUser[data.friendUserId]["socketId"]).emit("onRejectRequest",setErrorResponse("player reject your request"));
    }
}

function shiftFromFriendToFullRoom(index){
    if(gameData.friendRooms[index].noOfUsers == gameData.friendRooms[index].maxPlayer){
        var firstRoom = _.pullAt(gameData.friendRooms,[index]);
        gameData.fullRooms.push(firstRoom);
        return true;
    }
    else{
        return false;
    }
}
function getPlayerRoomIndex(roomName){
  
    return _.findIndex(gameData.friendRooms, {roomName : roomName});
 
}


