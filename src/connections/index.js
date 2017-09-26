'use strict';

const Kafka = require('node-rdkafka');

const producerFactory = (options) => {

    return new Promise((resolve, reject) => {

        var producer = new Kafka.Producer(options.producer);

        console.log("Kafka producer configured");
        
        
        //logging debug messages, if debug is enabled
        producer.on('event.log', function (log) {
            console.log(log);
        });

        //logging all errors
        producer.on('event.error', function (err) {
            console.error('Error from producer');
            console.error(err);
        });

        producer.on('disconnected', function (arg) {
            console.log('producer disconnected. ' + JSON.stringify(arg));
        });

        
        producer.on('ready', function (arg) {

            console.log('Producer READY: ', producer.isConnected(),arg);

            return resolve(producer);
        });
        
        producer.connect();
    })
};

module.exports = producerFactory;