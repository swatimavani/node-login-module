//require socket on services
var services = require('./game.socket.service');

module.exports = (io,config) => {   
    //Enable cross domain access from evry wahere
    //io.origins('*:*'); 
    io.on('connection',(socket)=> {            
        global.socket = socket;
        console.log("Connected");
        socket.on('addUser',(data) => services.addUser(data));

        // socket.on('sendMessage',(message,callback) =>services.messageService(io,socket,message,callback));
    });

}