const redis = require('redis');
const client = redis.createClient();
const util = require('util');
client.hget = util.promisify(client.hget); 

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
    return client.hset(config.database,userData.userId,JSON.stringify(userData));
}
var getUser = async function(userId){
    const user = await client.hget(config.database,userId);
    return JSON.parse(user);
}

var deleteUser = async function(userId){
    client.hdel(config.database,userId);
}

module.exports = {setSuccessResponse,setErrorResponse,setUser,getUser,deleteUser};