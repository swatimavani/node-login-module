const socketAuthMiddleware = (socket, next) => {
    //Socket Header will pass from the front-end in `Query` or headers
    var token = socket.handshake.headers.query || socket.handshake.query.token;
    next();
}
module.exports = {
    socketAuthMiddleware
}