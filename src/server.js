const handleData = require('./handleData');
const readConfig = require('./readConfig');
const cache      = require('./cache/cache');
const options    = readConfig.readOptions();
/** Starts the memcached server 
 * @param {number} port Port number, a number between 1 and 65535
 * @param {number} memory Ammount of memory use in megabytes
 * @param {string} address Represents the address in which the server
 * is going to listen. 
*/
function startServer(port, memory, address, noLogs = false){
    var cacheObj = cache.SingletonCache.getInstance();
    cacheObj.setMaxMemory(memory);
    var net = require('net');
    var connections = [];
    var server = net.createServer(function(socket) {
        connections.push(socket);
        /** @member {int} state Represents the transaction state of a connection*/
        var result = {"state":options.requireAuth};
        var calculating = false;
        socket.on('data', function(data) {
            var chk = data.toString();
            var messages = chk.split("\r\n");
            messages.forEach(message => {
                console.log(message);
                do{
                    if(message != ""){
                        console.log(calculating);
                        if(!calculating){
                            calculating = true;
                            result = handleData.handleData(message, result);  
                            calculating = false; 
                        }
                    }
                }while(calculating);
            });
            
            console.log(result);

            if(result.message !== undefined && result.message != ""){
                socket.write(result.message);
            }
            if(result.multipleMessages !== undefined){
                if(result.multipleMessages.length > 0){
                    result.multipleMessages.forEach(message => {
                        socket.write(message);
                    });
                }
            }
        });

        socket.on('close', function(data) {
            if(!noLogs) console.log('Connection closed');
        });

        socket.on('error', function (err) {
            if(!noLogs) console.log('An error happened in connection' + err.stack);
        });

    });

    server.on('error', function(err){
        if(!noLogs) console.log('An error happened in server' + err.stack);
    });

    server.listen(port, address);

    return {
        "originalCache" : cacheObj, 
        "handleStorageCache": handleData.getStorageCache(), 
        "connections":connections, 
        "server":server};
}


module.exports = {
    startServer
}