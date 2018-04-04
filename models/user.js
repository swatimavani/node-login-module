const mongoose = require('mongoose');
const {Schema} = require('mongoose');
const _ = require('lodash');


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
        type:String
    },
    data:{
        type:String
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
	return _.pick(userObject,['_id','email']);
};



var User = mongoose.model('User',UserSchema);

var TokenSchema = Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:User
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

TokenSchema.methods.generateAuthToken = async function(userId,deviceId){
    var generatedToken = jwt.sign({_id:userId.toHexString()},'abc123').toString();
    var token = new Token({deviceId:deviceId,token:generatedToken});
    try{
        var token = await token.save();
        return token;
    }catch(e){       
        return e; 
    }
};


var Token = mongoose.model('Token',TokenSchema);

module.exports = {User,Token};