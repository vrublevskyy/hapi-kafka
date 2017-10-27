'use strict';

const Kafka = require('node-rdkafka');

const consumerFactory = (options) => {

    return new Promise((resolve, reject) => {

        console.log('Conecting to KAFKA...');

        var consumer = new Kafka.KafkaConsumer(options, { 'auto.offset.reset': 'earliest' });

        //logging debug messages, if debug is enabled
        consumer.on('event.log', function (log) {
            console.log(log);
        });

        //logging all errors
        consumer.on('event.error', function (err) {
            console.error('Error from consumer');
            console.error(err);
        });

        consumer.on('disconnected', function (arg) {
            console.log('consumer disconnected. ' + JSON.stringify(arg));
            process.exit(1);
        });


        consumer.on('ready', function (arg) {

            console.log('Connected. consumer READY:', consumer.isConnected(), ', Configuration ' + JSON.stringify(arg));

            return resolve(consumer);
        });
        consumer.connect();
    })
};

module.exports = consumerFactory;