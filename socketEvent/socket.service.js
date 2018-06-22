var roomServices = require('./socket.room.services');
var friendRequestServices = require('./socket.friendsRequest.service');
var { gameData, changeStatus } = require('./gameData/socket.roomData');
const { setSuccessResponse, setErrorResponse, log } = require('../utility/common');
const _ = require('lodash');
module.exports = new SocketServices;
function SocketServices() {
}

SocketServices.prototype.addUser = async function (socket, data) {
    log('add user: ' + JSON.stringify(data));
    
    socket.userId = data.userId ? data.userId : "";

    log('add user in socket: ' +socket.userId);
    addUserInConnectedUser(socket);
    changeStatus(socket, config.userStatus.ONLINE, false);
}
SocketServices.prototype.createOrJoin = function (socket, data, io) {
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
    log('Remove User');
    try {

        await roomServices.leaveRoom(socket);
        changeStatus(socket, config.userStatus.OFFLINE, false);
        if (socket.userId) {
            delete gameData.connectedUser[socket.userId];
        }


    } catch (error) {
        log("Error in remove user", error);
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
    log("message",data);
    try {
        if (data) {
            if (data.roomName){               
                socket.to(data.roomName).emit(data.methodName, data);
            }

            else
                socket.emit(data.methodName, data);
        }
    } catch (error) {
        log("Error in Message", error);
        socket.emit("onError", setErrorResponse('Internal server Error'));
    }

}

SocketServices.prototype.messageToAll = function (socket,data, io) {
    log('Message to all');
    if (data) {
        if (data.roomName)
            io.in(data.roomName).emit(data.methodName, data);
        else
            socket.emit(data.methodName, data);
    }

}
async function addUserInConnectedUser(socket) {
    let user = {};
    user.socketId = socket.id;
    user.status = config.userStatus.ONLINE;
    user.isInRoom = false;
    gameData.connectedUser[socket.userId] = user;
    socket.emit("onAddUser", setSuccessResponse("Player is added", gameData.connectedUser[socket.userId]));
}


