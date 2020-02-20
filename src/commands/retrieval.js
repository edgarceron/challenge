const cache = require('../cache/cache');

var cacheObj = cache.SingletonCache.getInstance();
/**
 * Retrieves a value from the cache given a key, if there is 
 * not a value for the given key, nothing will be answered.
 * @param {string} key The key which is going to be searched 
 */
function get(key){
    var entry = cacheObj.getEntry(key);
    var result = {};
    result.message = "";
    if(!(entry === undefined)){
        var result = {};
        result.state = 0;
        result.multipleMessages = [valueMessage(entry)];
        result.multipleMessages.push(entry.getData());
    }
    return result;
}

/**
 * Retrieves a value from the cache given a key, if there is 
 * not a value for the given key, nothing will be answered.
 * The values will contain a cas number.
 * @param {string} key The key which is going to be searched 
 */
function gets(key){
    var entry = cacheObj.getEntry(key);
    var result = {};
    result.message = "";
    if(!(entry === undefined)){
        var result = {};
        result.state = 0;
        result.multipleMessages = [valueMessage(entry, true)];
        result.multipleMessages.push(entry.getData());
    }
    return result;
}

/**
 * Returns the VALUE message for a retrieval operation
 * @param {Object<Entry>} entry 
 * @param {boolean} cas Whether the message will come with cas
 * or not. 
 */
function valueMessage(entry, cas=false){
    var value = "VALUE " + entry.getKey() + " " + entry.getFlags()
            + " " + entry.getBytes();
    if(cas){
        value += " " + entry.getCas() + "\r\n";
    }
    else{
        value += "\r\n";
    }
    return value;
}

module.exports = {
    get,
    gets
}