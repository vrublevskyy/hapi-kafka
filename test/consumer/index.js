'use strict';

const Kafka = require('../../src/index');

const options = {
    //  'debug': 'all',
    'group.id': 'consumer2',
    'metadata.broker.list': 'localhost:9092',
    'enable.auto.commit': false,
    'offset_commit_cb': function (err, topicPartitions) {

        if (err) {
            // There was an error committing
            console.error(err);
        } else {
            // Commit went through. Let's log the topic partitions
            console.log(topicPartitions);
        }

    }

    //  'src.consumer.max.poll.records': 1
};
function random(low, high) {
    return Math.random() * (high - low) + low;
}
const handler = (msg) => {

    return new Promise((resolve, reject) => {

        console.log('Start processing ' + msg.offset)
/*
        setTimeout(() => {

            resolve('OK')
        }, random(300, 10000))
*/
        resolve('OK')
    });
};

Kafka.Consumer.connect(options)
    .then((consumer) => {

        consumer.consume(handler,() => {

            return new Promise((resolve, reject) => {

                resolve('OnError finished')
            })
        }, ['t5'])
    })
    .catch(console.error)
