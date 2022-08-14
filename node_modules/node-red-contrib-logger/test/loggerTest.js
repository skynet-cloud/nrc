const should = require("should");
const helper = require("node-red-node-test-helper")
const loggerNode = require("../loggerNode.js");

//helper.init(require.resolve('node-red'));

helper.init(require.resolve('node-red'), { 
    functionGlobalContext: { os:require('os') }
});

console.log("helper "+Object.keys(helper));

describe('Logger Node', function () {

	 afterEach(function () {
		 helper.unload();
	 });

	 var logEvents = helper.log().args.filter(function(evt) {
		 console.log("loags "+evt[0].type)
		 return evt[0].type == "batch";	
	 });
	 
	  it('should be loaded', function (done) {
		    const flow = [{ id: "n1", type: "Logger", name: "test name" ,count: 19}];
		    helper.load(loggerNode, flow, function () {
//	        const n1 = helper.getNode("n1");
//	        n1.should.have.property('name', 'test name');
//	        n1.should.have.property('count', 19);
//	        n1.should.have.property('sendOutputLog', false);
	        done();
	      });
	  });

	  it('should log payload ', function (done) {
		    const flow = [
		    	{ id: "n1", type: "helper" },
		    	{ id: "n2", type: "helper" },
		    	{ id: "n3", type: "Logger", name: "test name",wires:[["n1"]] }
		    ];
/*		    helper.load(loggerNode, flow, function () {
		        const n1 = helper.getNode("n1");
		        const n2 = helper.getNode("n2");
		        const n3 = helper.getNode("n3");
		        n3.on("input", function (msg) {
		          msg.should.have.property('payload', 'testmsg');
		          done();
		        });
		        n2.on("input", function (msg) {
		            msg.should.have.property('payload', 'testmsg');
		            done();
		        });
		        n1.receive({ payload: "testmsg" });
		    });
*/
		    done();
	  });
});