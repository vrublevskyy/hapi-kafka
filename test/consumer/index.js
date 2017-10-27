'use strict';

const Kafka = require('../../src/index');

const options = {
  //  'debug': 'all',
    'group.id': 'consumer',
    'metadata.broker.list': 'localhost:9092',
    'enable.auto.commit': false
    
    //  'src.consumer.max.poll.records': 1
};
function random (low, high) {
    return Math.random() * (high - low) + low;
}
const handler = (msg) => {

    return new Promise((resolve, reject) => {

        //console.log(msg)

        setTimeout(() => {

            resolve('OK')
        }, random(300,5000))
        
    });
};

Kafka.Consumer.connect(options)
.then((consumer) => {

    consumer.consume(handler, ['consumer2'])
})
.catch(console.error)
