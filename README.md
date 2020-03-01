# challenge
This repository contains the work for the coding challenge of mooveit.

### Installing
It is as easy as make a git clone and a npm install to use this memcached server and get [Jest](https://jestjs.io/) which is the testing framework choosed for this challenge.

```
git clone https://github.com/edgarceron/challenge
npm install
```

### How to start the server 
You should first call the file startServer.js from node and you'll be running a server instance. You must give 3 arguments: The address in which the server will be listening, the port number, and the amount of memory the server will be using(in megabytes). For example, a server running on 127.0.0.1 at the port 11211 with 1GB of memory will be called like this: 

```
node /src/startServer.js 127.0.0.1 11211 1024
```

### How to run a client example
In the scripts forlder contains a file named runClient.js that could be used to test te implemented commands. To run a command you could run the file as the next example shows:
```
node /scripts/runClient.js 127.0.0.1 11211 "Command"
```
Note that the command must be between quotation marks("). This is because the terminal will take the command as various arguments if them are not used. 

Storage commands like set must sent two lines to the server (One fot the command and one for the data). In this case you should separe it using \r\n:

```
node /scripts/runClient.js 127.0.0.1 11211 "set mykey 0 3600 5\r\nmykey"
```

As you could expect this notation works for sending multiple commands in one run. 

```
node /scripts/runClient.js 127.0.0.1 11211 "set mykey 0 3600 5\r\nmykey\r\nget mykey"
```

Any output will be displayed in the command terminal you're using. 

However this memcached server was also tested with a python implementation of memcached client, so in theory any other memcached client could make use of it. 

### Running tests
From terminal you should reach the src folder. Then a typical npm run test should work as long as you have already installed the dependencies. A JMeter Load test calle "Load test.jmx" is in the root directory.

```
cd src
npm run test
```

### Docs
An auto-generated documentation using jsdoc could be displayed in your browser just by running the index.html found in the docs folder.