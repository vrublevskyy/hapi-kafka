'use strict';

const Logger = require('debug-logger')('knt:producer:connection:index');
const Kafka = require('node-rdkafka');

const producerFactory = (options) => {

    return new Promise((resolve, reject) => {

        Logger.info('Conecting to KAFKA...');

        var producer = new Kafka.Producer(options);
 
        //logging debug messages, if debug is enabled
        producer.on('event.log', function (log) {
            Logger.debug(log);
        });

        //logging all errors
        producer.on('event.error', function (err) {
            Logger.error('Error from producer: ', err);
        });

        producer.on('disconnected', function (arg) {

            Logger.info('producer disconnected. ' + JSON.stringify(arg));
        });

        
        producer.on('ready', function (arg) {

            Logger.info('Connected. Producer READY:', producer.isConnected(), ', Configuration: ', arg);

            return resolve(producer);
        });
        
        producer.connect();
    })
};

module.exports = producerFactory;