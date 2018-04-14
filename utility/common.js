var responseObj = {
    response :{
        status : false,
        message: "fail",

    },
    data : {}
};
var playerData = {
    playerId,
    roomName
}
var roomInfo = {
    roomName,
    noOfUsers,
    maxPlayer,
    roomStatus,
    userList : []
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

var setPlayerData = (userId,roomName,data) => {
    playerData.playerId = userId;
    playerData.roomName = roomName;
    playerData.userName = data.userName;
    playerData.profileLink = data.profileLink;
    
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
    roomInfo.userList.push(user);
    return roomInfo;
    
}
module.exports = {setSuccessResponse,setErrorResponse,setPlayerData,setRoomInfo}