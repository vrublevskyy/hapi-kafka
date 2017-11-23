# kafka-node-tools

This module is a wrapper for node-rdkafka. All documentation about broker configuration: https://github.com/Blizzard/node-rdkafka

## API

### Producer

#### Constructor

##### options

* options.global: Global producer configuration

```
{
    "client.id": "myClientId",
    "metadata.broker.list": "kafka.com",
    "compression.codec": "gzip",
    "retry.backoff.ms": 200,
    "message.send.max.retries": 10,
    "socket.keepalive.enable": true,
    "queue.buffering.max.messages": 100000,
    "queue.buffering.max.ms": 1000,
    "batch.num.messages": 10,
    "dr_cb": true
    }
```

#### produce

Sends message to kafka and resolvs promise without waiting for delivery report

```
produce(topic, partition, msg, key, timestamp, opaque)
```

* topic Topic to send the message to.

* partition Optionally we can manually specify a partition for the message.this defaults to -1 - which will use librdkafka's default partitioner (consistent random for keyed messages, random for unkeyed messages)

* msg Message to send. Must be a buffer. Ex new Buffer('My message')

* key For keyed messages, we also specify the key - This field is optional

* timestamp you can send a timestamp here. If your broker version supports it will get added. Otherwise, we default to 0

* opaque you can send an opaque token here, which gets passed along to your delivery reports


#### secureProduce

Sends message to kafka and resolvs promise after receive delivery report or reject if timeout has expired

```
secureProduce(topic, partition, msg, key, timestamp, opaque)
```

* topic Topic to send the message to.

* partition Optionally we can manually specify a partition for the message.this defaults to -1 - which will use librdkafka's default partitioner (consistent random for keyed messages, random for unkeyed messages)

* msg Message to send. Must be a buffer. Ex new Buffer('My message')

* key For keyed messages, we also specify the key - This field is optional

* timestamp you can send a timestamp here. If your broker version supports it will get added. Otherwise, we default to 0

* opaque you can send an opaque token here, which gets passed along to your delivery reports

### Consumer

#### Constructor

##### options: Consumer configuration

* options.global: Consumer global configuration

```
'group.id': process.env.KAFKA_CONSUMER_ID,
'metadata.broker.list': process.env.KAFKA_BROKER_LIST,
'enable.auto.commit': false,
'offset_commit_cb': function(err, topicPartitions) {
            
    if (err) {
      // There was an error committing
    } else {
      // Commit went through. Let's log the topic partitions
    }            
}
```

* options.topic: Consumer topic configuration

```
{ 'auto.offset.reset': 'earliest' }
```

* options.batchConsumer: (Optional) Bath consumer configuration

Default configuration
```
{
    'maxBatch': 500,
    'batchInterval': 1000,
    'batchInc': 10,
    'batchDec': 50,
    'maxSystemMessages': 100
}
```

Example: 


```
"options": {
    "global": {
        "group.id": "myGroupId",
        "metadata.broker.list": "kafka.com",
        "enable.auto.commit": false,
    },
    "topic": {
        "auto.offset.reset": "earliest" 
    },
    "batchConsumer": {
        "maxBatch": 500,
        "batchInterval": 1000,
        "batchInc": 10,
        "batchDec": 50,
        "maxSystemMessages": 100
}
}
```


#### consume

```
consume(handler, onError, topics)
```

* handler: function executed for each received message.
* onError: function executed if hadnler fails
* topics: topics to consume

#### batchConsume

```
batchConsume(handler, onError, topics)
```

* handler: function executed for each received message.
* onError: function executed if hadnler fails
* topics: topics to consume


## Example

```
const KafkaTools = require('kafka-node-tools');
const Config = require('./config');

Promise.all([
    KafkaTools.Consumer.connect(Config.consumerOptions),
    KafkaTools.Producer.connect(Config.producerOptions)
])
    .then(([consumer, producer]) => {

        const handler = (msg) => {

            return producer.secureProduce(
                Config.producerTopic, null,
                new Buffer(JSON.stringify(parsedMsg)), null,
                new Date().getTime(),
                null)
                .then((result) => {

                    console.log('Finish processing ' + msg.partition + '-' + msg.offset)
                })
        };

        consumer.batchConsume(handler,
            () => {

                return new Promise((resolve, reject) => {

                    resolve('OnError handler finished')
                })
            }, Config.consumerTopics)

    })
    .catch((error) => {

        console.log(error);
        process.exit(1);
    })
```