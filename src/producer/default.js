'use strict';

const Logger = require('debug-logger')('knt:producer:default')

const defaultProducerFactory = (producer) => {

    producer.on('delivery-report', function (err, report) {
        
        Logger.debug('Report' + JSON.stringify(report) + ' Error: ' + JSON.stringify(err));
    });

    producer.setPollInterval(10);

    return (topic, partition, msg, key, timestamp, opaque) => {

        return new Promise((resolve, reject) => {

            Logger.debug(topic + ',' + partition + ',' + msg + ',' + key + ',' + timestamp + ',' + opaque);
            producer.produce(topic, partition, msg, key, timestamp, opaque);
            return resolve(opaque);
        })
    };
};

module.exports = defaultProducerFactory;
