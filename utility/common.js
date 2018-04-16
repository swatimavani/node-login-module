var responseObj = {
    response :{
        status : false,
        message: "fail",

    },
    data : {}
};
var playerData = {
    
}
var roomInfo = {
    
}
var setSuccessResponse = (message,data) =>{   
    responseObj.response.status = true;
    responseObj.response.message = message;
    responseObj.data = data?data:{};   
    return responseObj;
}

var setErrorResponse = (message) =>{   
    responseObj.response.status = false;
    responseObj.response.message = message;
    responseObj.data = {};   
    return responseObj;
}

var setPlayerData = (userId,room) => {
    playerData.playerId = userId;
    playerData.roomName = room.roomName;
    // playerData.userName = room.userName;
    // playerData.profileLink = room.profileLink;
    return playerData;
}
var setRoomInfo = (roomData) => {
    roomInfo.roomName = roomData.roomName;
    roomInfo.noOfUsers = 1;
    roomInfo.roomSize = roomData.roomSize;
    roomInfo.roomStatus = roomData.roomStatus;
    var user = {};
    user.userId = roomData.userId;
    user.userName = roomData.userName;
    user.profileLink = roomData.profileLink;
    roomInfo.userList = [];
    roomInfo.userList.push(user);
    return roomInfo;
    
}
var joinUserInRoom = (rooms,roomIndex,user) => {
    var user = {};
    user.userId = data.userId;
    user.userName = data.userName;
    user.profileLink = data.profileLink;
    rooms[roomIndex].noOfUsers++;
    rooms[roomIndex].userList.push(user);
} 
module.exports = {setSuccessResponse,setErrorResponse,setPlayerData,setRoomInfo,joinUserInRoom}