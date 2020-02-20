const authentication = require('./authentication');
const storageCommands     = require('./commands/storage');
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

        switch(command){
            case "set":
                stringArgs = dividedData.slice(1);
                args = getSettedArgsStorage(stringArgs);
                result = validateArgs(args, "set");
                break;
            case "add":
                stringArgs = dividedData.slice(1);
                args = getSettedArgsStorage(stringArgs);
                result = validateArgs(args, "add");
                break;
            case "replace":
                stringArgs = dividedData.slice(1);
                args = getSettedArgsStorage(stringArgs);
                result = validateArgs(args, "replace");
                break;
            case "append":
                stringArgs = dividedData.slice(1);
                args = getSettedArgsStorage(stringArgs);
                result = validateArgs(args, "append");
                break;
            case "prepend":
                stringArgs = dividedData.slice(1);
                args = getSettedArgsStorage(stringArgs);
                result = validateArgs(args, "prepend");
                break;
            case "cas":
                stringArgs = dividedData.slice(1);
                args = getSettedArgsStorage(stringArgs, true);
                result = validateArgs(args, "cas");
                break;
            case "get":
                stringArgs = dividedData.slice(1);
                args = getSettedArgsRetrieval(stringArgs);
                result = validateArgs(args, "get");
                break;
            case "gets":
                stringArgs = dividedData.slice(1);
                args = getSettedArgsRetrieval(stringArgs);
                result = validateArgs(args, "gets");
                break; 
            default:
                result.state   = 0;
                result.message = "ERROR\r\n";
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
                stringArgs = dividedData.slice(1);
                args = getSettedArgsStorage(stringArgs);
                result = validateArgs(args, "prepend");
                break;
            case "cas":
                stringArgs = dividedData.slice(1);
                args = getSettedArgsStorage(stringArgs, true);
                result = validateArgs(args, "prepend");
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
            result.message = "CLIENT_ERROR No reply argument has a error. Recieved: " 
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

