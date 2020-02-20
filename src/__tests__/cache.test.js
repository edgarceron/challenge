var cache = require('../cache/cache');
var entry = require('../cache/entry');

test('Same cache instance in two objetcs', () => {
    var cacheA = cache.SingletonCache.getInstance();
    var cacheB = cache.SingletonCache.getInstance();
    expect(cacheA).toBe(cacheB);
});

test('Memory usage count test', () => {
    entry = new entry.Entry("yeah", 23, 3600, 34, 36, Buffer.from("test"));
    var cacheObj = cache.SingletonCache.getInstance();
    cacheObj.alterEntry(entry.key, entry);
    expect(cacheObj.countMemory()).toBe(34);
});

test('Thousand different cas', () => {
    var cacheObj = cache.SingletonCache.getInstance();
    for (let index = 0; index < 1000; index++) {
        cacheObj.newCas();
    }
    casMemory = cacheObj.getCasMemory();
    memorySize = Object.entries(casMemory).length;
    expect(memorySize).toBe(1000);
})