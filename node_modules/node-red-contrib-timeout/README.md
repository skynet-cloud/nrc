# Timeout

A simple timeout by Peter Scargill (pete@scargill.org). After (optionally) setting a msg.topic and (optionally) altering the default "safe" and "unsafe" msg.payload messages, for output to, for example MQTT (or simply putting 1 and 0 into the two messages) the node is triggered by any input and will send the SAFE message out. If continually triggered nothing more will happen but if allowed to timeout, the UNSAFE message will be sent. Hence this can be used as a watchdog. Options include "repeat message every second" and "auto-restart when timed out". As well as msg.payload showing "Safe", "Warning" or "Unsafe", you can also (optionall) use msg.countdown showing the remaining time in seconds. You can specifically inject the message "unsafe" if you wish to set the node to "unsafe" immediately.

See my other nodes including node-red-contrib-bigtimer. For more IOT, visit https://tech.scargill.net
