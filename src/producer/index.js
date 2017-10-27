'use strict';

module.exports.connect = (options) => {

    return require('./connection/index')(options)
        .then((producer) => {

            return {
                secureProduce: require('./reliable')(producer),
                produce: require('./default')(producer)
            };
        });
};
