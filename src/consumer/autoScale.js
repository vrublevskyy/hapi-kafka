'use strict';

//Batch managment
let currentMessages = 0;
let batch = 100;

//Offset managment
const notCommitedOffsets = [];
let maxOffset = 0;

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

        console.log('Finished processing: ' + msg.offset);

        let index = notCommitedOffsets.indexOf(msg.offset);
        if (notCommitedOffsets[0] === msg.offset && notCommitedOffsets.length > 1) {

            let commit = notCommitedOffsets[1] - 1 || msg.offset;
            msg.offset = commit;
            console.log('Commit offset: ' + commit);
            consumer.commitMessage(msg);
        }
        else if (notCommitedOffsets.length === 1) {

            msg.offset = maxOffset;
            console.log('Commit maxOffset: ' + maxOffset);
            consumer.commitMessage(msg);
        };

        if (index >= 0) notCommitedOffsets.splice(index, 1);
    };

    return (handler, onError, topics) => {

        consumer.on('data', (msg) => {

            currentMessages++;
            handler(msg)
                .then((res) => {
                    currentMessages--;
                    commitMessage(msg);
                    console.log(res)
                })
                .catch((err) => {

                    onError(msg, err)
                        .then(() => {

                            commitMessage(msg);
                            currentMessages--;
                        })
                        .catch(() => {

                            commitMessage(msg);
                            currentMessages--;
                        });
                });
        });

        consumer.subscribe(topics);

        setInterval(() => {
            consumer.consume(batch);
        }, 1000);
    };
};
