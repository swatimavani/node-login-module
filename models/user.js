const mongoose = require('mongoose');
const {Schema} = require('mongoose');
const _ = require('lodash');
const jwt = require('jsonwebtoken');

var UserSchema = Schema({
	username:{
		type:String,
		required:true,
		minlength:1
    },
    email:{
        type:String,
        index : {
            unique : true,
            sparse : true
        }
        
    },
   
    deviceId:{
        type:String,
        required:true
    },
    facebookId:{
        type:String,
        default:null
    },
    googleId:{
        type : String,
        default : null
    },
    primaryCurrency:{
        type:Number,
        default:config.game.primaryCurrency
    },
    secondaryCurrency:{
        type:Number,
        default:config.game.secondaryCurrency
    },
    profileLink:{
        type:String,
        default:""
    },
    status:{
        type:String,
        default:config.userStatus.OFFLINE
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
    var user = _.pick(userObject,['_id','facebookId','googleId','username','profileLink','primaryCurrency','secondaryCurrency','data','status']);
    user.userId = user._id;   
    return user;
};

UserSchema.methods.generateAuthToken = async function(deviceId){
    var user = this;
    var temp2;
    await Token.remove({userId:this._id,deviceId:deviceId}).exec();     
    var generatedToken = jwt.sign({_id:this._id.toHexString()},config.secret).toString();
    var token = new Token({userId:this._id,deviceId:deviceId,token:generatedToken});
    try{
        var token = await token.save();
        return token.token;
    }catch(e){  
        return null; 
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
            var token = await Token.findOne({
                userId:decoded._id,
                token:token
            }).populate('userId');
            return token.userId;
	}catch(e){       
		return null;
	}
	
}

var Token = mongoose.model('Token',TokenSchema);

module.exports = {User,Token};