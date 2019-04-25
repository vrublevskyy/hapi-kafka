'use strict';
const Logger = require('debug-level')('knt:consumer:default');

module.exports = (consumer) => {

    //Offset managment
    const notCommitedOffsets = {};
    let maxOffset = {};

    const commitMessage = (msg) => {

        Logger.debug('Tying to commit msg: ' + msg.offset + ' partition: ' + msg.partition);

        let index = notCommitedOffsets[msg.partition].indexOf(msg.offset);
        if (notCommitedOffsets[msg.partition][0] === msg.offset && notCommitedOffsets[msg.partition].length > 1) {

            let commit = notCommitedOffsets[msg.partition][1] - 1 || msg.offset;
            msg.offset = commit;
            Logger.debug('Commited offset: ' + commit + ' partition: ' + msg.partition);
            consumer.commitMessage(msg)
        }
        else if (notCommitedOffsets[msg.partition].length === 1) {

            msg.offset = maxOffset[msg.partition];
            Logger.debug('Commited maxOffset: ' + maxOffset[msg.partition] + ' partition: ' + msg.partition);
            consumer.commitMessage(msg);
        }
        else {
            Logger.debug('Message not commited: ' + msg.offset);
        }

        if (index >= 0) notCommitedOffsets[msg.partition].splice(index, 1);
    };


    return (handler, onError, topics) => {

        consumer.on('data', (msg) => {

            Logger.debug('Received new message' + JSON.stringify(msg));
            if (!notCommitedOffsets[msg.partition][msg.partition]) {
                notCommitedOffsets[msg.partition][msg.partition] = [];
                maxOffset[msg.partition] = 0;
            };

            handler(msg)
                .then((res) => {

                    commitMessage(msg);
                })
                .catch((err) => {

                    onError(msg,err)
                        .then(() => {

                            commitMessage(msg);
                        })
                        .catch(() => {commitMessage(msg);})
                })
        });

        consumer.subscribe(topics);
        consumer.consume();
    };
};
