var storageCommands = require('../commands/storage');
var retrievalCommands = require('../commands/retrieval');
var cache = require('../cache/cache');

test("set command new entry", () => {
    var result = storageCommands.set(Buffer.from("test"), "test", 123, 3600, 4, false);
    expect(result.message).toBe("STORED\r\n");
});

test("set command replace old entry memory check", () => {
    var cacheObj = cache.SingletonCache.getInstance();
    storageCommands.set(Buffer.from("test"), "test", 123, 3600, 4, false);
    storageCommands.set(Buffer.from("longertest"), "test", 123, 3600, 10, false);
    expect(cacheObj.getMemoryUsage()).toBe(10);
});

test("add command fails because another key", () => {
    var cacheObj = cache.SingletonCache.getInstance();
    storageCommands.set(Buffer.from("testadd"), "testadd", 123, 3600, 4, false);
    result = storageCommands.add(Buffer.from("longertestadd"), "testadd", 123, 3600, 10, false);
    expect(result.message).toBe("NOT_STORED\r\n");
});

test("add command success", () => {
    result = storageCommands.add(Buffer.from("newest"), "newest", 123, 3600, 10, false);
    expect(result.message).toBe("STORED\r\n");
});

test("Replace command fails because the key is not in cache", () => {
    var cacheObj = cache.SingletonCache.getInstance();
    result = storageCommands.replace(Buffer.from("inexistentKey"), "inexistentKey", 123, 3600, 10, false);
    expect(result.message).toBe("NOT_STORED\r\n");
});

test("Replace command success", () => {
    var cacheObj = cache.SingletonCache.getInstance();
    storageCommands.set(Buffer.from("test"), "test", 123, 3600, 4, false);
    result = storageCommands.replace(Buffer.from("longertest"), "test", 123, 3600, 10, false);
    expect(result.message).toBe("STORED\r\n");
});

test("Append command fails because the key is not in cache", () => {
    var cacheObj = cache.SingletonCache.getInstance();
    result = storageCommands.append(Buffer.from("inexistentKey"), "inexistentKey", 123, 3600, 10, false);
    expect(result.message).toBe("NOT_STORED\r\n");
});

test("Append command success", () => {
    var cacheObj = cache.SingletonCache.getInstance();
    storageCommands.set(Buffer.from("test"), "test", 123, 3600, 4, false);
    storageCommands.append(Buffer.from("longertest"), "test", 123, 3600, 10, false);
    result = retrievalCommands.get("test");
    expect(result.multipleMessages[1]).toEqual(Buffer.from("testlongertest\r\n"));
});

test("Prepend command fails because the key is not in cache", () => {
    var cacheObj = cache.SingletonCache.getInstance();
    result = storageCommands.preppend(Buffer.from("inexistentKey"), "inexistentKey", 123, 3600, 10, false);
    expect(result.message).toBe("NOT_STORED\r\n");
});

test("Prepend command success", () => {
    var cacheObj = cache.SingletonCache.getInstance();
    storageCommands.set(Buffer.from("test"), "test", 123, 3600, 4, false);
    storageCommands.preppend(Buffer.from("longertest"), "test", 123, 3600, 10, false);
    result = retrievalCommands.get("test");
    expect(result.multipleMessages[1]).toEqual(Buffer.from("longertesttest\r\n"));
});

test("Cas operation fails because of update key", () => {
    var cacheObj = cache.SingletonCache.getInstance();
    storageCommands.set(Buffer.from("test"), "test", 123, 3600, 4, false);
    result       = retrievalCommands.gets("test").multipleMessages[0];
    cas          = Number(result.toString().split(" ")[4]);
    storageCommands.set(Buffer.from("modifiedtest"), "test", 123, 3600, 12, false);
    expect(storageCommands.cas(Buffer.from("cas"), "test", 234, 7200, 3, cas, false).message).toBe("EXISTS\r\n");
});

test("Cas operation fails because of a non-existent key", () => {
    expect(storageCommands.cas(Buffer.from("cas"), "testcasnonexistent", 234, 7200, 3, 3421, false).message).toBe("NOT_FOUND\r\n");
});

test("Cas operation success", () => {
    var cacheObj = cache.SingletonCache.getInstance();
    storageCommands.set(Buffer.from("test"), "test", 123, 3600, 4, false);
    result       = retrievalCommands.gets("test").multipleMessages[0];
    cas          = Number(result.toString().split(" ")[4]);
    expect(storageCommands.cas(Buffer.from("cas"), "test", 234, 7200, 3, cas, false).message).toBe("STORED\r\n");
});