
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
    return User.findOne({deviceId:deviceId , facebookId : null,googleId : null});
}
UserController.prototype.login = async function (req,res) {   
    
    var userData = _.pick(req.body,['deviceId','username','profileLink','data','email']);
    try{
        var ExistingUser = await getExistingUser(userData.deviceId);
       
        if(ExistingUser){
            var existingUser = removeUser(userData.deviceId);
           
        }
        else{
   
            var user = await new User(userData).save();
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

UserController.prototype.linkAccount = async function(req,res){
    var userData = _.pick(req.body,['googleId','facebookId','deviceId','username','profileLink','email']); 
    if(userData.googleId || userData.facebookId){

        var user = await User.findOne({$or : [{googleId : userData.googleId}, {facebookId : userData.facebookId}]}).exec();
    
        if(!user){
            var ExistingUser = await getExistingUser(userData.deviceId);
            if(ExistingUser){
                userData.data = ExistingUser.data;
                user = await new User(userData).save();
              
            }
            else{
                user = await new User(userData).save();
                
            }
        }else{
            user.googleId = userData.googleId ? userData.googleId : user.googleId;
            user.facebookId = userData.facebookId ? userData.facebookId : user.facebookId;    
            user.username = userData.username;
            user.deviceId = userData.deviceId;
            user.profileLink = userData.profileLink;
            user.email = userData.email;
            user = await user.save();
       
        }
        var existingUser = removeUser(userData.deviceId);
        var token = await user.generateAuthToken(userData.deviceId);   
        this.response = setSuccessResponse("User loggedin successfully.",user);    
        res.header('x-auth',token).send(this.response);
    }else{
        this.response = setErrorResponse("Internal server error.");
        res.send(this.response);
    }
}


UserController.prototype.details = async function (req,res){          
    this.response = setSuccessResponse("User details retrieved successfully.",req.user);    
    res.send(this.response);
}

async function removeUser(deviceId){   
    var deletedUser = await User.findOneAndRemove({deviceId:deviceId, facebookId : null,googleId : null}).exec();   
    if(deletedUser){
        await Token.remove({userId:deletedUser._id});
    }
    return true;
}

UserController.prototype.update = function(req,res){
    var userController = new UserController();   
    var user = userController.updateUser(req.user._id,req.body);   
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

UserController.prototype.getAllFriends = async function(req,res){
    var friendIds = req.body.friendIds?req.body.friendIds:[];
    var users = await User.find({facebookId:{$in: friendIds}});
    if(users)
        this.response = setSuccessResponse("Retrieved all friends.",users); 
    else
        this.response = setSuccessResponse("No friends found"); 
    res.send(this.response);
}