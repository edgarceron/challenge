/**
 * Class representing a cache entry
 * @param {}
 */

class Entry{
    /**
     * 
     * @param {string} key The key for the entry, up to 250 characters  
     * @param {number} flags A number between 0 and 65535
     * @param {number} exptime Expiration time in unix time stamp
     * @param {number} bytes Byte size of the data
     * @param {number} cas  64-bit integer unique for this entry 
     * @param {Object<Buffer>} data Data asociated for this entry
     */
    constructor(key, flags, exptime, bytes, cas, data){
        this.key       = key;
        this.flags     = flags;
        this.exptime   = 0;
        this.setExptime(exptime);
        this.bytes     = bytes;
        this.cas       = cas;
        this.data      = data;
    }

    /**
     * @returns {string} The key for the entry
     */
    getKey(){
        return this.key;
    }

    /**
     * @returns {number} The flags for the entry
     */
    getFlags(){
        return this.flags;
    }

    /**
     * @returns {number} The exptime for the entry
     */
    getExptime(){
        return this.exptime;
    }

    /**
     * @returns {number} The byte length for the entry
     */
    getBytes(){
        return this.bytes;
    }

    /**
     * @returns {number} The unique cas for the entry
     */
    getCas(){
        return this.cas;
    }
    
    /**
     * @returns {Buffer} The data for the entry
     */
    getData(){
        return this.data;
    }

    /**
     * Checks if the given exptime is a unix timestamp.If it's not, 
     * creates a new timestamp adding the given exptime
     * @param {number} exptime a number representing the exptime
     * @returns {number} The new exptime
     */
    setExptime(exptime){
        if(exptime <= (60*60*24*30)){
            this.exptime = Math.floor(new Date() / 1000) + exptime;
        }
        else{
            this.exptime = exptime;
        }
    }

}

module.exports = {
    Entry
};