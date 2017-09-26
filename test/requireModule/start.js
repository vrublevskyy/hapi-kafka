'use strict';

const Server = require('./index.js');

const internals = {};

internals.manifest = {
    connections: [
        {
            host: '0.0.0.0',
            port: 10001,
            routes: {
                cors: {
                    origin: ['*'],
                    additionalHeaders: ['Content-Type']
                }
            }
        }
    ],
    registrations: [
        {
            plugin: {
                register: 'hapi-kafka-producer',
                options: {
                    producer: {
      //                  'debug': 'all',
                        'client.id': 'test1',
                        'metadata.broker.list': 'localhost:9092',
                        'compression.codec': 'gzip',
                        'retry.backoff.ms': 200,
                        'message.send.max.retries': 10,
                        'socket.keepalive.enable': true,
                        'queue.buffering.max.messages': 100000,
                        'queue.buffering.max.ms': 1000,
                        'batch.num.messages': 10,
                        'dr_cb': true
                    },
                    deliveryMode: 'reliable'
                }
            }
        },
        {
            plugin: {
                register: 'inert'
            }
        },
        {
            plugin: {
                register: 'vision'
            }
        },
        {
            plugin: {
                register: 'hapi-swagger',
                options: {
                    info: {
                        title: 'Documentation',
                        version: process.env.npm_package_version
                    },
                    basePath: '/',
                    pathPrefixSize: 1
                }
            }
        },
        {
            plugin: './services/test1.POST.js'
        },
        {
            plugin: 'hapijs-status-monitor'
        }
    ]
};


// Compose options
internals.composeOptions = {
    relativeTo: __dirname
};


Server.init(internals.manifest, internals.composeOptions, (err, server) => {

    if (err) {
        throw err;
    };
    console.log('Server running at:', server.info.uri);
});
