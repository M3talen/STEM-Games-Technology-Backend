const teams = require('../models').teams;
var crypto = require("../utils/crypto")
var teamCache = require("../redis/teamCache")
const queueHandler = require('../queue/queueHandler')


/*
    //Login 
    REQ : 
    {
        "username":"abc",
        "password":"ab"
    }
    RES : 
    {
        "status":"True" ili "False",
        "token":"taem_id hash"
    } 
*/
login = (req, res) => {
    return teams
        .findAll({
            where: [{
                "username": req.body.username,
                "password": crypto.encrypt(req.body.password)
            }],
            order: [
                ['createdAt', 'DESC']
            ],
        })
        .then((teams) => {
            login_status = {
                status: false,
                token: null
            }
            if (teams[0] != null) {
                teamToken = crypto.encrypt("TECH|"+ "NEMA"+ "|" + teams[0].id)
                queueHandler.handleLogging(teams[0].id, req.body, req.originalUrl)
                teamCache.get(teams[0].id, (data) => {
                    if (data) {
                        console.log("Team already logged in")
                        if(teamToken !== data.token){
                            console.log("Team logged from new IP")
                            teamCache.set(teams[0].id, {
                                team: teams[0],
                                token: teamToken
                            })
                        }
                    } else {
                        teamCache.set(teams[0].id, {
                            team: teams[0],
                            token: teamToken
                        })
                    }
                    login_status.status = true
                    login_status.token = teamToken

                    res.status(200).send(login_status)
                })
            }else{
             res.status(400).send("");
            }
        })
        .catch((error) => {
            console.log(error)
            res.status(400).send(error);
        });
}

module.exports = {
    login

};