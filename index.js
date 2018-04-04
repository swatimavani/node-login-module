
const express = require('express');
const app = express();
var routes = require('./Router/user.route');
var bodyParser = require('body-parser');


app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use('/user',routes);

app.listen(3001, () => {
    console.log("server on 3001");
    
});