const env = process.env.NODE_ENV || 'development';
var config = require('../config/config.json')[env]


getDayDiffrence = () => {
    let currentDate = new Date()
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
    firstDay = new Date(config.firstDay)
    timeDifference = Math.abs(currentDate.getTime() - firstDay.getTime());
    let differentDays = Math.ceil(timeDifference / (1000 * 3600 * 24));
    return differentDays
}

module.exports = {
    getDayDiffrence
}