const express = require('express');
const app = express();
var routes = require('../router/user.route');
var bodyParser = require('body-parser');
const mongoose = require('../db/mongoose.js');
const {carrom} = require('../config/constant.conf');
var server = require('http').Server(app);
var io = require('socket.io')(server);

mongoose.connect(carrom.database);
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use('/user',routes);

require('../socketEvent/game.socket')(io, carrom);

server.listen(3001, () => {
    console.log("server on 3001");
    
});
