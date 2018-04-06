module.exports = new SocketServices;

function  SocketServices(config) {
    this.config = config;   
}

const maxPlayersinRoom = this.config.game.maxPlayersinRoom;
const maxRooms = this.config.game.maxRooms;
const allowSwitchingRoom = this.config.game.allowSwitchingRoom;       

var connectedUser = new Array();
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

// const messageService = (io,socket,message,callback) => {
//     console.log(message);   
//     // callback("messageServiceCalled");
// }


function addUserInConnectedUser(_userId){
    if(!connectedUser[_userId]){
        connectedUser[_userId] = new Array();
    }
    connectedUser[_userId]["socketId"] = socket.id;   
}