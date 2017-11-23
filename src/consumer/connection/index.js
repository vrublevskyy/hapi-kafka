'use strict';

const Logger = require('debug-logger')('knt:consumer:connection:index');
const Kafka = require('node-rdkafka');

//{ 'auto.offset.reset': 'earliest' }
/**
 * Receives kafka consumer options and returns promise with kafka consumer connection
 * @param {*} options Kafka options
 */
const consumerFactory = (options) => {

    return new Promise((resolve, reject) => {

        Logger.info('Conecting to KAFKA...');

        const consumer = new Kafka.KafkaConsumer(options.global, options.topic);

        //logging debug messages, if debug is enabled
        consumer.on('event.log', function (log) {
            Logger.debug(log);
        });

        //logging all errors
        consumer.on('event.error', function (err) {

            Logger.error('Error from consumer',error);
        });

        consumer.on('disconnected', function (arg) {
            
            Logger.info('consumer disconnected. ' + JSON.stringify(arg));
            process.exit(1);
        });


        consumer.on('ready', function (arg) {

            Logger.info('Connected. Consumer READY:', consumer.isConnected(), ', Configuration ' + JSON.stringify(arg));

            return resolve(consumer);
        });
        consumer.connect();
    })
};

module.exports = consumerFactory;