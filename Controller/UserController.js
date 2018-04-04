module.exports = new UserController;

const {carrom} = require('../config/constant.conf');
const _ = require('lodash');
const {User} = require('../models/user');

function  UserController() {
    this.user = {};
}

UserController.prototype.login = async function (req,res) {   
    
    var userData = _.pick(req.body,['facebookId','deviceId','username','profileLink','data']);
    userData.primaryCurrency = carrom.game.primaryCurrency;
    userData.secondaryCurrency = carrom.game.secondaryCurrency;
    this.user = await new User(userData).save();
    console.log(this.user);
    res.send(this.user);
}

