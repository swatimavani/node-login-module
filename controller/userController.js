module.exports = new UserController;
const _ = require('lodash');
const {User} = require('../models/user');
const {Token} = require('../models/user');

function  UserController() {
    this.user = {};
}

function getExistingUser(deviceId){
    return User.findOne({deviceId:deviceId,facebookId:null});
}
UserController.prototype.login = async function (req,res) {    
    var userData = _.pick(req.body,['facebookId','deviceId','username','profileLink','data','retrieveOldData']);
    var where = {deleted:false,deviceId:userData.deviceId};   
       
    var ExistingUser = await getExistingUser(userData.deviceId);
    
    if(ExistingUser && userData.retrieveOldData){
        var token = await ExistingUser.generateAuthToken(userData.deviceId);       
        return res.header('x-auth',token).send(ExistingUser);       
    }else{       
        where.facebookId = userData.facebookId?userData.facebookId:null;       
        var dataForUpdate = {username:userData.username};
        var user = await User.findOneAndUpdate(where,dataForUpdate,{new:true});
    
        if(!user){
            userData.primaryCurrency = config.game.primaryCurrency;
            userData.secondaryCurrency = config.game.secondaryCurrency;
            user = await new User(userData).save();
        }
        if(user){
            var token = await user.generateAuthToken(userData.deviceId);       
            res.header('x-auth',token).send(user);       
        }else{
            res.send(user);
        }
    }
    
}

UserController.prototype.details = async function (req,res){   
    res.send(req.user);
}

async function removeUser(deviceId){
    var deletedUser = await User.fineOneAndRemove({deviceId:deviceId,facebookId:null});
    if(deletedUser){
        await Token.remove({userId:deletedUser._id});
    }
    return true;
}