'use strict';

const Glue = require('glue');

const internals = {};

/**
 * Exports the function 'compose' accepting a JSON manifest specifying the hapi server options, connections, and registrations.
 * Composes a hapi server object.
 * @param  {Object} manifest            Connections and registrations
 * @param  {Object} composeOptions      File-system path string used to resolve loading modlues with 'require'
 * @param  {Function} next              Callback function returning error if existing, else the server object
 * @return {Error|Server}               Error or server object
 */
exports.init = function (manifest, composeOptions, next) {

    Glue.compose(manifest, composeOptions, (err,server) => {

        if (err){
            return next(err);
        }

        server.start((err) => {

            return next(err, server);
        });
    });
};
