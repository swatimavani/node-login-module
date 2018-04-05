module.exports = new UserController;

const {carrom} = require('../config/constant.conf');
const _ = require('lodash');
const {User} = require('../models/user');
const {Token} = require('../models/user');

function  UserController() {
    this.user = {};
}

UserController.prototype.login = async function (req,res) {    
    var userData = _.pick(req.body,['facebookId','deviceId','username','profileLink','data']);
    var where = {deleted:false};
    if(userData.facebookId){
        where.facebookId = userData.facebookId;
    }else{
        where.deviceId = userData.deviceId;
    }
    var dataForUpdate = {username:userData.username};
    var user = await User.findOneAndUpdate(where,dataForUpdate,{new:true});

    if(!user){
        userData.primaryCurrency = carrom.game.primaryCurrency;
        userData.secondaryCurrency = carrom.game.secondaryCurrency;
        user = await new User(userData).save();
    }
    if(user){
        var token = await user.generateAuthToken(userData.deviceId);       
        res.header('x-auth',token).send(user);       
    }else{
        res.send(user);
    }
}

UserController.prototype.details = async function (req,res){   
    res.send(req.user);
}

