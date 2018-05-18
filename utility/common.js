const util = require('util');
const _ = require('lodash');
var {gameData} = require('../socketEvent/gameData/socket.roomData');
let userIndex;
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

// function createLogger(){
//     var winston = require('winston');
//     require('winston-daily-rotate-file');

//     var transport = new (winston.transports.DailyRotateFile)({
//     filename: 'application-%DATE%.log',
//     datePattern: 'YYYY-MM-DD-HH',
//     zippedArchive: true,
//     maxSize: '20m',
//     maxFiles: '14d'
//     });

//     transport.on('rotate', function(oldFilename, newFilename) {
//     // do something fun
//     });

//     var logger = new (winston.Logger)({
//         transports: [
//             transport
//         ]
//     });
//     return logger;
// }


// var log = async function(type,message){
//     var logger = await createLogger();

// }

var setUser = function(userData){
    gameData.connectedUser.push(userData);
}

var getUser = async function(userId){
    // userIndex = _.findIndex(gameData.connectedUser,['userId',userId]);
    
    if(userIndex < 0){
        return null;
    }
    return gameData.connectedUser[userIndex];
}

var deleteUser = async function(userId){
    userIndex = _.findIndex(gameData.connectedUser,{userId:userId});
    if(userIndex < 0){
        return true;    
    }
    gameData.connectedUser.splice(userIndex,1);
}

module.exports = {setSuccessResponse,setErrorResponse,setUser,getUser,deleteUser};