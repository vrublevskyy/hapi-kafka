'use strict';

const Logger = require('debug-logger')('knt:consumer:batchConsumer');

/**
 * 
 * @param {*} consumer kafka consumer connection.
 * @param {*} customSettings module settings 
 * @returns consumer function
 */
const batchConsumerFactory = (consumer, customSettings) => {

    //Default settings
    const settings = {
        maxBatch: 500,
        batchInterval: 1000,
        batchInc: 10,
        batchDec: 50,
        maxSystemMessages: 100
    };

    let currentMessages = 0;
    let batch = 100;

    //Offset managment
    const notCommitedOffsets = {};
    let maxOffset = {};

    Object.assign(settings, customSettings);
    Logger.debug('Initializing batch consumer with settings: ', settings);

    /**
     * Commits message if all previous messages has been processed
     * @param {*} msg 
     */
    const commitMessage = (msg) => {

        let index = notCommitedOffsets[msg.partition].indexOf(msg.offset);
        Logger.debug('Trying to commit offset: ' + msg.offset + ' partition: ' + msg.partition);

        if (notCommitedOffsets[msg.partition][0] === msg.offset && notCommitedOffsets[msg.partition].length > 1) {

            let commit = notCommitedOffsets[msg.partition][1] - 1 || msg.offset;
            msg.offset = commit;
            Logger.debug('Commited offset: ' + commit + ' partition: ' + msg.partition);
            consumer.commitMessage(msg);
        }
        else if (notCommitedOffsets[msg.partition].length === 1) {

            msg.offset = maxOffset[msg.partition];
            Logger.debug('Commited max offset: ' + maxOffset[msg.partition] + ' partition: ' + msg.partition);
            consumer.commitMessage(msg);
        } else {
            Logger.debug('Message not commited: ' + msg.offset + + ' partition: ' + msg.partition);
        }

        if (index >= 0) notCommitedOffsets[msg.partition].splice(index, 1);
    };

    return (handler, onError, topics) => {

        consumer.on('data', (msg) => {

            if (!notCommitedOffsets[msg.partition]) {
                notCommitedOffsets[msg.partition] = [];
                maxOffset[msg.partition] = 0;
            };

            //Register message for each partition as not commited;
            notCommitedOffsets[msg.partition].push(msg.offset);
            //Register highest offset
            maxOffset[msg.partition] = msg.offset;
            //Register message in system
            currentMessages++;

            handler(msg)
                .then((res) => {

                    currentMessages--;
                    commitMessage(msg);
                })
                .catch((err) => {

                    //Executes error handler and commits message. If onError function fails, throws an error
                    onError(err, msg)
                        .then(() => {

                            commitMessage(msg);
                            currentMessages--;
                        })
                        .catch(() => {

                            throw new Error('Error: proecssing msg ', JSON.stringify(msg))
                        });
                });
        });

        consumer.subscribe(topics);

        setInterval(() => {

            consumer.consume(batch);
        }, settings.batchInterval);

        setInterval(() => {

            if (currentMessages > settings.maxSystemMessages) {
                batch = batch - settings.batchDec;
                if (batch < 0) batch = 0;
            }
            else if (currentMessages < (settings.maxSystemMessages - (settings.batchInc * 2))) {
                batch = batch + settings.batchInc;
                if (batch > settings.maxBatch) batch = settings.maxBatch;
            }
        }, 1000);
    };
};


module.exports = batchConsumerFactory;