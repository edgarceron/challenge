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
        this.exptime   = exptime;
        this.bytes     = bytes;
        this.cas       = cas;
        this.data      = data;
    }

    getFlags(){
        return this.flags;
    }

    getExptime(){
        return this.exptime;
    }

    getBytes(){
        return this.bytes;
    }

    getCas(){
        return this.cas;
    }

    getData(){
        return this.data;
    }

    setFlags(flags){
        this.flags = flags;
    }

    setExtime(exptime){
        if(exptime <= (60*60*24*30)){
            this.exptime = Math.floor(new Date() / 1000) + exptime;
        }
        else{
            this.exptime = exptime;
        }
    }

    setBytes(bytes){
        this.bytes = bytes;
    }

    setCas(cas){
        this.cas = cas;
    }

    setData(data){
        this.data = data;
    }

}

module.exports = {
    Entry
};