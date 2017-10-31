# kafka-node-tools

HapiJS module to publish messages to kafka. This module is a wrapper for node-rdkafka. 
All documentation about broker configuration: https://github.com/Blizzard/node-rdkafka

## API

### produce

```
produce(topic, partition, msg, key, timestamp, opaque)
```

* topic Topic to send the message to.

* partition Optionally we can manually specify a partition for the message.this defaults to -1 - which will use librdkafka's default partitioner (consistent random for keyed messages, random for unkeyed messages)

* msg Message to send. Must be a buffer. Ex new Buffer('My message')

* key For keyed messages, we also specify the key - This field is optional

* timestamp you can send a timestamp here. If your broker version supports it will get added. Otherwise, we default to 0

* opaque you can send an opaque token here, which gets passed along to your delivery reports

### HapiJS module configuration

Plugin registration:

```
plugin: {
                register: 'hapi-kafka-producer',
                options: {
                    producer: {
                        'client.id': 'test1',
                        'metadata.broker.list': 'localhost:9092',
                        'compression.codec': 'gzip',
                        'retry.backoff.ms': 200,
                        'message.send.max.retries': 10,
                        'socket.keepalive.enable': true,
                        'queue.buffering.max.messages': 100000,
                        'queue.buffering.max.ms': 1000,
                        'batch.num.messages': 10,
                        'dr_cb': true
                    },
                    deliveryMode: 'reliable'
                }
            }
```

* producer node-rdkafka producer options.

* deliveryMode reliable or default.
Default mode resolve the promise after call produce method. Reliable mode resove the promise after receive delivery report.
