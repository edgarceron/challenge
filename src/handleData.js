const authentication = require('./authentication');

module.exports = {
    /**
     * Handles the data from a connection
     * If the state is 0 the data recieved must be a message, otherwise the data 
     * must be a 
     * @param {Object<Buffer>} data 
     * @param {int} state 
     * @returns {Object} An object containing the result of the data hadle
     * state propierty contains the new state for the client
     * message propierty is a message that must be given to the cliente
     */
    handleData: function (data, state){

        var result = {}; 
        
        if(state == 0){
            var recievedData = data.toString();
            var dividedData  = recievedData.split(' ');
            var command      = dividedData[0];

            switch(command){
                case "set":
                    break;
                case "add":
                    break;
                case "replace":
                    break;
                case "append":
                    break;
                case "prepend":
                    break;
                case "cas":
                    break;
                case "get":
                    break;
                case "gets":
                    break; 
                case "gat":
                    break;
                case "gats":
                    break;  
                default:
                    result.state   = 0;
                    result.message = "ERROR\r\n";
            }
        }
        else if(state == 1){

        }
        else if(state == 2){
            var recievedData = data.toString();
            var dividedData  = recievedData.split(' ');
            var command      = dividedData[0];

            switch(command){
                case "set":
                    result.state   = 3;
                    result.message = "";
                    break;
                default:
                    result.state   = 2;
                    result.message = "CLIENT_ERROR Client must login before using memcached\r\n";
            }
        }
        else if(state == 3){
            var recievedData = data.toString();
            var dividedData  = recievedData.split(' ');
            if(dividedData.length >= 2){
                var user = dividedData[0];
                var password = dividedData.slice(1).join(" ");
                if(authentication.authentication(user, password)){
                    result.state   = 0;
                    result.message = "STORED\r\n";
                }
                else{
                    result.state   = 2;
                    result.message = "CLIENT_ERROR Incorrect username and/or password\r\n";
                }
            }
            else{
                result.state   = 2;
                result.message = "CLIENT_ERROR Client must log in first\r\n";
            }
        }

        return result;
    }
}