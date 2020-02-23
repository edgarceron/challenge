var entry = require('./entry');
class Cache{
    /**
     * 
     * @param {Object} entries An object containing pairs key:entry 
     * representing data in the cache.
     */
    constructor(entries = []){
        this.entries = entries;
        this.memoryUsage = this.countMemory();
        this.casMemory = {}
        this.maxMemory = 0;
    }

    /**
     * Counts the total memory usage of the cache
     * @returns {number} The bytes count of the objects saved
     */
    countMemory(){
        var entryList = Object.entries(this.entries);
        var acu = 0;
        entryList.forEach(pair => {
            entry = pair[1];
            acu += entry.getBytes();
        });
        return acu;
    }

    /**
     * Expurge all the expried keys in the cache checking the
     * exptime for each one againts the current tiem. 
     */
    expurgeExpiredKeys(){
        var entryList = Object.entries(this.entries);
        var acu = 0;
        entryList.forEach(pair => {
            key   = pair[0];
            entry = pair[1];
            if(entry.getExptime() < new Date()){
                this.clearCas(entry.getCas());
                delete this.entries.key;
            }
        });
    }
    
    /**
     * @returns {number} Memory usage of the cache
     */
    getMemoryUsage(){
        return this.memoryUsage;
    }
    
    /**
     * Alters the memory usage
     * @param {number} value A positive value will increase the usage, 
     * a negative one will decrease it
     */
    alterMemoryUsage(value){
        this.memoryUsage += value;
    }

    /**
     * Puts the given entry on the given key of the cache
     * @param {string} key 
     * @param {Buffer} entry 
     */
    alterEntry(key, entry){
        this.entries[key] = entry;
    }

    /**
     * Returns the entry for the given key
     * @param {string} key 
     */
    getEntry(key){
        return this.entries[key];
    }
    
    /**
     * Calculate a new cas number
     * @returns {number} Aleatory number ot use it in a cas identifier
     */
    newCas(){
        var cas = 0;
        var found = false;
        do{
            cas = Math.floor(Number.MAX_SAFE_INTEGER * Math.random());
            if(this.casMemory[cas] === undefined){
                this.casMemory[cas] = true;
                found = true;
            }
        }while(!found);
        return cas;
    }

    /**
     * Clear a cas from the cas memory
     * @param {number} cas 
     */
    clearCas(cas){
        delete this.casMemory[cas];
        return true;
    }

    /**
     * For test only use
     * @returns The cas memory of the cache
     */
    getCasMemory(){
        return this.casMemory;
    }
    
    /**
     * Set the max memory for this cache, 0 for unlimited memory
     * @param {number} memory Amount of memory in megabytes
     */
    setMaxMemory(memory){
        this.maxMemory = memory * 1024;
    }

    maxMemoryReached(){
        if(this.maxMemory != 0 && this.memoryUsage > this.maxMemory){
            return true;
        }
        return false;
    }
}

var SingletonCache = (function () {
    var instance;
 
    function createInstance() {
        var object = new Cache;
        return object;
    }
 
    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();

module.exports = {
    SingletonCache
};