var mapGenerator = require("./mapSearch")
var teamGenerator = require("./generateTeams")
var crypto = require("../../utils/crypto")
var testCaseGenerator = require("./generateTestCases")

teamData = [
    {
        name: "/",
        username: "/",
        password: crypto.encrypt("/"),
    },
]

problemsData = [
    {
        path: "boxes",
        problemId: "1"
    }
]

mapGenerator.createMap("labirint-final.txt", mapReturnData => {

    teamData.forEach(team => {
        team.x = mapReturnData.startingPosition.x
        team.y = mapReturnData.startingPosition.y
        team.points = 0
    });

    teamGenerator.addTeams(teamData)
    problemsData.forEach(data => {
        testCaseGenerator.generateTestCases(data.path, data.problemId)
    })
    console.log("Generate map with dimensions : ", mapReturnData.dimX, mapReturnData.dimY)
    console.log("Insert problems on : ", mapReturnData.problems)
})

