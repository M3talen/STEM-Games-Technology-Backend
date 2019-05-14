
var mapCache = require("./redis/mapCache")
var teamCache = require("./redis/teamCache")
var problemsCache = require("./redis/problemsCache")
var mapController = require("./controllers/map")
var teamController = require("./controllers/teams")
var problemsController = require("./controllers/problems")
var entriesCache = require("./redis/entriesCache")
var submissonsController = require("./controllers/submissons")
var testCasesController = require("./controllers/testCases")

loadMap = () => {
    console.log("[MapLoader] Loading map data")
    mapController.getAll().then(data => {
        if (!data) {
            console.error("[MapLoader] No map data found !")
            process.exit(404);
        }
        console.log("[MapLoader] Caching data to redis")
        data.forEach(element => {
            mapCache.add(element.x, element.y, JSON.stringify(element))
        });
    })
}

loadTeams = () => {
    //Load teamStatus cache, teamCache fills on login !
    console.log("TODO: LOAD TEAM DATA")
}

loadProblemsForHttp = () => {
    console.log("[ProblemsLoader] Loading problem data")
    problemsController.getAll().then(data => {
        if (!data) {
            console.error("[ProblemsLoader] No problems data found !")
            process.exit(404);
        }
        console.log("[ProblemsLoader] Caching data to redis")
        data.forEach(element => {
            problemsCache.add(element.id, JSON.stringify(element))
        });
    })
}

// helper function for loading entries
checkifTestCaseIsSolved = (submissons, teamId, testCaseID) => {
    check = false
    submissons.forEach(submisson => {
        if (submisson.is_correct === true && submisson.team_id === teamId && submisson.test_case_id === testCaseID) {
            check = true
            return
        }
    })

    return check
}

loadEntriesForTeams = () => {
    console.log("[EntriesLoader] Loading entries for all teams")
    teamController.getAll()
        .then(teamData => {
            if (!teamData) {
                console.error("[EntriesLoader] No team data found !")
                process.exit(404);
            }
            submissonsController.getAll()
                .then(submissonsData => {
                    problemsController.getAll()
                        .then(problemsData => {
                            if (!problemsData) {
                                console.error("[EntriesLoader] No problems data found !")
                                process.exit(404);
                            }
                            testCasesController.getAll()
                                .then(testCasesData => {
                                    if (!testCasesData) {
                                        console.error("[EntriesLoader] No test cases data found !")
                                        process.exit(404);
                                    }
                                    console.log("[EntriesLoader] Caching data to redis")
                                    teamData.forEach(team => {
                                        entries = {
                                            entries: []
                                        }

                                        problemsData.forEach(problem => {
                                            entries.entries.push({
                                                problem_id: problem.id,
                                                points: problem.points,
                                                cases: []
                                            })

                                            testCasesData.forEach(testCase => {
                                                if (problem.id === testCase.problem_id) {
                                                    entries.entries[entries.entries.length - 1].cases.push({
                                                        test_case_id: testCase.id,
                                                        solved: submissonsData !== null ? checkifTestCaseIsSolved(submissonsData, team.id, testCase.id) : false,
                                                        input: testCase.input
                                                    })
                                                }
                                            })
                                        })

                                        entriesCache.add(team.id, JSON.stringify(entries))
                                    })
                                })
                        })
                })
        })
}

module.exports = {
    loadMap,
    loadTeams,
    loadProblemsForHttp,
    loadEntriesForTeams
}