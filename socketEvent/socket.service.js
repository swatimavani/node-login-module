var userController = require('../controller/userController');
var roomServices = require('./socket.room.services');
var friendRequestServices = require('./socket.friendsRequest.service');
var { gameData, changeStatus } = require('./gameData/socket.roomData');
const { setSuccessResponse, setErrorResponse, setUser, getUser, deleteUser } = require('../utility/common');
const _ = require('lodash');
module.exports = new SocketServices;
const nullString = "";
function SocketServices() {
    this.user = {};
}
const maxPlayersInRoom = config.game.maxPlayersInRoom;

SocketServices.prototype.getAllUser = async function (socket) {
    socket.emit("onGet", { user: gameData.connectedUser.length, eRoom: gameData.existingRooms.length, fRoom: gameData.fullRooms.length });
    // console.log(gameData.connectedUser[20]);


}
SocketServices.prototype.addUser = async function (socket, data) {
    // console.log("connected user ", data.userId);  
    let user = {};
    socket.userId = data.userId ? data.userId : nullString;
    // console.log("this user ", this.user);  
    addUserInConnectedUser(socket, user);
    changeStatus(socket, config.userStatus.ONLINE, false);
}
SocketServices.prototype.createOrJoin = function (socket, data, io) {
    // console.log("create Or Join ", data);
    roomServices.createOrJoin(socket, data, io);
}

SocketServices.prototype.gameStarted = function (data) {
    if (data.room) {
        data.room.userList.forEach(function (value) {
            console.log(value);
        });
    }
}

SocketServices.prototype.removeUser = async function (socket) {
    console.log('Remove User');
    try {

        await roomServices.leaveRoom(socket);
        changeStatus(socket, config.userStatus.OFFLINE, false);
        if (socket.userId) {
            delete gameData.connectedUser[socket.userId];
            // await deleteUser(socket.userId, gameData.connectedUser);

        }


    } catch (error) {
        console.log("Error in remove user", error);
        socket.emit("onError", setErrorResponse('Internal server Error'));
    }

}

SocketServices.prototype.leaveRoom = function (socket, data) {


    roomServices.leaveRoom(socket);
    changeStatus(socket, config.userStatus.ONLINE, false);
}

SocketServices.prototype.createFriendsRoom = function (socket, data) {
    friendRequestServices.createRoom(socket, data);
}

SocketServices.prototype.sendRequest = function (socket, data) {
    friendRequestServices.sendRequest(socket, data);
}

SocketServices.prototype.manageRequest = function (socket, data, io) {
    friendRequestServices.manageRequest(socket, data, io);
}

SocketServices.prototype.message = function (socket, data) {
    try {
        if (data) {
            if (data.roomName)
                socket.to(data.roomName).emit(data.methodName, data);
            else
                socket.emit(data.methodName, data);
        }
        console.log('try block');
    } catch (error) {
        console.log("Error in remove user", error);
        socket.emit("onError", setErrorResponse('Internal server Error'));
    }

}

SocketServices.prototype.messageToAll = function (data, io) {
    if (data) {
        if (data.roomName)
            io.in(data.roomName).emit(data.methodName, data);
    }

}
async function addUserInConnectedUser(socket, user) {
    console.log(socket.userId);
    
    let userObj = {};
    user.socketId = socket.id;
    user.status = config.userStatus.ONLINE;
    user.isInRoom = false;
    gameData.connectedUser[socket.userId] = user;
    socket.emit("onAddUser", setSuccessResponse("Player is added", gameData.connectedUser[socket.userId]));
}


