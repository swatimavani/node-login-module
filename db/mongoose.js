var mongoose = require('mongoose');

// mongoose.Promise = global.Promise;




module.exports.connect = function (dbName){
    var mongodbUri = 'mongodb://localhost:27017/'+dbName;   
    mongoose
        .connect(mongodbUri)
        .connection
        // .once('open', function callback () {
        //     console.log('mongodb up and running at '+ mongodbUri)
        // })
        // .on('error', function (err) {
        //     console.log('cannot connect to mongodb:'+ err.message)
        //     process.exit(1)
        // })
        // .on('close', function () {
        //     console.log('lost connection to mongodb: %s\n')
        //     process.exit(1)
        // })
}

// module.exports = {mongoose};