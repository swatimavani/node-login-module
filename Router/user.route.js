var express = require('express');
var router = express.Router();
var userController = require('../Controller/UserController');




router.post('/login', userController.login);



module.exports = router;