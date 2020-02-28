var server = require('../server');
var client = require('../../scripts/tcpclient');


test('Verify cache instance at diferrente levels', () => {
    var serverData = server.startServer(11211, 100, '127.0.0.1');
    serverData.server.close();
    serverData.connections.forEach(sockect => {
        sockect.end();
    });
    serverData.server.unref();
    expect(serverData.originalCache).toBe(serverData.handleStorageCache);
});

test('Verify set command from client', () => {
    var log = "";
    const spawn = require('child_process').spawn;
    const util = require('util');
    const exec = util.promisify(require('child_process').exec);

    async function callCommand() {
        const { stdout, stderr } = await exec('node C:\\Users\\Mauricio\\Documents\\NodeProjects\\challenge\\scripts\\runclient.js "127.0.0.1" "11214" "set mykey 21 3600 5\\r\\nmykey"');
        return stdout;
    }
    
    var serverchild = spawn("node",['C:\\Users\\Mauricio\\Documents\\NodeProjects\\challenge\\src\\startServer.js', '127.0.0.1', '11214', '100'], {detached: true});
    callCommand().then(log => {
        expect(log.trim()).toBe("STORED");
    });

});

test('Verify get command from client', () => {
    var log = "";
    const spawn = require('child_process').spawn;
    const util = require('util');
    const exec = util.promisify(require('child_process').exec);

    async function callCommand(command) {
        const { stdout, stderr } = await exec(command);
        return stdout;
    }
    
    spawn("node",['C:\\Users\\Mauricio\\Documents\\NodeProjects\\challenge\\src\\startServer.js', '127.0.0.1', '11214', '100'], {detached: true});
    callCommand('node C:\\Users\\Mauricio\\Documents\\NodeProjects\\challenge\\scripts\\runclient.js "127.0.0.1" "11214" "set mykey 21 3600 5\\r\\nmykey"').then(log => {
        callCommand('node C:\\Users\\Mauricio\\Documents\\NodeProjects\\challenge\\scripts\\runclient.js "127.0.0.1" "11214" "get mykey"').then(log => {
            var results = log.trim().split("\r\n");
            var value   = results[0].trim();
            var key     = results[1].trim();    
            expect([value, key]).toEqual(["VALUE mykey 21 5", "mykey"]);
        });
    });

});

test('Verify failing cas command from client', () => {
    var log = "";
    const spawn = require('child_process').spawn;
    const util = require('util');
    const exec = util.promisify(require('child_process').exec);

    async function callCommand(command) {
        const { stdout, stderr } = await exec(command);
        return stdout;
    }
    
    spawn("node",['C:\\Users\\Mauricio\\Documents\\NodeProjects\\challenge\\src\\startServer.js', '127.0.0.1', '11215', '100'], {detached: true});
    
    callCommand(
        'node C:\\Users\\Mauricio\\Documents\\NodeProjects\\challenge\\scripts\\runclient.js'
        + ' "127.0.0.1" "11215" "set castest 0 3600 7 noreply\\r\\ncastest\\r\\ngets castest"'
    ).then(log => {
        var results = log.trim().split("\r\n");
        var value   = results[0].trim();
        var key     = results[1].trim();    
        var cas = value.trim().split(" ")[4].trim();
        
        callCommand(
            'node C:\\Users\\Mauricio\\Documents\\NodeProjects\\challenge\\scripts\\runclient.js'
            + ' "127.0.0.1" "11215" "replace castest 0 3600 13 noreply\\r\\ncastestchange\\r\\n' 
            + 'cas castest 0 3600 8' + cas + '\\r\\ndata\\r\\n"'
        ).then(log1 => {
            expect(log1.trim()).toBe("EXISTS");
        })  
    });
});


test('expurge expired keys', () => {
    const util = require('util');
    const exec = util.promisify(require('child_process').exec);
    const spawn = require('child_process').spawn;

    async function callCommand(command) {
        const { stdout, stderr } = await exec(command);
        return [stdout, stderr];
    }

    

    spawn("node",['C:\\Users\\Mauricio\\Documents\\NodeProjects\\challenge\\src\\startServer.js', '127.0.0.1', '11216', '100'], {detached: true});

    var com = 'node C:\\Users\\Mauricio\\Documents\\NodeProjects\\challenge\\scripts\\runclient.js'
        + ' "127.0.0.1" "11216" "set expired 0 -1 7 noreply\\r\\nexpired\\r\\n'
        + 'set notexpired 0 3600 10 noreply\\r\\nnotexpired\\r\\nflush_all 0\\r\\n'
        + 'get expired\\r\\n"';
    callCommand(
        com
    ).then(logs =>{
        var result = logs[0].trim();   
        expect(result).toEqual("END");
    });
});

test('expurge expired does not delete not expired keys', () => {
    const util = require('util');
    const exec = util.promisify(require('child_process').exec);
    const spawn = require('child_process').spawn;

    async function callCommand(command) {
        const { stdout, stderr } = await exec(command);
        return [stdout, stderr];
    }

    spawn("node",['C:\\Users\\Mauricio\\Documents\\NodeProjects\\challenge\\src\\startServer.js', '127.0.0.1', '11218', '100'], {detached: true});


    /**
     * node C:\Users\Mauricio\Documents\NodeProjects\challenge\scripts\runclient.js "127.0.0.1" "11217" "set expired 0 -1 7 noreply\r\nexpired\r\nset notexpired 0 3600 10 noreply\r\nnotexpired\r\nflush_all 0\r\nget notexpired\r\n"
     */
    var com = 'node C:\\Users\\Mauricio\\Documents\\NodeProjects\\challenge\\scripts\\runclient.js'
        + ' "127.0.0.1" "11218" "set expired 0 -1 7 noreply\\r\\nexpired\\r\\n'
        + 'set notexpired 0 3600 10 noreply\\r\\nnotexpired\\r\\nflush_all 0\\r\\n'
        + 'get notexpired\\r\\n"';
    callCommand(
        com
    ).then(logs =>{
        var results = logs[0].trim().split("\r\n");
        var value   = results[0].trim();
        var key     = results[1].trim();    
        expect([value, key]).toEqual(["VALUE notexpired 0 10", "notexpired"]);
    });
});



test('expurge all keys', () => {
    const util = require('util');
    const exec = util.promisify(require('child_process').exec);
    const spawn = require('child_process').spawn;

    async function callCommand(command) {
        const { stdout, stderr } = await exec(command);
        return [stdout, stderr];
    }

    spawn("node",['C:\\Users\\Mauricio\\Documents\\NodeProjects\\challenge\\src\\startServer.js', '127.0.0.1', '11219', '100'], {detached: true});

    var com = 'node C:\\Users\\Mauricio\\Documents\\NodeProjects\\challenge\\scripts\\runclient.js'
        + ' "127.0.0.1" "11219" "set expired 0 -1 7 noreply\\r\\nexpired\\r\\n'
        + 'set notexpired 0 3600 10 noreply\\r\\nnotexpired\\r\\nflush_all 1\\r\\n'
        + 'get notexpired\\r\\n"';
    callCommand(
        com
    ).then(logs =>{
        var result = logs[0].trim();   
        expect(result).toEqual("END");
    });
});