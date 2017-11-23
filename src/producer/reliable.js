'use strict';

const Logger = require('debug-logger')('knt:producer:reliable')
const Events = require('events');
const eventEmitter = new Events.EventEmitter();
eventEmitter.setMaxListeners(1000)

const reliableProducerFactory = (producer) => {

    producer.on('delivery-report', function (err, report) {

        Logger.debug('Report' + JSON.stringify(report) + ' Error: ' + JSON.stringify(err));
        eventEmitter.emit('delivery-report-' + report.opaque, report.opaque);
    });

    producer.setPollInterval(10);

    return (topic, partition, msg, key, timestamp, opaque) => {

        return new Promise((resolve, reject) => {

            let receivedDeliveryReport = false;
            Logger.debug(topic + ',' + partition + ',' + msg + ',' + key + ',' + timestamp + ',' + opaque);
            producer.produce(topic, partition, msg, key, timestamp, opaque);

            const handler = function (reportOpaque) {

                if (opaque === reportOpaque) {

                    eventEmitter.removeListener('delivery-report-' + opaque, handler);
                    receivedDeliveryReport = true;
                    return resolve(opaque);
                }
                else {
                    Logger.error('Error: Not valid', reportOpaque)
                };
            };

            setTimeout(() => {

                if (!receivedDeliveryReport) {
                    
                    Logger.warn('Error: Timeout waiting for delivery-report');
                    eventEmitter.removeListener('delivery-report-' + opaque, handler);
                    return reject('Timeout waiting for delivery-report: ' + opaque);
                };
            }, 180000);

            eventEmitter.on('delivery-report-' + opaque, handler);
        });
    };
};

module.exports = reliableProducerFactory;
