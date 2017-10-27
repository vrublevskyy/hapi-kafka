'use strict';

module.exports.connect = (options) => {

    return require('./connection/index')(options)
        .then((consumer) => {

            return {
                consume: require('./default')(consumer)
            };
        });
};
