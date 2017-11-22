'use strict';

module.exports = (consumer) => {

    const notCommitedOffsets = [];
    let maxOffset = 0;

    const commitMessage = (msg) => {

        //console.log('Finished processing: ' + msg.offset);

        let index = notCommitedOffsets.indexOf(msg.offset);
        if (notCommitedOffsets[0] === msg.offset && notCommitedOffsets.length > 1) {

            let commit = notCommitedOffsets[1] - 1 || msg.offset;
            msg.offset = commit;
            //console.log('Commit offset: ' + commit);
            consumer.commitMessage(msg)
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

            notCommitedOffsets.push(msg.offset);
            if (msg.offset > maxOffset) maxOffset = msg.offset;

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
