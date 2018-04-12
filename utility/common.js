var responseObj = {
    response :{
        status : false,
        message: "fail",

    },
    data : {}
};
var setSuccessResponse = (message,data) =>{   
    responseObj.response.status = true;
    responseObj.response.message = message;
    responseObj.data = data?data:{};   
    return responseObj;
}

var setErrorResponse = (message) =>{   
    responseObj.response.status = false;
    responseObj.response.message = message;
    responseObj.data = {};   
    return responseObj;
}

module.exports = {setSuccessResponse,setErrorResponse}