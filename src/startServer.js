const server = require('./server');
var port          = process.argv[2];
if(!(typeof process.argv[2] === 'undefined')){
    var protocol = process.argv[3];
}
else{
    var protocol = "TCP";
}

server.startServer(port, protocol);