'use strict';

module.exports.connect = (options) => {

    return require('./connection/index')(options.global, options.topic)
        .then((consumer) => {

            return {
                consume: require('./default')(consumer),
                batchConsume: require('./batch')(consumer, options.batchConsumer),
            };
        });
};
