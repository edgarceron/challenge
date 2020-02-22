var file = require('./tcpclient');

var address        = process.argv[2];
var port           = process.argv[3];

client = file.startClient(address, port, true);

var mensaje        = process.argv[4];
mensaje = mensaje.replace(/\\r\\n/g, "\r\n");
client.write(mensaje);
client.end();