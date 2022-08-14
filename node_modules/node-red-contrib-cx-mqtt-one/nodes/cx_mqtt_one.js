"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mqtt_1 = __importDefault(require("mqtt"));
const events_1 = require("events");
module.exports = function (RED) {
    const ALL_TAGS_STORAGE = "__MQTT_ONE__";
    const ALL_SUBSCRIPTIONS = "__MQTT_ONE_SUBS__";
    const toAllNodes = "__to_all_nodes__";
    const newStatus = "__new_mqtt_status__";
    const mqttClientsMap = new Map();
    let $mqttSubscriptions = {};
    let global;
    const $COMMAND = {
        addBroker: "__add_broker",
        removeBroker: "__remove_broker",
        publish: "__publish",
        subscribe: "__subscribe",
    };
    const eventEmitter = new events_1.EventEmitter();
    let nodeCount = 0;
    function MqttOne(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        if (nodeCount === 0) {
            global = node.context().global;
            $mqttSubscriptions = {};
            global.set(ALL_SUBSCRIPTIONS, $mqttSubscriptions);
        }
        nodeCount++;
        eventEmitter.on(toAllNodes, (mqttMessage) => node.send(mqttMessage));
        eventEmitter.on(newStatus, (text) => node.status(text));
        updateNodeStatus();
        node.on("input", (msg) => {
            const commands = Object.values($COMMAND);
            if (!commands.includes(msg.command)) {
                node.warn(".command MUST be one of these: " + commands.join(","));
                return;
            }
            if (msg.command === $COMMAND.addBroker)
                return addBroker(node, msg);
            if (msg.command === $COMMAND.publish)
                return publish(node, msg);
            if (msg.command === $COMMAND.subscribe)
                return subscribe(node, msg);
            if (msg.command === $COMMAND.removeBroker)
                return removeBroker(msg);
        });
        node.on("close", () => {
            nodeCount--;
            if (nodeCount === 0) {
                mqttClientsMap.forEach(mqttClientStore => mqttClientStore.mqttClient.end());
                mqttClientsMap.clear();
                global.set(ALL_SUBSCRIPTIONS, {});
            }
        });
    }
    function addBroker(node, msg) {
        if (msg.brokerId == null || msg.brokerId === "") {
            node.warn("msg.brokerId MUST be provided");
            return;
        }
        const brokerId = msg.brokerId;
        const existingMqttClient = mqttClientsMap.get(msg.brokerId);
        if (existingMqttClient)
            removeBroker(msg);
        if (!msg.payload || !msg.payload.options) {
            node.warn("msg.payload or msg.payload.options is missing");
            return;
        }
        const options = msg.payload.options;
        options.brokerId = brokerId;
        const mqttClient = mqtt_1.default.connect(options);
        const clientStore = {
            mqttClient,
            isConnected: false
        };
        mqttClient.on('error', err => {
            if (mqttClient.reconnecting && !clientStore.isConnected)
                return;
            clientStore.isConnected = false;
            updateNodeStatus();
            node.error(err);
            eventEmitter.emit(toAllNodes, {
                brokerId,
                topic: "__status/connection",
                payload: "disconnected"
            });
            eventEmitter.emit(toAllNodes, {
                brokerId,
                topic: "__status/error",
                payload: err.message
            });
        });
        mqttClient.on('message', (topic, payload) => {
            let payloadParsed = payload.toString();
            try {
                payloadParsed = JSON.parse(payloadParsed);
            }
            catch (e) { }
            const mqttMessage = {
                brokerId, topic,
                payload: payloadParsed
            };
            eventEmitter.emit(toAllNodes, mqttMessage);
        });
        mqttClient.on('connect', () => {
            if (!msg.payload || !Array.isArray(msg.payload.subscriptions)) {
                node.warn("msg.payload or msg.payload.subscriptions is missing");
                return;
            }
            clientStore.isConnected = true;
            updateNodeStatus();
            eventEmitter.emit(toAllNodes, {
                brokerId: msg.brokerId,
                topic: "__status/connection",
                payload: "connected"
            });
            if (!Array.isArray(msg.payload.subscriptions))
                return;
            setSubs(brokerId, msg.payload.subscriptions);
            msg.payload.subscriptions.forEach((subscription) => {
                mqttClient.subscribe(subscription);
            });
        });
        mqttClientsMap.set(brokerId, clientStore);
        updateNodeStatus();
    }
    function removeBroker(msg) {
        const mqttClientStore = mqttClientsMap.get(msg.brokerId);
        if (!mqttClientStore)
            return;
        mqttClientStore.mqttClient.end();
        mqttClientsMap.delete(msg.brokerId);
        delete $mqttSubscriptions[msg.brokerId];
        updateNodeStatus();
        eventEmitter.emit(toAllNodes, {
            brokerId: msg.brokerId,
            topic: "__status/connection",
            payload: "disconnected"
        });
    }
    function publish(node, msg) {
        if (msg.brokerId == null || msg.brokerId === "" || !msg.topic) {
            node.warn("msg.brokerId and msg.topic MUST be provided");
            return;
        }
        const mqttClientStore = mqttClientsMap.get(msg.brokerId);
        if (!mqttClientStore)
            return;
        const payload = (msg.payload == null || msg.payload === "") ?
            "" : JSON.stringify(msg.payload);
        msg.opts = msg.opts || {};
        mqttClientStore.mqttClient.publish(msg.topic, payload, msg.opts);
    }
    function subscribe(node, msg) {
        if (msg.brokerId == null || msg.brokerId === "" || !msg.payload) {
            node.warn("msg.payload or msg.brokerId is missing");
            return;
        }
        const mqttClientStore = mqttClientsMap.get(msg.brokerId);
        if (!mqttClientStore) {
            node.warn("Broker " + msg.brokerId + " does not exist!");
            return;
        }
        const existingSubscriptions = getSubs(msg.brokerId);
        if (existingSubscriptions) {
            existingSubscriptions.forEach((subscription) => {
                mqttClientStore.mqttClient.unsubscribe(subscription);
            });
        }
        if (!Array.isArray(msg.payload.subscriptions))
            return;
        msg.payload.subscriptions.forEach((subscription) => {
            mqttClientStore.mqttClient.subscribe(subscription);
        });
        setSubs(msg.brokerId, msg.payload.subscriptions);
    }
    function setSubs(brokerId, subs) {
        $mqttSubscriptions[brokerId] = subs;
        global.set(ALL_SUBSCRIPTIONS, $mqttSubscriptions);
    }
    function getSubs(brokerId) {
        const subs = global.get(ALL_SUBSCRIPTIONS);
        if (!subs)
            return [];
        return subs[brokerId];
    }
    function updateNodeStatus() {
        let count = 0;
        mqttClientsMap.forEach(mqttClientStore => {
            if (mqttClientStore.mqttClient.connected)
                count++;
        });
        const status = count + "/" + mqttClientsMap.size;
        eventEmitter.emit(newStatus, status);
    }
    RED.nodes.registerType("mqtt one", MqttOne);
};
//# sourceMappingURL=cx_mqtt_one.js.map