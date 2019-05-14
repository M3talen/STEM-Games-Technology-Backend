const request = require('../models').request

insert = (teamId, body, route) => {
    request.create({
        teamId: teamId,
        body: JSON.stringify(body),
        route: route
    })
}

module.exports = {
    insert
}