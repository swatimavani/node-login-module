module.exports = new SocketServices;

function SocketServices() {   
}

const maxPlayersinRoom = config.game.maxPlayersinRoom;
const maxRooms = config.game.maxRooms;
const allowSwitchingRoom = config.game.allowSwitchingRoom;       

var connectedUser = [];
var rooms = {};
var player = {};
var playerRoom = {};

SocketServices.prototype.addUser = function(data){
    console.log("add user");
    var userId = data.userId?data.userId:0;
    var _userId = userId?"user"+userId:"";
    addUserInConnectedUser(_userId);
    console.log(connectedUser);
}

function addUserInConnectedUser(_userId){
    if(!connectedUser[_userId]){
        connectedUser[_userId] = new Array();
    }
    connectedUser[_userId]["socketId"] = socket.id;   
}