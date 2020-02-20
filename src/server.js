const handleData = require('./handleData');
const readConfig = require('./readConfig');
const cache      = require('./cache/cache');
const options    = readConfig.readOptions();
/** Starts the memcached server 
 * @param {number} port - Port number, a number between 1 and 65535
 * @param {string} protocol [type=TCP] - Connection type, it may be TCP or UDP 
*/
function startServer(port, protocol="TCP"){
    cacheObj = cache.SingletonCache.getInstance();
    if(protocol == "TCP"){
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

    else if(protocol == "UDP"){
        var udp = require('dgram');

        var server = udp.createSocket('udp4');
        // emits when any error occurs
        server.on('error',function(error){
            console.log('Error: ' + error);
            server.close();
        });

        // emits on new datagram msg
        server.on('message',function(msg,info){
            console.log('Data received from client : ' + msg.toString());
            console.log('Received %d bytes from %s:%d\n',msg.length, info.address, info.port);
          
          //sending msg
            server.send(msg,info.port,'localhost',function(error){
                if(error){
                client.close();
                }else{
                console.log('Data sent !!!');
                }
            });    
        });

        //emits when socket is ready and listening for datagram msgs
        server.on('listening',function(){
            var address = server.address();
            var port = address.port;
            var family = address.family;
            var ipaddr = address.address;
            console.log('Server is listening at port' + port);
            console.log('Server ip :' + ipaddr);
            console.log('Server is IP4/IP6 : ' + family);
        });
        
        //emits after the socket is closed using socket.close();
        server.on('close',function(){
            console.log('Socket is closed !');
        });
        
        server.bind(port);
        
        setTimeout(function(){
        server.close();
        },80000);
    }
}


module.exports = {
    startServer
}