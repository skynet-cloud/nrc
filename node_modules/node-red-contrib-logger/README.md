# [node-red-contrib-logger][2]

[Node Red][1] node for logging and debugging that dynamically turns off after reporting a set number of points.

* logger

The code can be used in developed nodes for loggings. Benefit it can be used to sample important detail in case of issues.  Tracing could be dynamically turned on by special topic messages. 


	const Logger = require("logger");
	const logger = new Logger("identifier");


The following inserted where required to log

	if(logger.active) logger.send({label:"a label" ,data:data});
	if(logger.active) logger.send("a message");
	logger.sendInfo("Copyright 2020 Jaroslav Peter Prib");

Use of active is to avoid overhead of function call and parameter preparation when logging is not in effect. It changes state by default after 100 "send" are issued

Alternatively can create by
	
	const logger = new Logger({name:"identifier",count:10,active:true,label:"debug"});

Property "node" can be used to place status on node.
"count" is number of sends processed before active set off. Default is 100
"active" is initial state, default being true.
"label" is set according to standard being info,warn,error,debug,trace.  Default is debug,

Follow calls available: 

	logger.setOff();	//turn off logging
	logger.setOn();		//turn on logging for next x points
	logger.setOn(22);		//turn on logging for next 22 points
	logger.sendInfo("a message"); 		//always send info message 
	logger.sendWarn("a message"); 		//always send warn message 
	logger.sendError("a message"); 		//always send error message 
	logger.sendDebug("a message",{a:a}); 		//always send error message 
	logger.objectDump(anObject); // dump an object
	logger.stackDump(); // dump stack trace
	logger.sendErrorAndDump("a message",anObject); //always sendError+objectDump+stackDump
	logger.sendErrorAndStackDump("a message"); //sendError+stackDump

------------------------------------------------------------

## logger

Defines a node that will log messages, send to a second port and/or send to debug console for a set number of messages. 

![logger](documentation/logger.JPG "logger")

------------------------------------------------------------

# Install

Run the following command in the root directory of your Node-RED install or via GUI install

    npm install node-red-contrib-logger


------------------------------------------------------------

# Version

0.0.6 Add parameter value to send json data to debug console and handle circular references

0.0.5 Add parameter value to send json data to display

0.0.4 Fixes bug and add warn/error alias

0.0.3 Fixes on dump and stack

0.0.2 add more functions

0.0.1 base

# Author

[Peter Prib][3]

[1]: http://nodered.org "node-red home page"

[2]: https://www.npmjs.com/package/node-red-contrib-logger "source code"

[3]: https://github.com/peterprib "base github"

![.github/workflows/nodejs.yml](https://github.com/peterprib/node-red-contrib-logger/workflows/.github/workflows/nodejs.yml/badge.svg?event=release)