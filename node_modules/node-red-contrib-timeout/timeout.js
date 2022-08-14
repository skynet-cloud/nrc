module.exports = function(RED) {
	"use strict";

function isString (obj) {
  return (Object.prototype.toString.call(obj) === '[object String]');
}	
 
	function TimeoutNode(n) {

	var already_stopped=0;
	var timeout=30;
  var startup=0;
	var timedown=30;
	var changed=-1;
	
		RED.nodes.createNode(this, n);
		var node = this;
		node.timer=n.timer;
		node.warn=n.warning;
		node.topic=n.outtopic;
		node.outsafe=n.outsafe;
		node.outwarn=n.outwarning;
		node.outunsafe=n.outunsafe;
		node.repeat=n.repeat;
		node.again=n.again;
		var outmsg = {
					payload: "",
					topic: "",
					countdown: 0
				};
   
		if (node.timer!=0) { timeout=parseInt(node.timer); timedown=parseInt(node.timer); } 
		node
				.on(
						"input",
						function(inmsg) {
							outmsg.topic=node.topic;
							node.countdown=timedown;
							outmsg.payload=node.payload;
							outmsg.countdown=node.countdown;
							if (inmsg.payload!="TIMINGXX") { timedown=timeout; node.countdown=timedown; outmsg.countdown=node.countdown; }                                      

              if (isString(inmsg.payload)) if (inmsg.payload.toLowerCase()=="unsafe") { timedown=0; node.countdown=0; }
               
							if (timedown==0)
							{
								node.status({
									fill : "red",
									shape : "dot",
									text : "Timeout!",
								});
								node.payload=node.outunsafe; 
								outmsg.payload=node.payload;
								outmsg.countdown=node.countdown;
								if ((changed!=1)||(node.repeat)) { 
																changed=1; if (already_stopped===0) node.send(outmsg); already_stopped=1; 
																}
								if (node.again) { timedown=timeout; changed=-1; }

							}
							else 
							{
								already_stopped=0;
								if ((timedown<=node.warn) && (node.outwarn!=""))
								{
									node.status({
										fill : "yellow",
										shape : "dot",
										text : "Warning: " + timedown,
									});
									timedown--;
									node.payload=node.outwarn;
									outmsg.payload=node.payload;
									outmsg.countdown=node.countdown;
									if ((changed!=2)||(node.repeat)) { changed=2; node.send(outmsg); }
								}						
								else
								{
									node.status({
										fill : "green",
										shape : "dot",
										text : "Remaining: " + timedown + " seconds",
									});
								timedown--;
								node.payload=node.outsafe;
								outmsg.payload=node.payload;
								outmsg.countdown=node.countdown;
                
                if ((startup===0) && (outmsg.payload!="")) node.send(outmsg);                                       
                                                      
								if ( ((changed!==0)||(node.repeat)) && (node.outsafe!="")) 
									{ changed=0; if (startup) node.send(outmsg); startup=1; }
								}	
							}
					});

		var tick = setInterval(function() {
			var msg = { payload:'TIMINGXX', topic:""};
			node.emit("input", msg);
		}, 1000); // trigger every 1 sec

		node.on("close", function() {
	
			if (tick) {
				clearInterval(tick);
			}
		});
	}
	RED.nodes.registerType("timeout", TimeoutNode);
}
