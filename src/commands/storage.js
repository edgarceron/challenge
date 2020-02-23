const cache = require('../cache/cache');
const entry = require('../cache/entry');

var cacheObj = cache.SingletonCache.getInstance();

/** 
 * For test purpouses, returns the cache
 * @returns {Object}
*/
function currentCache(){
    return cacheObj;
}

/**
 * Sets a value in the cache.
 * Checks if there was an entry with the given key.  If not just add the bytes 
 * amount to memory In other case, clear the cas memory from the last entry.
 * Also substracts the memory old ussage before adding the new one. 
 * @param {Object<Buffer>} data Data to store in the cache
 * @param {string} key Key value to represent stored data, up to 250 characters
 * @param {number} flags A number between 0 and 65535
 * @param {number} exptime Expiration time;  a unix time stamp or a number in 
 * seconds less than 60*60*24*30(Number of seconds in 30 days)
 * @param {number} bytes Byte size of the data
 * @param {boolean} noreply Represents whether the client needs a response or not
 */
function set(data, key, flags, exptime, bytes, noreply){
    result = {};
    result.state = 0;
    if(!cacheObj.maxMemoryReached()){
        var e = new entry.Entry(key, flags, exptime, bytes, cacheObj.newCas(), data);

        
        var oldEntry = cacheObj.getEntry(key);
        cacheObj.alterEntry(key, e);
        
        if(oldEntry === undefined){
            
            cacheObj.alterMemoryUsage(bytes);
        }
        else{
            cacheObj.clearCas(oldEntry.getCas());
            cacheObj.alterMemoryUsage(-oldEntry.bytes);
            cacheObj.alterMemoryUsage(bytes);
        }
        
        if(!noreply){
            result.message = "STORED\r\n";
        }
    }
    else{
        if(!noreply){
            result.message = "SERVER_ERROR The server doest not have any memory left for this operation";
        }
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
        return notStoredResult(noreply);
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
        return notStoredResult(noreply);
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
        return notStoredResult(noreply);
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
        return notStoredResult(noreply);
    }
    else{
        var oldData    = oldEntry.getData();
        var concatData = Buffer.concat([data, oldData]);
        var sumBytes   = oldEntry.getBytes() + bytes;
        return set(concatData, key, oldEntry.getFlags(), oldEntry.getExptime(), sumBytes, noreply);
    }
}

/**
 * Stores data, but only if the server already hold data for the
 * provided key and the given cas number matches with the currents
 * cas of the entry. The recieved data will replace the previus.
 * @param {Object<Buffer>} data Data to store in the cache
 * @param {string} key Key value to represent stored data, up to 250 characters
 * @param {number} flags A number between 0 and 65535
 * @param {number} exptime Expiration time;  a unix time stamp or a number in 
 * seconds less than 60*60*24*30(Number of seconds in 30 days)
 * @param {number} bytes Byte size of the data
 * @param {number} cas A number that uniquely identifies stored data 
 * @param {boolean} noreply Represents whether the client needs a response or not
 */
function cas(data, key, flags, exptime, bytes, cas, noreply){
    var oldEntry       = cacheObj.getEntry(key);
    result         = {};
    result.state   = 0;
    if(!(oldEntry === undefined)){
        if(oldEntry.getCas() == cas){
            return set(data, key, flags, exptime, bytes, noreply);
        }
        else{
            result.message = "EXISTS\r\n";
            return result;
        }
    }
    else{
        result.message = "NOT_FOUND\r\n";
        return result;
    }
}

/**
 * Returns a standard response for a failed storage operation
 * @returns {Object} The result object.
 */
function notStoredResult(noreply){
    result         = {};
    result.state   = 0;
    if(!noreply){
        result.message = "NOT_STORED\r\n";
    }
    return result;
}

module.exports = {
    set,
    add,
    replace,
    append,
    preppend,
    cas,
    currentCache
}