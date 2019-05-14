const request = require('../../controllers/request')

log = (teamId, body, route, done) => {
    request.insert(teamId, body, route)
    done()
}

module.exports = {
    log
}