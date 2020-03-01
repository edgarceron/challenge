var cache = require('../cache/cache');
var entry = require('../cache/entry');

test('Same cache instance in two objetcs', () => {
    var cacheA = cache.SingletonCache.getInstance();
    var cacheB = cache.SingletonCache.getInstance();
    expect(cacheA).toBe(cacheB);
});

test('Memory usage count test', () => {
    var entryTest = new entry.Entry("yeah", 23, 3600, 34, 36, Buffer.from("test"));
    var cacheObj = cache.SingletonCache.getInstance();
    cacheObj.alterEntry(entryTest.key, entryTest);
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
});

test('Clear non-existent cas', () => {
    var cacheObj = cache.SingletonCache.getInstance();
    expect(cacheObj.clearCas(0)).toBe(true);
});

test('Max memory used', () => {
    var cacheObj = cache.SingletonCache.getInstance();
    cacheObj.alterMemoryUsage(15);
    cacheObj.setMaxMemory(0.01);

    expect(cacheObj.maxMemoryReached()).toBe(true);
})