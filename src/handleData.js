const authentication = require('./authentication');
const storageCommands     = require('./commands/storage');
const retrievalCommands     = require('./commands/retrieval');
/**
 * Handles the data from a connection
 * If the state is 0 the data recieved must be a message, otherwise the data 
 * must be a 
 * @param {Object<Buffer>} data 
 * @param {Object} pastResult Contains the data of the previus operation result 
 * @returns {Object} An object containing the result of the data handle
 * state propierty contains the new state for the client
 * message propierty is a message that must be given to the cliente
 */
function handleData(data, pastResult=null){
    var result = {};   
    if(pastResult.state == 0){
        var recievedData = data.toString();
        var dividedData  = recievedData.split(' ');
        var command      = dividedData[0];
        var stringArgs = dividedData.slice(1);
        switch(command){
            case "set":
                args = getSettedArgsStorage(stringArgs);
                result = validateArgs(args, "set");
                break;
            case "add":
                args = getSettedArgsStorage(stringArgs);
                result = validateArgs(args, "add");
                break;
            case "replace":
                args = getSettedArgsStorage(stringArgs);
                result = validateArgs(args, "replace");
                break;
            case "append":
                args = getSettedArgsStorage(stringArgs);
                result = validateArgs(args, "append");
                break;
            case "prepend":
                args = getSettedArgsStorage(stringArgs);
                result = validateArgs(args, "prepend");
                break;
            case "cas":
                args = getSettedArgsStorage(stringArgs, true);
                result = validateArgs(args, "cas");
                break;
            case "get":
                args = getSettedArgsRetrieval(stringArgs);
                result = validateArgs(args, "get");
                result.multipleMessages = [];
                var tempResult = null;
                if(result.message == ""){
                    result.keys.forEach(key => {
                        tempResult = retrievalCommands.get(key);
                        if(tempResult.multipleMessages){
                            result.multipleMessages = result.multipleMessages.concat(tempResult.multipleMessages);
                        }
                    });
                }
                result.multipleMessages = result.multipleMessages.concat("END\r\n");
                break;
            case "gets":
                args = getSettedArgsRetrieval(stringArgs);
                result = validateArgs(args, "gets");
                result.multipleMessages = [];
                var tempResult = null;
                if(result.message == ""){
                    result.keys.forEach(key => {
                        tempResult = retrievalCommands.gets(key);
                        if(tempResult.multipleMessages) 
                            result.multipleMessages = result.multipleMessages.concat(tempResult.multipleMessages);
                    });
                }
                result.multipleMessages = result.multipleMessages.concat("END\r\n");
                break; 

            case "flush_all":
                var noreply = false;
                result.state = 0;

                if(stringArgs.length == 0){
                    result.message = "CLIENT_ERROR missing arguments on flush_all\r\n";
                }
                else if(stringArgs.length > 2){
                    result.message = "CLIENT_ERROR Too many arguments on flush_all\r\n";
                }
                else if(stringArgs.length == 1){
                    if(Number.isNaN(stringArgs[0])){
                        result.message = "CLIENT_ERROR flush_all first argument must be a number\r\n";
                    }
                    else if(stringArgs[0] != "1" && stringArgs[0] != "0"){
                        result.message = "CLIENT_ERROR flush_all first argument must be 0 or 1\r\n";
                    }
                    else{
                        result.command = "flush_all";
                        result.key     = stringArgs[0];
                        result.message = "OK\r\n";
                    }
                }
                else if(stringArgs.length == 2){
                    if(stringArgs[1] == "noreply"){
                        result.command = "flush_all";
                        result.key     = stringArgs[0];
                        result.message = "";
                    }
                    else{
                        result.message = "CLIENT_ERROR No reply argument has an error. Recieved: " 
                        + stringArgs[1] + ", explected: noreply\r\n";
                    }
                }

                break;
            default:
                result.state   = 0;
                result.message = "ERROR\r\n";
                break;
        }
    }
    else if(pastResult.state == 1){
        switch(pastResult.command){
            case "set":
                result = storageCommands.set(data, pastResult.key, pastResult.flags, 
                    pastResult.exptime, pastResult.bytes, pastResult.noReply);
                break;
            case "add":
                result = storageCommands.add(data, pastResult.key, pastResult.flags, 
                    pastResult.exptime, pastResult.bytes, pastResult.noReply);
                break;
            case "replace":
                result = storageCommands.replace(data, pastResult.key, pastResult.flags, 
                    pastResult.exptime, pastResult.bytes, pastResult.noReply);
                break;
            case "append":
                result = storageCommands.append(data, pastResult.key, pastResult.flags, 
                    pastResult.exptime, pastResult.bytes, pastResult.noReply);
                break;
            case "prepend":
                result = storageCommands.preppend(data, pastResult.key, pastResult.flags, 
                    pastResult.exptime, pastResult.bytes, pastResult.noReply);
                break;
            case "cas":
                result = storageCommands.cas(data, pastResult.key, pastResult.flags, 
                    pastResult.exptime, pastResult.bytes, pastResult.cas, pastResult.noReply);
                break;
        }
    }
    else if(pastResult.state == 2){
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
    else if(pastResult.state == 3){
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

/**
 * Gets a string and transforms it into an object representing memcached arguments
 * for a storage operation
 * @param {string} stringArgs 
 * @param {boolean} cas
 * @return {args} The arguments transformed into an object
 */
function getSettedArgsStorage(stringArgs, cas=false){
    var args = {};
    var c    = 0;
    args.missing = false;
    stringArgs.forEach(element => {
        switch(c){
            case 0:
                args.key       = element;
                break;
            case 1:
                args.flags     = element;
                break;
            case 2:
                args.exptime   = element;
                break;
            case 3:
                args.bytes     = element;
                break;
            case 4:
                if(cas){
                    args.cas       = element;
                }
                else{
                    args.noReply   = element;
                }
                break;
            case 5:
                if(cas){
                    args.noReply       = element;
                }
                else{
                    args.tooMany   = element;
                }
                break;
            default:
                if(cas){
                    args.tooMany   = element;
                }
                else{
                    args.tooMany = args.tooMany + " " + element;
                }
                break;
        }
        c++;
    });

    if(c < 3){
        args.missing = true;
    }
    if(args.tooMany === undefined){
        args.state = 1;
        args.message = "";
    }
    return args;
}

/**
 * Gets a string and transforms it into an object representing memcached arguments
 * for a retrieval operation 
 * @param {sting} stringArgs 
 * @return {Object} The arguments transformed into an object
 */
 function getSettedArgsRetrieval(stringArgs){
    var args = {};
    args.missing = false;
    args.keys    = [];
    var c = 0;
    stringArgs.forEach(key => {
        args.keys.push(key);
        c++;
    });
    if(c==0){
        args.missing = true;
    }

    return args;
 }

/**
 * Validates an object of arguments 
 * @param {Object} args The arguments object
 * @param {string} command Name of the command recieved with this arguments
 * @returns {Object} An object containing the result of the data handle
 */
function validateArgs(args, command){
    result = {};
    if(args.missing){
        result.state = 0;
        result.message = "CLIENT_ERROR missing arguments\r\n";
        return result;
    }
    else if(!(args.tooMany === undefined)){
        result.state = 0;
        result.message = "CLIENT_ERROR Too many arguments at " + args.tooMany + "\r\n";
        return result;
    }
    else{
        result = args;
        result.command = command;
    }

    if(!(args.noReply === undefined)){
        if(args.noReply == "noreply"){
            result.noReply = true;
        }
        else{
            result.state = 0;
            result.message = "CLIENT_ERROR No reply argument has an error. Recieved: " 
                + args.noReply + ", explected: noreply\r\n";
            return result;
        }
    }
    
    if(!(args.flags === undefined)){
        var flags = Number(args.flags);
        if(flags != NaN && flags >= 0 && flags < 65535){
            args.flags = flags;
        }
        else{
            result.state = 0;
            result.message = "CLIENT_ERROR flags(second argument) must be a number between 0 and 65536\r\n";
            return result;
        }
    }

    if(!(args.exptime === undefined)){
        var exptime = Number(args.exptime);
        if(!isNaN(exptime)){
            args.exptime = exptime;
        }
        else{
            result.state = 0;
            result.message = "CLIENT_ERROR exptime(third argument) must be a number\r\n";
            return result;
        }
    }

    if(!(args.bytes === undefined)){
        var bytes = Number(args.bytes);
        if(!isNaN(bytes)){
            args.bytes = bytes;
        }
        else{
            result.state = 0;
            result.message = "CLIENT_ERROR bytes(fourth argument) must be a number\r\n";
            return result;
        }
    }

    if(!(args.cas === undefined)){
        var cas = Number(args.cas);
        if(!isNaN(cas)){
            args.cas = cas;
        }
        else{
            result.state = 0;
            result.message = "CLIENT_ERROR cas(fifth argument) must be a number\r\n";
            return result;
        }
    }

    result.message="";
    var storageCommands = ["set", "add", "replace", "append", "prepend", "cas"];

    if(storageCommands.indexOf(command) >= 0){
        result.state=1;
    }
    else{
        result.state=0;
    }
    return result;
}
/**
 * For test purpouses, returns the cache
 * @returns {Object}
 */
function getStorageCache(){
    return storageCommands.currentCache();
} 

module.exports = {
    handleData,
    getSettedArgsStorage,
    getSettedArgsRetrieval,
    validateArgs,
    getStorageCache
}

