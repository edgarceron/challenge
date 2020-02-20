var file = require('../handleData');

test('Failed command no auth', () => {
    expect(file.handleData(Buffer.from("get mykey"), {"state":2}).message).toBe(
        "CLIENT_ERROR Client must login before using memcached\r\n"
    );
});

test('Set when no auth', () => {
    expect(file.handleData(Buffer.from("set mauro 0121"), {"state":2}).message).toBe(
        ""
    );
});

test('Sending correct username and passwrod after a set instruction', () => {
    expect(file.handleData(Buffer.from("mauro 0121"), {"state":3}).message).toBe(
        "STORED\r\n"
    );
});

test('Sending incorrect username and passwrod after a set instruction', () => {
    expect(file.handleData(Buffer.from("mauro 4574"), {"state":3}).message).toBe(
        "CLIENT_ERROR Incorrect username and/or password\r\n"
    );
});

test('Too many arguments on a storage command other than cas', () => {
    expect(file.getSettedArgsStorage(["23", "14", "15", "66", "noreply", "da"]).tooMany).toBe(
        "da"
    );
});

test('Too many arguments on a cas command', () => {
    expect(file.getSettedArgsStorage(["23", "14", "15", "66", "cas","noreply", "here"], true).tooMany).toBe(
        "here"
    );
});

test('Missing arguments on a storage command', () => {
    expect(file.getSettedArgsStorage(["key"]).missing).toBe(true);
});

test('Missing arguments on a retrieval command', () => {
    expect(file.getSettedArgsRetrieval([]).missing).toBe(true);
});

test('Noreply wrong input', () => {
    expect(file.validateArgs({"missing":false, "noReply":"some"}).message).toBe(
        "CLIENT_ERROR No reply argument has a error. Recieved: some, explected: noreply\r\n"
    );
});

test('Flags wrong input', () => {
    expect(file.validateArgs({"missing":false, "flags":"some"}).message).toBe(
        "CLIENT_ERROR flags(second argument) must be a number between 0 and 65536\r\n"
    );
});

test('Flags negative', () => {
    expect(file.validateArgs({"missing":false, "flags":"-3"}).message).toBe(
        "CLIENT_ERROR flags(second argument) must be a number between 0 and 65536\r\n"
    );
});

test('Flags too big', () => {
    expect(file.validateArgs({"missing":false, "flags":"9999999"}).message).toBe(
        "CLIENT_ERROR flags(second argument) must be a number between 0 and 65536\r\n"
    );
});

test('Exptime wrong input', () => {
    expect(file.validateArgs({"missing":false, "exptime":"value"}).message).toBe(
        "CLIENT_ERROR exptime(third argument) must be a number\r\n"
    );
});

test('Bytes wrong input', () => {
    expect(file.validateArgs({"missing":false, "bytes":"value"}).message).toBe(
        "CLIENT_ERROR bytes(fourth argument) must be a number\r\n"
    );
});

test('Cas wrong input', () => {
    expect(file.validateArgs({"missing":false, "cas":"value"}).message).toBe(
        "CLIENT_ERROR cas(fifth argument) must be a number\r\n"
    );
});

test('Testing set sematics', () => {
    expect(file.handleData(Buffer.from("set mykey 10 3600 20"), {"state":0})).toEqual(
        {"command":"set", "key":"mykey", "missing":false, "state":1, "message":"", "flags":10, "exptime":3600, "bytes":20}
    );
});

test('Testing add sematics', () => {
    expect(file.handleData(Buffer.from("add mykey 10 3600 20"), {"state":0})).toEqual(
        {"command":"add", "key":"mykey", "missing":false, "state":1, "message":"", "flags":10, "exptime":3600, "bytes":20}
    );
});

test('Testing cas sematics', () => {
    expect(file.handleData(Buffer.from("cas mykey 10 3600 20 32567"), {"state":0})).toEqual(
        {"command":"cas", "key":"mykey", "missing":false, "state":1, 
        "message":"", "flags":10, "exptime":3600, "bytes":20, "cas":32567}
    );
});

test('Testing get sematics', () => {
    expect(file.handleData(Buffer.from("get mykey"), {"state":0})).toEqual(
        {"command":"get", "keys":["mykey"], "missing":false, "state":0, "message":""}
    );
});

test('Testing gets sematics many keys', () => {
    expect(file.handleData(Buffer.from("gets mykey1 mykey2 mykey3 mykey4"), {"state":0})).toEqual(
        {"command":"gets", "keys":["mykey1", "mykey2", "mykey3", "mykey4"], "missing":false, "state":0, "message":""}
    );
});

