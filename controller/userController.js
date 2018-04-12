
module.exports = new UserController;
const _ = require('lodash');
const {MongooseError} = require('mongoose');
const {User} = require('../models/user');
const {Token} = require('../models/user');
const {setSuccessResponse,setErrorResponse} = require('../utility/common');


function  UserController() {
    this.response = {};
}

function getExistingUser(deviceId){
    return User.findOne({deviceId:deviceId,facebookId:null});
}
UserController.prototype.login = async function (req,res) {    
    var userData = _.pick(req.body,['facebookId','deviceId','username','profileLink','data','retrieveOldData']);
    var where = {deleted:false,deviceId:userData.deviceId};   
    
    try{
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
        this.response = setSuccessResponse("User loggedin successfully.",user);    
        res.header('x-auth',token).send(this.response);
    }
    catch(err){       
        this.response = setErrorResponse("Internal server error.");
        res.send(this.response);
    }   
}


UserController.prototype.details = async function (req,res){      
    this.response = setSuccessResponse("User details retrieved successfully.",req.user);    
    res.send(this.response);
}

async function removeUser(deviceId){   
    var deletedUser = await User.findOneAndRemove({deviceId:deviceId,facebookId:null}).exec();   
    if(deletedUser){
        await Token.remove({userId:deletedUser._id});
    }
    return true;
}

UserController.prototype.update = function(req,res){
    var obj = new UserController();   
    var user = obj.updateUser(req.user._id,req.body);   
    this.response = setSuccessResponse("User updated successfully.",user);    
    res.send(this.response);
}

UserController.prototype.updateUser = async function(userId,data){
    var user = await User.update({_id:userId},data);      
    return user;

}

UserController.prototype.manageUserStatus = async function(userId,status){    
    var user = await User.findOneAndUpdate({_id:userId},{status:status},{new:true});
    return user;
}