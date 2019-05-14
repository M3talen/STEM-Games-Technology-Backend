const kue = require('kue');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env]["redis"];

const loggingHandler = require('./handlers/loggingHandler')

let queue;
if (process.env.REDISTOGO_URL) {
    const rtg = require("url").parse(process.env.REDISTOGO_URL);
    queue = kue.createQueue({
        redis: {
            port: rtg.port,
            host: rtg.hostname,
            auth: rtg.auth.split(":")[1]
        }
    });
} else {
    queue = kue.createQueue({ redis: config });
}

queue.process('handle_logging_req', 1, (job, done) => {
    loggingHandler.log(job.data.teamId, job.data.body, job.data.route, done);
})

handleLogging = (teamId, body, route) => {
    queue.create('handle_logging_req', {
        teamId: teamId,
        body: body,
        route: route
    }).removeOnComplete(true).save();
}

module.exports = {
    handleLogging
}