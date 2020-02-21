
var net = require('net');

var port          = process.argv[2];

var client = new net.Socket();
client.connect(port, '127.0.0.1', function() {
	console.log('Connected');
	client.write("Buffer.from([1, 2])");
});

client.on('data', function(data) {
	console.log('Received: ' + data);
	//client.destroy(); // kill client after server's response
});

client.on('close', function() {
	console.log('Connection closed');
});