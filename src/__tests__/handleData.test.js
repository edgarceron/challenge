var file = require('../handleData');
var cache = require('../cache/cache');

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
        "CLIENT_ERROR No reply argument has an error. Recieved: some, explected: noreply\r\n"
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

test('Testing set semantics', () => {
    expect(file.handleData(Buffer.from("set mykey 10 3600 20"), {"state":0})).toEqual(
        {"command":"set", "key":"mykey", "missing":false, "state":1, "message":"", "flags":10, "exptime":3600, "bytes":20}
    );
});

test('Testing add semantics', () => {
    expect(file.handleData(Buffer.from("add mykey 10 3600 20"), {"state":0})).toEqual(
        {"command":"add", "key":"mykey", "missing":false, "state":1, "message":"", "flags":10, "exptime":3600, "bytes":20}
    );
});

test('Testing cas semantics', () => {
    expect(file.handleData(Buffer.from("cas mykey 10 3600 20 32567"), {"state":0})).toEqual(
        {"command":"cas", "key":"mykey", "missing":false, "state":1, 
        "message":"", "flags":10, "exptime":3600, "bytes":20, "cas":32567}
    );
});

test('Testing get semantics', () => {
    expect(file.handleData(Buffer.from("get mykey"), {"state":0})).toEqual(
        {"command":"get", "keys":["mykey"], "missing":false, "state":0, "message":"", "multipleMessages":["END\r\n"]}
    );
});

test('Testing gets semantics many keys', () => {
    expect(file.handleData(Buffer.from("gets mykey1 mykey2 mykey3 mykey4"), {"state":0})).toEqual(
        {"command":"gets", "keys":["mykey1", "mykey2", "mykey3", "mykey4"], "missing":false, "state":0, "message":"", "multipleMessages": ["END\r\n"]}
    );
});

test('Testing set command with data', () => {
    var result = file.handleData(Buffer.from("set mykey 10 3600 5"), {"state":0});
    var inputResult = file.handleData(Buffer.from("mykey"), result);
    expect(inputResult.message).toBe("STORED\r\n");
});

test('Testing add command with data', () => {
    var result = file.handleData(Buffer.from("add mykeyadd 10 3600 5"), {"state":0});
    var inputResult = file.handleData(Buffer.from("mykeyadd"), result);
    expect(inputResult.message).toBe("STORED\r\n");
});

test('Testing replace command with data', () => {
    var result = file.handleData(Buffer.from("set mykey 10 3600 5"), {"state":0});
    file.handleData(Buffer.from("mykey"), result);
    var result = file.handleData(Buffer.from("replace mykey 10 3600 6"), {"state":0});
    var inputResult = file.handleData(Buffer.from("youkey"), result);
    expect(inputResult.message).toBe("STORED\r\n");
});

test('Testing append command with data', () => {
    var result = file.handleData(Buffer.from("set mykey 10 3600 5"), {"state":0});
    file.handleData(Buffer.from("mykey"), result);
    var result = file.handleData(Buffer.from("append mykey 10 3600 6"), {"state":0});
    var inputResult = file.handleData(Buffer.from("youkey"), result);
    expect(inputResult.message).toBe("STORED\r\n");
});

test('Testing prepend command with data', () => {
    var result = file.handleData(Buffer.from("set mykey 10 3600 5"), {"state":0});
    file.handleData(Buffer.from("mykey"), result);
    var result = file.handleData(Buffer.from("prepend mykey 10 3600 6"), {"state":0});
    var inputResult = file.handleData(Buffer.from("youkey"), result);
    expect(inputResult.message).toBe("STORED\r\n");
});

test('Testing get command with data', () => {
    var cacheObj = cache.SingletonCache.getInstance();
    var result = file.handleData(Buffer.from("set mykey 10 3600 5"), {"state":0});
    file.handleData(Buffer.from("mykey"), result);
    var result = file.handleData(Buffer.from("get mykey"), {state:0})
    expect(result.multipleMessages).toEqual(
        [
            "VALUE mykey 10 5\r\n",
            Buffer.from("mykey\r\n"),
            "END\r\n"
        ]
    );
});

test('Testing gets command with data', () => {
    var cacheObj = cache.SingletonCache.getInstance();
    var result = file.handleData(Buffer.from("set mykey 10 3600 5"), {"state":0});
    file.handleData(Buffer.from("mykey"), result);
    var result = file.handleData(Buffer.from("gets mykey"), {state:0});
    expect(result.multipleMessages[1]).toEqual(
            Buffer.from("mykey\r\n")
    );
});

test('Testing cas command with data', () => {
    var cacheObj    = cache.SingletonCache.getInstance();
    var result      = file.handleData(Buffer.from("set mykey 10 3600 5"), {"state":0});
    file.handleData(Buffer.from("mykey"), result);
    var value       = file.handleData(Buffer.from("gets mykey"), {state:0}).multipleMessages[0];
    cas             = Number(value.toString().split(" ")[4]);
    result          = file.handleData(Buffer.from("cas mykey 10 3600 5 " + cas), {"state":0});
    var inputResult = file.handleData(Buffer.from("youkey"), result);
    expect(inputResult.message).toBe("STORED\r\n");
});

test('Testing cas command with data and fail', () => {
    var cacheObj    = cache.SingletonCache.getInstance();
    var result      = file.handleData(Buffer.from("set mykey 10 3600 5"), {"state":0});
    result          = file.handleData(Buffer.from("mykey"), result);
    var value       = file.handleData(Buffer.from("gets mykey"), {state:0}).multipleMessages[0];
    cas             = Number(value.toString().split(" ")[4]);
    result          = file.handleData(Buffer.from("set mykey 10 3600 10"), {"state":0});
    result          = file.handleData(Buffer.from("changedata"), result);
    result          = file.handleData(Buffer.from("cas mykey 10 3600 5 " + cas), {"state":0});
    var inputResult = file.handleData(Buffer.from("youkey"), result);
    expect(inputResult.message).toBe("EXISTS\r\n");
});

test("Testing set command missing arguments", () => {
    var result = file.handleData(Buffer.from("set 23"), {"state": 0});
    expect(result.message).toBe("CLIENT_ERROR missing arguments\r\n");
});

test("Testing get command missing arguments", () => {
    var result = file.handleData(Buffer.from("get"), {"state": 0});
    expect(result.message).toBe("CLIENT_ERROR missing arguments\r\n");
});

test("Testing add command too many arguments", () => {
    var result = file.handleData(Buffer.from("add mykey 14 3600 33 noreply 2 2"), {"state": 0});
    expect(result.message).toBe("CLIENT_ERROR Too many arguments at 2 2\r\n");
});

test("Testing replace command wrong flags argument", () => {
    var result = file.handleData(Buffer.from("add mykey flags 3600 33 noreply"), {"state": 0});
    expect(result.message).toBe("CLIENT_ERROR flags(second argument) must be a number between 0 and 65536\r\n");
});

test("Testing append command wrong exptime argument", () => {
    var result = file.handleData(Buffer.from("append mykey 111 exptime 33 noreply"), {"state": 0});
    expect(result.message).toBe("CLIENT_ERROR exptime(third argument) must be a number\r\n");
});

test("Testing preppend command wrong bytes argument", () => {
    var result = file.handleData(Buffer.from("prepend mykey 111 8000 bytes noreply"), {"state": 0});
    expect(result.message).toBe("CLIENT_ERROR bytes(fourth argument) must be a number\r\n");
});

test("Testing cas command wrong cas argument", () => {
    var result = file.handleData(Buffer.from("cas mykey 111 8000 1 cas noreply"), {"state": 0});
    expect(result.message).toBe("CLIENT_ERROR cas(fifth argument) must be a number\r\n");
});

test("Testing flush_data", () => {
    var result = file.handleData(Buffer.from("flush_all 1"), {"state": 0});
    expect(result.key).toBe("1");
});
