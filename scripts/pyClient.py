from pymemcache.client import base

# Don't forget to run `memcached' before running this next line:
client = base.Client(('127.0.0.1', 11212))

# Once the client is instantiated, you can access the cache:
client.set('somekey', 'some_value')

# Retrieve previously set data again:
result = client.get('somekey')
print(result)


client.add('OTHER_TEST', 'some value')

result = client.get('OTHER_TEST')
print(result)