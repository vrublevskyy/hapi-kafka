'use strict';

const Logger = require('debug-level')('knt:producer:reliable')
const Events = require('events');
const eventEmitter = new Events.EventEmitter();
eventEmitter.setMaxListeners(1000)

const reliableProducerFactory = (producer) => {

    producer.on('delivery-report', function (error, report) {

        Logger.debug('Report' + JSON.stringify(report) + ' Error: ' + JSON.stringify(error));
        eventEmitter.emit('delivery-report-' + report.opaque, { report, error });
    });

    producer.setPollInterval(10);

    return (topic, partition, msg, key, timestamp, opaque) => {

        return new Promise((resolve, reject) => {

            let receivedDeliveryReport = false;
            Logger.debug(topic + ',' + partition + ',' + msg + ',' + key + ',' + timestamp + ',' + opaque);
            producer.produce(topic, partition, msg, key, timestamp, opaque);

            const handler = function (result) {

                if (opaque === result.report.opaque && !result.error) {

                    eventEmitter.removeListener('delivery-report-' + opaque, handler);
                    receivedDeliveryReport = true;
                    return resolve(result);
                }
                else if (opaque === result.report.opaque && result.error) {

                    eventEmitter.removeListener('delivery-report-' + opaque, handler);
                    receivedDeliveryReport = true;
                    return reject(result);
                }
                else {
                    Logger.error('Error: Not valid', result.opaque);
                    return reject(result);
                };
            };

            setTimeout(() => {

                if (!receivedDeliveryReport) {
                    
                    Logger.warn('Error: Timeout waiting for delivery-report');
                    eventEmitter.removeListener('delivery-report-' + opaque, handler);
                    return reject('Timeout waiting for delivery-report: ' + opaque);
                };
            }, 20000);

            eventEmitter.on('delivery-report-' + opaque, handler);
        });
    };
};

module.exports = reliableProducerFactory;
