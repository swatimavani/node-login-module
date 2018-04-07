//require socket on services
var services = require('./game.socket.service');

module.exports = (io,config) => {   
    //Enable cross domain access from evry wahere
    //io.origins('*:*'); 
    services = new services(config);  
    io.on('connection',(socket)=> {     
        console.log(testing);  
        global.socket = socket;
        console.log("Connected");
        socket.on('addUser',(data) => services.addUser(data));

        // socket.on('sendMessage',(message,callback) =>services.messageService(io,socket,message,callback));
    });

}