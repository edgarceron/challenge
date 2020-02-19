var file = require('../handleData');

test('Failed command no auth', () => {
    expect(file.handleData(Buffer.from("get mykey"), 2).message).toBe(
        "CLIENT_ERROR Client must login before using memcached\r\n"
    );
});

test('Set when no auth', () => {
    expect(file.handleData(Buffer.from("set mauro 0121"), 2).message).toBe(
        ""
    );
});

test('Sending correct username and passwrod after a set instruction', () => {
    expect(file.handleData(Buffer.from("mauro 0121"), 3).message).toBe(
        "STORED\r\n"
    );
});

test('Sending incorrect username and passwrod after a set instruction', () => {
    expect(file.handleData(Buffer.from("mauro 4574"), 3).message).toBe(
        "CLIENT_ERROR Incorrect username and/or password\r\n"
    );
});