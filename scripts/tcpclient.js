const net = require('net');

/**
 * Creates a TCP client to the specified server on the
 * given port.
 * @param {string} server 
 * @param {number} port 
 */
function startClient(server, port, noLogs = false){
	var client = new net.Socket();
	client.log = "";
	client.connect(port, server, function() {
		if(!noLogs) console.log('Connected');
	});

	client.on('data', function(data) {
		console.log(data.toString());
		client.log += data.toString();
		//client.destroy(); // kill client after server's response
	});

	client.on('close', function() {
		if(!noLogs) console.log('Connection closed');
	});

	client.on('error', function (err) {
		if(!noLogs) console.log('An error happened in connection' + err.stack);
	});

	client.on('end', function () {
		if(!noLogs) console.log('The server finished the conection');
	});

	client.on('timeout', function () {
		if(!noLogs) console.log('Socket did timeout');
		client.end();
	});

	return client;
}


module.exports = {
	startClient
}

