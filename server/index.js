<<<<<<< HEAD
const express = require('express');
const app = express();
const conf  = require('../config/constant.conf').carrom;
global.config = conf;
var routes = require('../router/user.route');
var bodyParser = require('body-parser');
const mongoose = require('../db/mongoose.js');
const cache = require('../cache.js');

var cors = require('cors');


var server = require('http').Server(app);
var io = require('socket.io')(server);

mongoose.connect(config.database);
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use('/user',routes);
app.use(cors());

require('../socketEvent/socket')(io);

server.listen(config.PORT, () => {
    console.log("server on ",config.PORT);
    
});


const {MongooseError} = require('mongoose');
const {User} = require('../models/user');

app.get('/users',async function(req,res){
    console.log('from react');
    var users = await User.find().exec();   
    var userData = [];
    users.forEach(function(user){
        userData.push(user);
    })   
    res.send({status:true,data:userData});
});
=======
const express = require('express');
const app = express();
const conf  = require('../config/constant.conf').carrom;
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

>>>>>>> 455cc484c37385982489350b8ea095fbdf46dcd4
