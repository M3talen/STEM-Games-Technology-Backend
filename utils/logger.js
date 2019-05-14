var os = require('os')

const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env]["logDNA"];

var Logger = require('logdna');
var options = {
    hostname: os.hostname(),
    app: "TechArena2019",
    env: env
};

// Defaults to false, when true ensures meta object will be searchable
options.index_meta = true;

// Define a singleton instance
var logger = Logger.setupDefaultLogger(config.key, options);

// Create multiple loggers with different options
var logger = Logger.createLogger(config.key, options);

// Console will send to logDNA
//["log", "warn", "error", "info"].forEach(function(method) {
//    var oldMethod = console[method].bind(console);
//    console[method] = function() {
//        if(arguments.length == 1){
//            logger[method](arguments[0])
//        }else{
//            logger[method](JSON.stringify(arguments))    
//        }
//        oldMethod.apply(console,arguments);
//    };
//});
