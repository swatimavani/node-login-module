var responseObj = {
    response :{
        status : false,
        message: "fail",
    },
    payload : {}
};


var setSuccessResponse = (message,data) =>{   
    responseObj.response.status = true;
    responseObj.response.message = message;
    responseObj.payload = data?data:{};   
    return responseObj;
};

var setErrorResponse = (message) =>{   
    responseObj.response.status = false;
    responseObj.response.message = message;
    responseObj.payload = {};   
    return responseObj;
}

var setPlayerData = (userId,room) => {
    var playerData = {};
    playerData.playerId = userId;
    playerData.roomName = room.roomName;
    // playerData.userName = room.userName;
    // playerData.profileLink = room.profileLink;
    return playerData;
}
var setRoomInfo = (roomData) => {
    // var roomInfo = {};
    var roomInfo = roomData.room;
    roomInfo.noOfUsers = 1;

    // roomInfo.roomName = roomData.room.roomName;
    roomInfo.roomSize = roomData.room.roomSize;
    // roomInfo.roomStatus = roomData.room.roomStatus;  
}
module.exports = {setSuccessResponse,setErrorResponse};