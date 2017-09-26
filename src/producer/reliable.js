'use strict';

const Events = require('events');
const eventEmitter = new Events.EventEmitter();

const makeProducer = (producer) => {

    producer.on('delivery-report', function (err, report) {

        console.log('Error' + JSON.stringify(err));
        console.log('Report' + JSON.stringify(report));
        eventEmitter.emit('delivery-report-' + report.opaque, report.opaque);
    });

    producer.setPollInterval(10);

    return (topic, partition, msg, key, timestamp, opaque) => {

        return new Promise((resolve, reject) => {

            let receivedDeliveryReport = false;
            console.log(topic, partition, msg, key, timestamp, opaque);
            producer.produce(topic, partition, msg, key, timestamp, opaque);

            const handler = function (reportOpaque) {

                if (opaque === reportOpaque) {

                    eventEmitter.removeListener('delivery-report-' + opaque, handler);
                    receivedDeliveryReport = true;
                    return resolve(opaque);
                }
                else {
                    console.log('Not valid', reportOpaque)
                };
            };

            setTimeout(() => {

                if (!receivedDeliveryReport) {
                    console.log('Timeout waiting for delivery-report');
                    eventEmitter.removeListener('delivery-report-' + opaque, handler);
                    return reject('Timeout waiting for delivery-report: ' + opaque);
                };
            }, 4000);

            eventEmitter.on('delivery-report-' + opaque, handler);
        });
    };
};

module.exports = makeProducer;
