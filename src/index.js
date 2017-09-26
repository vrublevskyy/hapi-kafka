'use strict';

const hapiKafkaProducer = {
    register: function (server, options, next) {

        let produce;
        console.log('Starting kafka connection')

        require('./connections/index')(options)
        .then((producer) => {

            if (options.deliveryMode === 'reliable') {
                
                console.log('Reliable mode enabled')
                server.decorate('request','kafka',{
                    produce: require('../src/producer/reliable')(producer)
                })   
            }
            else {

                server.decorate('request','kafka',{
                    produce: require('../src/producer/default')(producer)
                })           
            };
            next();
        })
        .catch((error) => {

            console.log('Error connecting kafka: ',error);
        });
        
        
    }
};

hapiKafkaProducer.register.attributes = {
    name: 'hapi-kafka-producer',
    version: '0.0.1'
};

module.exports = hapiKafkaProducer;