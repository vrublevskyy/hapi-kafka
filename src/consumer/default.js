'use strict';

module.exports = (consumer) => {

    return (handler, topics) => {

        let maxOffset;
        let minOffset;
        
        consumer.on('data', (msg) => {

            if (!maxOffset){
                maxOffset = msg.offset;
                minOffset = msg.offset;
            }
            else {
                if (msg.offset > maxOffset) {
                    maxOffset = msg.offset;
                }
            }

            if (maxOffset - minOffset > 20) console.log('MIN: ' + minOffset + ' MAX: ' + maxOffset + ' MSG offset: ' + msg.offset,'---------------------- WARN: offset greater than 20')

            handler(msg)
            .then((res) => {
                
                console.log('MIN: ' + minOffset + ' MAX: ' + maxOffset + ' MSG offset: ' + msg.offset);
                if (msg.offset >= minOffset) {

                    console.log('Commit')
                    minOffset = msg.offset;
                    consumer.commitMessage(msg);
                }
                else {
                    console.log('-------------------------------------------------------')
                }
            })
            .catch((err) => {
                console.log(err)
            })
        });


        consumer.subscribe(topics);
        consumer.consume();
    };
};
