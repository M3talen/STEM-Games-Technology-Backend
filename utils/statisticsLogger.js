const teamController = require('../controllers/teams')
const teamCache = require('../redis/teamCache')
const crypto = require('./crypto')

ATTACK_ROUTE = "/attack"
ACTION_ROUTE = "/action/move"
LOGIN_ROUTE = "/teams/login"

var logToDb = function (req, res, next) {
    if(req.originalUrl === LOGIN_ROUTE){
        next()
        return
    }
    try {
        teamToken = req.body.token
        teamTokenDec = crypto.decrypt(teamToken)
        teamId = teamTokenDec.split("|")[2]
        teamCache.get(teamId, (teamData) => {
            if (teamData) {
                if (teamData.token === teamToken) {
                        teamController.get(teamData.team.id).then(team => {
                            teamDBData = team.get()
                            statistics = teamDBData.statistics
                            statistics = JSON.parse(statistics)
                            if(statistics === null){
                                statistics = {
                                    status: 0,
                                    move: 0,
                                    attack: 0
                                }
                            }
                            if(req.originalUrl === ATTACK_ROUTE){
                                statistics.attack = statistics.attack + 1;
                            }else if(req.originalUrl === ACTION_ROUTE){
                                if (req.body.action && req.body.action !== "") {
                                    statistics.move = statistics.move + 1;
                                } else {
                                    statistics.status = statistics.status + 1;
                                }
                            }
                            team.update({
                                statistics: JSON.stringify(statistics)
                            })
                            .then(_ => {
                                teamData.team.statistics = statistics,
                                teamCache.set(teamId, teamData)
                                next()
                            })

                        })
                }
            } 
        })
    } catch (error) {
        next()
    }
}


module.exports = {
    logToDb
}