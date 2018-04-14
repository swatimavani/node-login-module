var express = require('express');
var router = express.Router();
var userController = require('../controller/userController');
var {authenticate} = require('../middleware/authenticate');


router.post('/login', userController.login);
router.get('/details', authenticate, userController.details);
router.post('/update', authenticate, userController.update);
router.post('/friends',  authenticate, userController.getAllFriends)



module.exports = router;