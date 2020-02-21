const handleData = require('./handleData');
const readConfig = require('./readConfig');
const cache      = require('./cache/cache');
const options    = readConfig.readOptions();
/** Starts the memcached server 
 * @param {number} port - Port number, a number between 1 and 65535
 * @param {number} memory - Ammount of memory use in megabytes
*/
function startServer(port, memory){
    cacheObj = cache.SingletonCache.getInstance();
    cacheObj.setMaxMemory(memory);
    var net = require('net');
    var connections = [];
    var server = net.createServer(function(socket) {
        connections.push(socket);
        /** @member {int} state Represents the transaction state of a connection*/
        var result = {"state":options.requireAuth};

        socket.on('data', function(data) {
            result = handleData(data, result);
            if(result.message != ""){
                socket.write(message);
            }

            if(result.multpleMessages.length > 0){
                result.multpleMessages.forEach(message => {
                    socket.write(message);
                });
            }
        });

        socket.on('close', function(data) {
            console.log('Connection closed');
        });

        socket.write('Echo server\r\n');
    });

    server.listen(port, '127.0.0.1');

    return {
        "originalCache" : cacheObj, 
        "handleStorageCache": handleData.getStorageCache(), 
        "connections":connections, 
        "server":server};
}


module.exports = {
    startServer
}