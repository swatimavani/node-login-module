var {User,Token} = require('./../models/user');
const {setSuccessResponse,setErrorResponse} = require('../utility/common');

var authenticate = async (req,res,next) => {
	var token = req.header('x-auth');
    var user = await Token.findByToken(token);
	if(user){
        req.user = user;
        next();
    }else{
        var response = setErrorResponse('User unauthenticated');
        return res.status(401).send(response);
    }
		
};

module.exports = {authenticate};