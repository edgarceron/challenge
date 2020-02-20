var file = require('../server');

test('Verify cache instance at diferrente levels', () => {
    var serverData = file.startServer();
    serverData.server.close();
    serverData.connections.forEach(sockect => {
        sockect.end();
    });
    serverData.server.unref();
    expect(serverData.originalCache).toBe(serverData.handleStorageCache);
});