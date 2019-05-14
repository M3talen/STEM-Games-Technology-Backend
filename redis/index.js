
const env = process.env.NODE_ENV || 'development';
console.log(env)
const config = require(__dirname + '/../config/config.json')[env]["redis"];
var redis = require("redis")

if (env === "production" && process.env.REDISTOGO_URL) {
    const rtg = require("url").parse(process.env.REDISTOGO_URL)

    redisClient = redis.createClient(rtg.port, rtg.hostname);
    redisClient.auth(rtg.auth.split(":")[1])
} else {

    redisClient = redis.createClient(config.port, config.host);
}

redisClient.on('connect', function () {
    console.log('Redis connected');
});

exports.client = function () {

    return redisClient;

}; 