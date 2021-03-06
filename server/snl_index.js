const express = require('express');
const app = express();
const conf  = require('../config/constant.conf').snl;
global.config = conf;
var routes = require('../router/user.route');
var bodyParser = require('body-parser');
const mongoose = require('../db/mongoose.js');


var server = require('http').Server(app);
var io = require('socket.io')(server);

mongoose.connect(config.database);
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use('/user',routes);

require('../socketEvent/socket')(io);

server.listen(config.PORT, () => {
    console.log("server on ",config.PORT);

});