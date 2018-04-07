const mongoose = require('mongoose');
const {Schema} = require('mongoose');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const config = require('../config/constant.conf');

var UserSchema = Schema({
	username:{
		type:String,
		required:true,
		minlength:1
    },
    email:{
		type:String
    },
   
    deviceId:{
        type:String
    },
    facebookId:{
        type:String
    },
    primaryCurrency:{
        type:Number
    },
    secondaryCurrency:{
        type:Number
    },
    profileLink:{
        type:String,
        default:""
    },
    status:{
        type:String,
        default:config.userStatus[0]
    },
    data:{
        type:String,
        default:""
    },
    deleted:{
        type:Boolean,
        default:false
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    updatedAt:{
        type:Date,
        default:Date.now()
    }
});


UserSchema.methods.toJSON = function(){
	var user = this;
	var userObject = user.toObject();
	return _.pick(userObject,['_id','username','profileLink','primaryCurrency','secondaryCurrency']);
};

UserSchema.methods.generateAuthToken = async function(deviceId){
    var user = this;
    var generatedToken = jwt.sign({_id:this._id.toHexString()},config.secret).toString();
    var token = new Token({userId:this._id,deviceId:deviceId,token:generatedToken});
    try{
        var token = await token.save();
        return token.token;
    }catch(e){       
        return e; 
    }
};

var User = mongoose.model('User',UserSchema);

var TokenSchema = Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    deviceId:{
		type:String	
    },
    token:{
		type:String
    },
    deleted:{
        type:Boolean
    },
    createdAt:{
        type:Date
    },
    updatedAt:{
        type:Date
    }
});

TokenSchema.statics.findByToken = async function(token){
	var Token = this;
	var decoded;
	try{
        decoded = jwt.verify(token,config.secret);
        console.log(decoded);       
        var token = await Token.findOne({
                userId:decoded._id,
                token:token
            }).populate('userId').exec();           
        return token.userId;
	}catch(e){
		return (e);
	}
	
}

var Token = mongoose.model('Token',TokenSchema);

module.exports = {User,Token};