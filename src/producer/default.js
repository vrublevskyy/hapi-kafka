'use strict';

const makeProducer = (producer) => {

    producer.on('delivery-report', function (err, report) {
        
        //console.log('Error' + JSON.stringify(err));
        //console.log('Report' + JSON.stringify(report));
    });

    producer.setPollInterval(10);

    return (topic, partition, msg, key, timestamp, opaque) => {

        return new Promise((resolve, reject) => {

            //console.log(topic, partition, msg, key, timestamp, opaque)
            producer.produce(topic, partition, msg, key, timestamp, opaque);
            return resolve(opaque);
        })
    };
};

module.exports = makeProducer;
