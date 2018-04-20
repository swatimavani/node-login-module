//require socket on services
var services = require('./socket.service');

module.exports = (io) => {   
    //Enable cross domain access from evry wahere
    //io.origins('*:*'); 
    io.on('connection',(socket)=> {            
        
        console.log("Connected");

        socket.on('disconnect',()=>services.removeUser(socket));

        socket.on('addUser',(data) => services.addUser(socket,data));
        
        socket.on('createOrJoin', (data) => services.createOrJoin(socket,data,io));
        
        socket.on('gameStarted', (data) => services.gameStarted(data));
        
        socket.on("leaveRoom",()=> services.leaveRoom(socket,data));

        socket.on("changeStatus",()=>services.changeStatus(socket,data));
        
        socket.on("createFriendsRoom", (data) => services.createFriendsRoom(socket,data));

        socket.on("sendRequest", (data) => services.sendRequest(socket,data));

        socket.on("manageRequest", (data) => services.manageRequest(socket,data,io));

        socket.on('message', (data) => services.message(socket,data));
        
        socket.on('messageToAll', (data) => services.messageToAll(data,io));  
    
    });

}