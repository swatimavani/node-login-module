//require socket on services
const services = require('./game.socket.service');

//require auth middleware
const {socketAuthMiddleware} = require('./game.socket.auth.middlewares'); 


module.exports = (io,data) => {
    
    console.log("config " + data);
    
    //Enable cross domain access from evry wahere
    //io.origins('*:*');

    //use Middleware
   io.use(socketAuthMiddleware);

    io.on('connection',(socket)=> {

        console.log("socket id " + socket.id);
        socket.on('sendMessage',(message,callback) =>services.messageService(io,socket,message,callback));
    });

}