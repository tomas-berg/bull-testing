'use strict';

const Bull = require('bull');

const proc = function (job, done) {
    try {
        const { data } = job;
        console.log(`Job data: [${data.payload}]`);
        done();
    } catch (e) {
        console.error(e.message);
        done(e);
    }
};

const queue = new Bull('test', {
    redis: {
        host: '0.0.0.0',
        port: 6379,
        db: 0,
        password: 'secret'
    }
});

(async () => {
    const repeatable = await queue.getRepeatableJobs();
            
    repeatable.forEach(async (job) => {
        await queue.removeRepeatableByKey(job.key);
    });

    queue.process(proc);
    await queue.add({
        payload: 'j0' // <<< change it next run
    }, {
        removeOnComplete: true,
        removeOnFail: true,
        repeat: {
            every: 1000 // <<< change it next run
        }
    });
})();
