'use strict';

const Kafka = require('../../src/index');

const options = {
    //                  'debug': 'all',
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
};

Kafka.Producer.connect(options)
.then(console.log)
.catch(console.error)
