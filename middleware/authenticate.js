var {User} = require('./../models/user');
var {Token} = require('./../models/user');

var authenticate = async (req,res,next) => {
	var token = req.header('x-auth');
	var token = await Token.findByToken(token);
	if(token){
        req.user = token;
        req.token = token;	
        next();
    }else{
        res.status(401).send();
    }
		
};

module.exports = {authenticate};