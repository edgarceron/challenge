var retrievalCommands = require('../commands/retrieval');
var cache = require('../cache/cache');
var entry = require('../cache/entry');

test("Get with no data found", () => {
    expect(retrievalCommands.get("nonExistent").message).toBe("");
});

test("Get with data found", () => {
    var cacheObj = cache.SingletonCache.getInstance();
    var entryTest = new entry.Entry("yeah", 23, 3600, 34, 36, Buffer.from("test"));
    cacheObj.alterEntry(entryTest.key, entryTest);
    expect(retrievalCommands.get("yeah").multipleMessages).toEqual(
        [
            "VALUE yeah 23 34\r\n",
            Buffer.from("test\r\n")
        ]
    );
});

test("Gets with data found", () => {
    var cacheObj = cache.SingletonCache.getInstance();
    var entryTest = new entry.Entry("yeah", 23, 3600, 34, 36, Buffer.from("test"));
    cacheObj.alterEntry(entryTest.key, entryTest);
    expect(retrievalCommands.gets("yeah").multipleMessages).toEqual(
        [
            "VALUE yeah 23 34 36\r\n",
            Buffer.from("test\r\n")
        ]
    );
});
