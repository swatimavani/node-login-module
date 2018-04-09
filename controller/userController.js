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

    if(ExistingUser && (userData.retrieveOldData == 'true')){
        var user = ExistingUser;       
    }else{               
        if(ExistingUser)
            var existingUser =  removeUser(userData.deviceId);

        where.facebookId = userData.facebookId?userData.facebookId:null;       
        var dataForUpdate = {username:userData.username};
        
        var user = await User.findOneAndUpdate(where,dataForUpdate,{new:true});
               
        user = user?user:await new User(userData).save();
        
    }
    var token = await user.generateAuthToken(userData.deviceId);       
    res.header('x-auth',token).send(user);       
    
}


UserController.prototype.details = async function (req,res){   
    res.send(req.user);
}

async function removeUser(deviceId){   
    var deletedUser = await User.findOneAndRemove({deviceId:deviceId,facebookId:null}).exec();   
    if(deletedUser){
        await Token.remove({userId:deletedUser._id});
    }
    return true;
}