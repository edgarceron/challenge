
/**
 * Checks if there are arguments pased between quotation marks (")
 * in the args array and return a new list with those arguments
 * listed as one
 * @param {Array} args 
 */
function checkClearSeparedStringArgs(args){
    var aux = null;
    var newArgs = []
    for (let index = 0; index < args.length; index++) {
        aux = checkSpacedStringArg(args.slice(index));
        if(aux.endIndex > 0){
            newArgs.push(aux.key);
            index = index + aux.endIndex;
        }
        else{
            newArgs.push(args[index]);
        }
    } 
    return newArgs;
}

/**
 * Checks if there are arguments pased between quotation marks (")
 * and tranforms then into one argument
 * @param {Array} args 
 */
function checkSpacedStringArg(args){
    var firstArg = args[0];
    var endIndex = -1;
    if(firstArg.charAt(0) == '"'){
        for (let index = 1; index < args.length; index++) {
            const element = args[index];
            if(element.charAt(element.length-1) == '"'){
                endIndex = index;
                break;
            }
        }
        if(endIndex > 0){
            var keyArray = args.slice(0, endIndex + 1);
            var key = keyArray.join(" ");
            key = key.substring(1, key.length -1);
            return {"key":key, "endIndex": endIndex};
        }
    }
    return {"key": "", "endIndex": endIndex};
}