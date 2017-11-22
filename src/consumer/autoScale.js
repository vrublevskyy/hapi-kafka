'use strict';

//Batch managment
let currentMessages = 0;
let batch = 100;

//Offset managment
const notCommitedOffsets = {};
let maxOffset = {};

setInterval(() => {

    if (currentMessages > 200 && batch > 0) {
        batch = batch - 50;
        if (batch < 0) batch = 0;
    }
    else if (currentMessages < 100 && batch > 0 && batch < 500) {
        batch = batch + 10;
    }
}, 1000);

module.exports = (consumer) => {

    const commitMessage = (msg) => {

        let index = notCommitedOffsets[msg.partition].indexOf(msg.offset);
        //console.log('Finished processing: ' + msg.offset);
        
        if (notCommitedOffsets[msg.partition][0] === msg.offset && notCommitedOffsets[msg.partition].length > 1) {

            let commit = notCommitedOffsets[msg.partition][1] - 1 || msg.offset;
            msg.offset = commit;
            //console.log('Commit offset: ' + commit);
            consumer.commitMessage(msg);
        }
        else if (notCommitedOffsets[msg.partition].length === 1) {

            msg.offset = maxOffset[msg.partition];
            //console.log('Commit maxOffset: ' + maxOffset[msg.partition]);
            consumer.commitMessage(msg);
        };
        
        if (index >= 0) notCommitedOffsets[msg.partition].splice(index, 1);
    };

    return (handler, onError, topics) => {

        consumer.on('data', (msg) => {

            if (!notCommitedOffsets[msg.partition]) {
                notCommitedOffsets[msg.partition] = [];
                maxOffset[msg.partition] = 0;
            };

            notCommitedOffsets[msg.partition].push(msg.offset);
            maxOffset[msg.partition] = msg.offset;
            currentMessages++;
            
            handler(msg)
                .then((res) => {
                    currentMessages--;
                    commitMessage(msg);
                })
                .catch((err) => {

                    onError(msg, err)
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
        }, 1000);
    };
};
