# MQTT One Node

One MQTT node for all connections. Fully dynamic and controlled by the incoming message.

Functionality:
 - Creates a broker connection on "__add_broker" (brokerId has to be generated and used as property in the message)
 - Controls the subs and pubs to this broker via "__subscribe" and "__publish" with valid broker ID



### Incoming Message Example
```typescript
interface ISubscribeMessage {
  command: "__subscribe", // to unsubscribe send [] in payload.subscriptions
  brokerId?: string | number,
  payload?: {
      subscriptions?: string[],
  }
}

interface IPublishMessage {
  command: "__publish",
  brokerId?: string | number,
  topic?: string;
  payload?: any,
  opts?: {
    qos?: number,
    retain?: boolean
  }
}

interface IAddBrokerMessage {
  command: "__add_broker",
  brokerId?: string | number,
  payload?: {
      subscriptions?: string[],
      options?: {
          protocol: 'wss' | 'ws' | 'mqtt' | 'mqtts' | 'tcp' | 'ssl' | 'wx' | 'wxs'
          port: number
          host: string
          hostname: string
          username: string,
          password: string,
          path?: string
          keepalive?: number
          clientId?: string
          protocolId?: string
          protocolVersion?: number
          clean?: boolean,
          brokerId?: string | number
      }
  }
}
```

### Outgoing Message Example
```typescript
interface IMqttMessage {
  brokerId: string | number,
  topic: string, // mqtt topic or '__status/connection' or '__status/error'
  payload: any
}
```
