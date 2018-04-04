module.exports = new User;
function  User() {
    this.user = {};
}

User.prototype.login = async function (req,res) {

    
    this.user = req.body;
    
    
    res.send(this.user);
}

