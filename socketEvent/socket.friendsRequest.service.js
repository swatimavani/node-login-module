const uuidv1 = require('uuid/v1');
const _ = require('lodash');
var {gameData,generateRoomName} = require('./gameData/socket.gameData');


module.exports = new socketFriendRequestServices;
function socketFriendRequestServices(){

}

socketFriendRequestServices.prototype.createRoom =  function(socket,data){
    if(gameData.connectedUser[socket.userId] && !gameData.connectedUser[socket.userId]["isInRoom"]){
        
    }else{

    }
}

