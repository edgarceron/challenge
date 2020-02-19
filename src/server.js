const handleData = require('./handleData');

/** Starts the memcached server 
 * @param {int} port - Port number, a number between 1 and 65535
 * @param {string} protocol [type=TCP] - Connection type, it may be TCP or UDP 
*/
function startServer(port, protocol="TCP"){
    if(protocol == "TCP"){
        var net = require('net');

        var server = net.createServer(function(socket) {

            /** @member {int} state Represents the transaction state of a connection*/
            var state = 0;

            socket.on('data', function(data) {
                var result = handleData(data, state);
                state = result.state;
                if(result.message != ""){
                    socket.write(message);
                }
            });

            socket.on('close', function(data) {
                console.log('Connection closed');
            });

            socket.write('Echo server\r\n');
        });
    
        server.listen(port, '127.0.0.1');
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



var port          = process.argv[2];
if(!(typeof process.argv[2] === 'undefined')){
    var protocol = process.argv[3];
}
else{
    var protocol = "TCP";
}
startServer(port, protocol);