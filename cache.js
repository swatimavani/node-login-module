const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const client = redis.createClient();


client.get = util.promisify(client.get);
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = async function(){
    this.getCached = true;
    return this;
}

mongoose.Query.prototype.exec = async function(){
    // if(!this.getCached){
    //     return exec.apply(this,arguments);
    // }
    // console.log('IM ABOUT TO RUN A QUERY');

    const key = await JSON.stringify(Object.assign({},this.getQuery(),{
        collection:this.mongooseCollection.name
    }));

    // console.log('Key: ',key);
    const cacheValue = await client.get(key);
    // console.log('cache',cacheValue);
    if(cacheValue){
        // console.log('FROM CACHE');
        // console.log(cacheValue);
        return JSON.parse(cacheValue);
    }else{
        // console.log('FROM SERVER');
        const result = await exec.apply(this,arguments);       
        // console.log('result',result);
        client.set(key,JSON.stringify(result));
        return result;
    }
}