'use strict';

/**
 * Receives probe status in ping3 format.
 */
const Joi = require('joi');
const Boom = require('boom');

const internals = {};

exports.register = (server, options, next) => {

    server.dependency('hapi-kafka-producer', internals.after);
    return next();
};

exports.register.attributes = {
    name: 'test1.POST'
};

internals.after = (server, next) => {

    server.route({
        method: 'POST',
        path: '/test1',
        config: {
            description: 'test1.POST',
            notes: 'Publish test1 to KAFKA',
            tags: ['api'],
            validate: {
                payload: Joi.object()
            },
            handler: (request, reply) => {

                request.kafka.produce(
                    // Topic to send the message to
                    'test1',
                    // optionally we can manually specify a partition for the message
                    // this defaults to -1 - which will use librdkafka's default partitioner (consistent random for keyed messages, random for unkeyed messages)
                    null,
                    // Message to send. Must be a buffer
                    new Buffer('Awesome message'),
                    // for keyed messages, we also specify the key - note that this field is optional
                    null,
                    // you can send a timestamp here. If your broker version supports it,
                    // it will get added. Otherwise, we default to 0
                    new Date().getTime(),
                    // you can send an opaque token here, which gets passed along
                    // to your delivery reports
                    new Date().getTime()
                )
                    .then((resut) => {

                        return reply(resut).code(200);
                    })
                    .catch((error) => {

                        console.log('Error' + error)
                        return reply(error).code(500);
                    });
            }
        }
    });
    return next();
};
