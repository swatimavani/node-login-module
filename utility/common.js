var responseObj = {
    response :{
        status : false,
        message: "fail",

    },
    data : {}
};
var setResponse = (reqObj) =>{
    if(reqObj){
        responseObj.response.status = true;
        responseObj.response.message = "success";
        responseObj.data.id = reqObj._id;
        responseObj.data.username = reqObj.username;
        responseObj.data.primaryCurrency = reqObj.primaryCurrency;
        responseObj.data.secondaryCurrency = reqObj.secondaryCurrency;
        responseObj.data.data = reqObj.data;
    }
    return responseObj;
}

module.exports = {setResponse}