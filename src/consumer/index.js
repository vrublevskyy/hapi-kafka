'use strict';

module.exports.connect = (options) => {

    return require('./connection/index')(options.global, options.topic)
        .then((consumer) => {

            return {
                consume: require('./default')(consumer, options.consumer),
                batchConsume: require('./batch')(consumer, options.batchConsumer),
            };
        });
};
