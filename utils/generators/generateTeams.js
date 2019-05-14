
var teamController = require("../../controllers/teams")
var crypto = require("../crypto")


addTeams = (teams) => {
    teamController.add(teams)

}

module.exports= {
    addTeams,
}