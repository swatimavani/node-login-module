const express = require('express');
const app = express();
const conf  = require('../config/constant.conf').carrom;
global.config = conf;
var routes = require('../router/user.route');
var bodyParser = require('body-parser');
const mongoose = require('../db/mongoose.js');
const cache = require('../cache.js');

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

const redis = require('redis');
const client = redis.createClient();
client.set('Hello','swati');

client.get('Hello',console.log);