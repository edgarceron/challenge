const handleData = require('./handleData');
const readConfig = require('./readConfig');
const cache      = require('./cache/cache');
const options    = readConfig.readOptions();
/** Starts the memcached server 
 * @param {number} port Port number, a number between 1 and 65535
 * @param {number} memory Ammount of memory use in megabytes
 * @param {string} address Represents the address in which the server
 * is going to listen. 
 * @param {boolean} noLogs Whether if show logs or not. 
*/
function startServer(port, memory, address, noLogs = false){
    var cacheObj = cache.SingletonCache.getInstance();
    cacheObj.setMaxMemory(memory);
    var net = require('net');
    var connections = [];
    var server = net.createServer(function(socket) {
        connections.push(socket);
        /** @member {Object} result Represents the transaction state of a connection*/
        var result = {"state":options.requireAuth};
        var calculating = false;
        socket.on('data', 
            /**
             * Recieves the data from a sockect connection to te server.
             * The data is managed through a data handler which checks
             * the data inputed from a client. If an answer is given by
             * the handler it'll be write as a response to the client 
             * socket
             * @param {Object<Buffer>} data 
             */
            function(data) {
                var chk = data.toString();
                var messages = chk.split("\r\n");
                messages.forEach(message => {
                    if(!noLogs) console.log(message);
                    do{
                        if(message != ""){
                            if(!calculating){
                                calculating = true;
                                result = handleData.handleData(message, result);  
                                calculating = false; 
                            }
                            if(!noLogs) console.log(result);
                            if(result.command == "flush_all"){
                                cacheObj.expurgeExpiredKeys(result.key);
                            }
                        }
                    }while(calculating);
                });
                
                answer(socket, result);
            }
        );

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

/**
 * Writes data into the sockect if there are messages in the
 * result object
 * @param {Object<Socket>} socket 
 * @param {Object} result 
 */
function answer(socket, result){
    if(result.message !== undefined && result.message != ""){
        socket.write(result.message);
    }
    if(result.multipleMessages !== undefined){
        if(result.multipleMessages.length > 0){
            var send = "";
            result.multipleMessages.forEach(message => {
                send = send + message;
            });
            socket.write(send);
        }
    }
}

module.exports = {
    startServer
}