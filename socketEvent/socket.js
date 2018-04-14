//require socket on services
var services = require('./socket.service');

module.exports = (io) => {   
    //Enable cross domain access from evry wahere
    //io.origins('*:*'); 
    io.on('connection',(socket)=> {            
        // global.socket = socket;       
        console.log("Connected");
        socket.emit('test',{data:'testing'});
        socket.on('disconnect',()=>services.removeUser(socket));

        socket.on('addUser',(data) => services.addUser(socket,data));
        
        socket.on('createOrJoin', (data) => services.createOrJoin(socket,data,io));
        
        socket.on("leaveRoom",()=> services.leaveRoom(socket));
        
        socket.on("createFriendsRoom", (data) => services.createFriendsRoom(socket,data));
        socket.on("sendRequest", (data) => services.sendRequest(socket,data));
        socket.on("manageRequest", (data) => services.manageRequest(socket,data,io));
        

    });

}