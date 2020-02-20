const cache = require('../cache/cache');
const entry = require('../cache/entry');

var cacheObj = cache.SingletonCache.getInstance();
/**
 * Sets a value in the cache.
 * @param {Object<Buffer>} data 
 * @param {string} key 
 * @param {number} flags 
 * @param {number} exptime 
 * @param {number} bytes 
 * @param {boolean} noreply 
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

function add(data, key, flags, exptime, bytes, noreply){
    var oldEntry = cacheObj.getEntry(key);
    if(oldEntry === undefined){
        return set(data, key, flags, exptime, bytes, noreply);
    }
    else{
        return notStoredResult();
    }
}

function replace(data, key, flags, exptime, bytes, noreply){
    var oldEntry = cacheObj.getEntry(key);
    if(oldEntry === undefined){
        return notStoredResult();
    }
    else{
        return set(data, key, flags, exptime, bytes, noreply);
    }
}

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