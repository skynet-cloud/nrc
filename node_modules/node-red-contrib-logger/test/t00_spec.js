//const assert=require('assert');
const Logger=require("../logger.js");
const logger=new Logger("test");
// Mocha Test Case
describe('Mocha Test Case', function() {
    it('send', function(done) {
    	logger.send("a label");
        done();
    });
    it('sendDebug', function(done) {
    	logger.sendDebug("a label",{a:"test"});
//    	const Logger = require(../loggerNode");
//    	const Logger = require("node-red-contrib-logger");
//    	const logger = new Logger("test");
//    	logger.sendInfo("Copyright 2020 Jaroslav Peter Prib");
//        assert.equal(sqrt, 25);
        done();
    });

});