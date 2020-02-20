const cache = require('../cache/cache');
const entry = require('../cache/entry');

var cacheObj = cache.SingletonCache.getInstance();
/**
 * Sets a value in the cache.
 * @param {Object<Buffer>} data Data to store in the cache
 * @param {string} key Key value to represent stored data, up to 250 characters
 * @param {number} flags A number between 0 and 65535
 * @param {number} exptime Expiration time;  a unix time stamp or a number in 
 * seconds less than 60*60*24*30(Number of seconds in 30 days)
 * @param {number} bytes Byte size of the data
 * @param {boolean} noreply Represents whether the client needs a response or not
 */
function set(data, key, flags, exptime, bytes, noreply){
    
    var e = new entry.Entry(key, flags, exptime, bytes, cacheObj.newCas(), data);
    var oldEntry = cacheObj.getEntry(key);
    cacheObj.alterEntry(key, e);
    
    if(oldEntry === undefined){
        cacheObj.alterMemoryUsage(bytes);
    }
    else{
        cacheObj.alterMemoryUsage(-oldEntry.bytes);
        cacheObj.alterMemoryUsage(bytes);
    }

    result = {};
    result.state = 0;
    if(!noreply){
        result.message = "STORED\r\n";
    }
    return result;
}

/**
 * Stores data, but only if the server doesn't already hold data for the
 * provided key.
 * @param {Object<Buffer>} data Data to store in the cache
 * @param {string} key Key value to represent stored data, up to 250 characters
 * @param {number} flags A number between 0 and 65535
 * @param {number} exptime Expiration time;  a unix time stamp or a number in 
 * seconds less than 60*60*24*30(Number of seconds in 30 days)
 * @param {number} bytes Byte size of the data
 * @param {boolean} noreply Represents whether the client needs a response or not
 */
function add(data, key, flags, exptime, bytes, noreply){
    var oldEntry = cacheObj.getEntry(key);
    if(oldEntry === undefined){
        return set(data, key, flags, exptime, bytes, noreply);
    }
    else{
        return notStoredResult();
    }
}

/**
 * Stores data, but only if the server already hold data for the provided key.
 * Replaces the previus data in the key.
 * @param {Object<Buffer>} data Data to store in the cache
 * @param {string} key Key value to represent stored data, up to 250 characters
 * @param {number} flags A number between 0 and 65535
 * @param {number} exptime Expiration time;  a unix time stamp or a number in 
 * seconds less than 60*60*24*30(Number of seconds in 30 days)
 * @param {number} bytes Byte size of the data
 * @param {boolean} noreply Represents whether the client needs a response or not
 */
function replace(data, key, flags, exptime, bytes, noreply){
    var oldEntry = cacheObj.getEntry(key);
    if(oldEntry === undefined){
        return notStoredResult();
    }
    else{
        return set(data, key, flags, exptime, bytes, noreply);
    }
}

/**
 * Stores data, but only if the server already hold data for the
 * provided key, puts the data at the end of the existent data.
 * @param {Object<Buffer>} data Data to store in the cache
 * @param {string} key Key value to represent stored data, up to 250 characters
 * @param {number} flags A number between 0 and 65535
 * @param {number} exptime Expiration time;  a unix time stamp or a number in 
 * seconds less than 60*60*24*30(Number of seconds in 30 days)
 * @param {number} bytes Byte size of the data
 * @param {boolean} noreply Represents whether the client needs a response or not
 */
function append(data, key, flags, exptime, bytes, noreply){
    var oldEntry       = cacheObj.getEntry(key);
    if(oldEntry === undefined){
        return notStoredResult();
    }
    else{
        var oldData    = oldEntry.getData();
        var concatData = Buffer.concat([oldData, data]);
        var sumBytes   = oldEntry.getBytes() + bytes;
        return set(concatData, key, oldEntry.getFlags(), oldEntry.getExptime(), sumBytes, noreply);
    }
}

/**
 * Stores data, but only if the server already hold data for the
 * provided key, puts the data at the start of the existent data.
 * @param {Object<Buffer>} data Data to store in the cache
 * @param {string} key Key value to represent stored data, up to 250 characters
 * @param {number} flags A number between 0 and 65535
 * @param {number} exptime Expiration time;  a unix time stamp or a number in 
 * seconds less than 60*60*24*30(Number of seconds in 30 days)
 * @param {number} bytes Byte size of the data
 * @param {boolean} noreply Represents whether the client needs a response or not
 */
function preppend(data, key, flags, exptime, bytes, noreply){
    var oldEntry       = cacheObj.getEntry(key);
    if(oldEntry === undefined){    
        return notStoredResult();
    }
    else{
        var oldData    = oldEntry.getData();
        var concatData = Buffer.concat([data, oldData]);
        var sumBytes   = oldEntry.getBytes() + bytes;
        return set(concatData, key, oldEntry.getFlags(), oldEntry.getExptime(), sumBytes, noreply);
    }
}

/**
 * Returns a standard response for a failed storage operation
 * @returns {Object} The result object.
 */
function notStoredResult(){
    result         = {};
    result.state   = 0;
    result.message = "NOT_STORED\r\n";
    return result;
}

module.exports = {
    set,
    add,
    replace,
    append,
    preppend
}