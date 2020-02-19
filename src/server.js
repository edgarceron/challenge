/** Starts the memcached server 
 * @param {int} port - Port number, a number between 1 and 65535
 * @return {object} The server object 
*/
function startServer(port){
    var net = require('net');

    var server = net.createServer(function(socket) {
        socket.write('Echo server\r\n');
        socket.pipe(socket);
    });
 
    server.listen(port, '127.0.0.1');
}

startServer(11212);