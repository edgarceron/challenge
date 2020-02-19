const fs = require('fs');

module.exports = {  
    /**
     * Authenticates an user if the provided credentials are valid.  
     * @param {string} username 
     * @param {string} password 
     */
    authentication: function(username, password){

        var data = fs.readFileSync('./config/userdata.json');
        var userList = JSON.parse(data.toString());
        var auth = false;
        userList.forEach(user => {
            if(user.username == username && user.password == password){
                auth = true;
            }
        });
        return auth;
    }
}