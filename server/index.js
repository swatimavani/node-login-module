const express = require('express');
const app = express();
var routes = require('../router/user.route');
var bodyParser = require('body-parser');
const mongoose = require('../db/mongoose.js');
global.config  = require('../config/constant.conf').carrom;
var server = require('http').Server(app);
var io = require('socket.io')(server);

mongoose.connect(config.database);
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use('/user',routes);

require('../socketEvent/game.socket')(io, config);

server.listen(config.PORT, () => {
    console.log("server on ",config.PORT);
    
});

