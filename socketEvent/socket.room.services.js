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

    if(gameData.connectedUser[socket.userId] && gameData.connectedUser[socket.userId].isInRoom === false){

        if(Object.keys(gameData.existingRooms).length == 0){
            await CreateRoom(socket,data, io,userData);
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

    if(gameData.connectedUser[socket.userId] && gameData.connectedUser[socket.userId].isInRoom){
    
    
       rooms = Object.assign({}, gameData.fullRooms, gameData.existingRooms,gameData.friendRooms);
       
           console.log("Room List",rooms);
           
           
        console.log("socket id " , socket.userId);
        room = _.findKey(rooms, function(roomElement){
            return roomElement.userList.find(function(e) {
                return e.userId == socket.userId; 
            });
        });
        console.log("room " , room);
        
        if(room){
            console.log("roooooooooooooooom" , JSON.stringify(rooms[room].roomStatus) );
            if(rooms[room].roomStatus == constant.roomStatus.EXISTING_ROOM){
                //mapping
                console.log("gameData.existingRooms", room);
                
                removePlayerFromRoom(socket,gameData.existingRooms,room,userData);               
                
                //
                // removePlayerFromRoom(socket,gameData.existingRooms,room.roomName,userData);               
            }
            else if(rooms[room].roomStatus == constant.roomStatus.FULL_ROOM){
                console.log("gameData.fullRooms", room);
                
                //mapping
                removePlayerFromRoom(socket,gameData.fullRooms,room,userData);               
                
                //
                // removePlayerFromRoom(socket,gameData.fullRooms,room.roomName,userData);               
            }
            else{
                //mapping
                removePlayerFromRoom(socket,gameData.friendRooms,room,userData);
                
                //
                // removePlayerFromRoom(socket,gameData.friendRooms,room.roomName,userData);
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
    
    // data.room.roomName = newRoom;
    data.room.roomStatus = constant.roomStatus.EXISTING_ROOM;
    data.room.roomName = newRoom;
    data.user = {};
    data.user.userId = socket.userId;
    data.user.isHost = true;
    roomInfo = setRoomInfo(data);
    //mapping
    gameData.existingRooms[newRoom] = roomInfo;

    //
    // gameData.existingRooms.push(roomInfo);
    

    
    changeStatus(socket,config.userStatus.PLAYING,true);

    socket.join(newRoom);


    socket.emit("onCreateRoom",setSuccessResponse(messages.roomCreateSuccessfully,{room:roomInfo}));
    
}
function JoinRoom(socket,data,io,userData){
    console.log("Join room : ",data ); 
    let roomName;
    
    let isRoomFull;
    //mapping
        roomName = _.findKey(gameData.existingRooms,function(roomElement) {
            return roomElement.roomSize == data.room.roomSize;
        });
    //
    // roomIndex = _.findIndex(gameData.existingRooms, {roomSize : data.room.roomSize});
    //mapping
    if(roomName){
    
    //
    
    // if(roomName >= 0){
        data.user = {};
        data.user.userId = socket.userId;
        data.user.isHost = false;
        // roomName = gameData.existingRooms[roomName].roomName;
        joinUserInRoom(gameData.existingRooms,roomName,data);
        socket.join(roomName);
    
        changeStatus(socket,config.userStatus.PLAYING,true);

        socket.emit("onJoinRoom",setSuccessResponse(messages.roomJoinSuccessfully,{room:gameData.existingRooms[roomName]})); 
        socket.to(roomName).emit("onOpponentJoinRoom",setSuccessResponse(messages.roomJoinSuccessfully,{user:data.user})); 
        
        if(gameData.existingRooms[roomName].noOfUsers == gameData.existingRooms[roomName].roomSize){
            
            isRoomFull = shiftToFullRoom(gameData.existingRooms,roomName);
        }
        // if(isRoomFull){  
        //     io.in(roomName).emit("onGameStart",setSuccessResponse(messages.gameStart));      
        // }
    }else{
        CreateRoom(socket,data, io,userData);
    }
}

function removePlayerFromRoom(socket,rooms,roomName,user){
    let roomIndex;
    let removedUser;
    console.log("removePlayerFromRoom : ",roomName);
    socket.leave(roomName);
    
    // roomIndex = _.findIndex(rooms,{roomName:roomName});
    console.log("existingRoom" , gameData.existingRooms[roomName]);
    console.log("rooms" , rooms[roomName]);
    
    console.log("fullRoom" , gameData.fullRooms[roomName]);
    
    removedUser = removeUserFromRoom(rooms,roomName,socket.userId);
    //mapping
    rooms[roomName].noOfUsers--;
    
    //
    // rooms[roomIndex].noOfUsers--;
    
    //reset user data in redis 
    // user.isInRoom = false;

    //mapping 
    gameData.connectedUser[socket.userId].isInRoom = false;
    //


    // setUser(user,gameData.connectedUser);
    
    //
    socket.emit('onLeaveRoom',setSuccessResponse(messages.roomLeaveSuccessfully));     
    



    socket.to(roomName).emit("onOpponentLeaveRoom",setSuccessResponse(messages.roomLeaveSuccessfully,{room:rooms[roomIndex],user:{userId:socket.userId}}));    
    
    if(rooms[roomName].noOfUsers == 0){
        
        
        delete rooms[roomName];         
    }else{
        console.log(rooms[roomName]);
        
        rooms[roomName].userList[0].isHost = true;
    }
    console.log( "removed" + JSON.stringify(gameData.existingRooms));  
}

function removeUserFromRoom(room,roomName,userId){
    console.log("removeUserFromRoom" , room[roomName]);
    
    return _.remove(room[roomName].userList,function(user){
        if(user.userId == userId)
            return true;
        return false;
    });  
         
}