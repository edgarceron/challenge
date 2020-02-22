const server = require('./server');
var address        = process.argv[2];
var port          = process.argv[3];
var memory        = process.argv[4];


server.startServer(port, memory, address);