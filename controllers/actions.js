const teamCache = require("../redis/teamCache")
var crypto = require("../utils/crypto")
var mapCache = require("../redis/mapCache")
var teamController = require("../controllers/teams")
var entriesCache = require("../redis/entriesCache")
const request = require('./request')
const queueHandler = require('../queue/queueHandler')
/*
    //Actions
    REQ 1 (get status): 
    {
        "token":"team_id",
    }
    REQ 2 (move and get status): 
    {
        "token":"team_id",
        "action" : "left / ri...."
    }
    RES 1 (with task): 
    {
        "actions":{
            "up":"true",
            "down":"false",
            "left":"false",
            "right":"true"
        },
        "points":"points"
        "task" : {
            "id":"id, 
            "url":"url"
        },
        "display_metadata": "tekst" of map_blocks
    }
    RES 2 (without task): 
    {
        "actions":{
            "up":"true",
            "down":"false",
            "left":"false",
            "right":"true"
        },
        "points":"points"
        "task" : null,
        "display_metadata": "tekst"
    }
 */
printMapDebug = (x, y) => {
    mapCache.getAll(data => {
        for (let i = 0; i < 57; i++) {

            arr = []
            for (let j = 0; j < 128; j++) {
                var element = data["(" + i + "," + j + ")"];
                element = JSON.parse(element)
                if (i === x && j === y)
                    arr.push("x")
                else
                    arr.push(element.blockData.type === "wall" ? "█" : element.blockData.type === "path" ? "." : element.blockData.type === "gateway" ? "#" : 'o')
            }

            console.log(arr.join(""))
        }
    })

}

checkIfProblemIsSolved = (problems, problem_id) => {
    if (!problems)
        return false;
    let problem 
    try {
        problem = JSON.parse(problems)
    } catch (error) {
        problem = problems
    }
    
    check = false;
    problem.array.forEach(problem => {
        if (parseInt(problem) === parseInt(problem_id)) {
            check = true;
            return;
        }
    });
    return check;
}

move = (req, res) => {
    try {
        teamToken = req.body.token
        teamTokenDec = crypto.decrypt(teamToken)
        console.log("[TEAM TOKEN] "+teamTokenDec)
        teamId = teamTokenDec.split("|")[2]
        queueHandler.handleLogging(teamId, req.body, req.originalUrl)
        //console.log(req.body)
        teamCache.get(teamId, (teamData) => {
            if (teamData) {
                if (teamData.token !== teamToken) {
                    res.status(400).send("Team logged in with different token");
                } else {
                    if (req.body.action && req.body.action !== '') {
                        teamController.get(teamData.team.id).then(team => {
                            teamDBData = team.get()

                            mapCache.getValid(teamDBData.id, teamDBData.x, teamDBData.y, (validMoves) => {
                                console.log(validMoves)
                                if (validMoves[req.body.action]) {
                                    //valid move
                                    newX = req.body.action === "down" ? (teamDBData.x + 1) : req.body.action === "up" ? (teamDBData.x - 1) : teamDBData.x
                                    newY = req.body.action === "right" ? (teamDBData.y + 1) : req.body.action === "left" ? (teamDBData.y - 1) : teamDBData.y
                                    console.log('Team ' + teamDBData.id + ' moved from (' + teamDBData.x + ',' + teamDBData.y + ') to (' + newX + ',' + newY + ')')
                                    //printMapDebug(newX, newY)

                                    team.update({
                                        x: newX,
                                        y: newY
                                    }).then((newTeamDBData) => {
                                        newTeamDBData = newTeamDBData.get()
                                        teamData.team.x = newX,
                                            teamData.team.y = newY
                                        teamCache.set(teamId, teamData)

                                        mapCache.getValid(teamDBData.id, newX, newY, (newValidMoves) => {
                                            mapCache.get(newX, newY, (newBlock) => {
                                                newBlock = JSON.parse(newBlock)
                                                entriesCache.getHealthBar(teamDBData.id, newBlock.problem_id, (bar) => {
                                                    response = {
                                                        actions: newValidMoves,
                                                        points: newTeamDBData.points,
                                                        task: {
                                                            url: newBlock.problem  && !checkIfProblemIsSolved(teamData.team.solved, newBlock.problem_id) ? ("http://tech.stemgames.hr/zadatak?id=" + crypto.encrypt(newBlock.problem_id + "|" + teamId)) : null,
                                                            id: newBlock.problem  && !checkIfProblemIsSolved(teamData.team.solved, newBlock.problem_id) ? newBlock.problem_id : null,
                                                            healthbar: bar.lenght !== 0 ? bar : null
                                                        },
                                                        x:newX,
                                                        y:newY,
                                                        display_metadata: newBlock.displayMetadata ? newBlock.displayMetadata.message : null
                                                    }

                                                    res.status(200).send(response)
                                                })
                                            })

                                        })

                                    })
                                } else {
                                    teamController.get(teamId).then(team => {
                                        teamDBData = team.get()
                                        mapCache.getValid(teamDBData.id, teamDBData.x, teamDBData.y, (validMoves) => {
                                            mapCache.get(teamDBData.x, teamDBData.y, (newBlock) => {
                                                newBlock = JSON.parse(newBlock)
                                                entriesCache.getHealthBar(teamDBData.id, newBlock.problem_id, (bar) => {
                                                    response = {
                                                        actions: validMoves,
                                                        points: teamDBData.points,
                                                        task: {
                                                            url: newBlock.problem  && !checkIfProblemIsSolved(teamDBData.solved, newBlock.problem_id) ? ("http://tech.stemgames.hr/zadatak?id=" + crypto.encrypt(newBlock.problem_id + "|" + teamId)) : null,
                                                            id: newBlock.problem && !checkIfProblemIsSolved(teamDBData.solved, newBlock.problem_id) ? newBlock.problem_id : null,
                                                            healthbar: bar.lenght !== 0 ? bar : null
                                                        },
                                                        x: teamDBData.x,
                                                        y: teamDBData.y,
                                                        display_metadata: newBlock.displayMetadata ? newBlock.displayMetadata.message : null
                                                    }
                                                    res.status(200).send(response)
                                                })
                                            })
                                        })
                                    })
                                }
                            })
                        })

                    } else {
                        teamController.get(teamData.team.id).then(team => {
                            teamDBData = team.get()
                            mapCache.getValid(teamDBData.id, teamDBData.x, teamDBData.y, (validMoves) => {
                                mapCache.get(teamDBData.x, teamDBData.y, (newBlock) => {
                                    newBlock = JSON.parse(newBlock)
                                    if (newBlock && newBlock.problem_id) {
                                        entriesCache.getHealthBar(teamData.team.id, newBlock.problem_id, (bar) => {
                                            //printMapDebug(teamDBData.x, teamDBData.y)
                                            response = {
                                                actions: validMoves,
                                                points: teamDBData.points,
                                                task: {
                                                    url: newBlock.problem  && !checkIfProblemIsSolved(teamData.team.solved, newBlock.problem_id) ? ("https://tech.stemgames.hr/zadatak?id=" + crypto.encrypt(newBlock.problem_id + "|" + teamId)) : null,
                                                    id: newBlock.problem && !checkIfProblemIsSolved(teamData.team.solved, newBlock.problem_id) ? newBlock.problem_id : null,
                                                    healthbar: bar ? bar : null
                                                },
                                                x:teamDBData.x,
                                                y:teamDBData.y,
                                                display_metadata: newBlock.displayMetadata ? newBlock.displayMetadata.message : null
                                            }

                                            res.status(200).send(response)
                                        });
                                    } else {
                                        //printMapDebug(teamDBData.x, teamDBData.y)
                                        response = {
                                            actions: validMoves,
                                            points: teamDBData.points,
                                            task: {
                                                url: newBlock.problem  && !checkIfProblemIsSolved(teamData.team.solved, newBlock.problem_id) ? ("https://tech.stemgames.hr/zadatak?id=" + crypto.encrypt(newBlock.problem_id + "|" + teamId)) : null,
                                                id: newBlock.problem  && !checkIfProblemIsSolved(teamData.team.solved, newBlock.problem_id) ? newBlock.problem_id : null,
                                                healthbar: null
                                            },
                                            x:teamDBData.x,
                                            y:teamDBData.y,
                                            display_metadata: newBlock.displayMetadata ? newBlock.displayMetadata.message : null
                                        }

                                        res.status(200).send(response)
                                    }

                                })
                            })
                        })
                    }
                }
            } else {
                res.status(401).send("Team not logged in");
            }
        })
    } catch (error) {
        res.status(400).send("");
    }
}

status = (req, res) => {
    try {
        teamToken = req.body.token
        teamTokenDec = crypto.decrypt(teamToken)
        console.log(teamTokenDec)
        teamId = teamTokenDec.split("|")[2]
        queueHandler.handleLogging(teamId, req.body, req.originalUrl)
        teamCache.get(teamId, (teamData) => {
            if (teamData) {
                if (teamData.token !== teamToken) {
                    res.status(400).send("Team logged in with different token");
                } else {
                    numOfSolved = !teamData.team.solved ? 0 : JSON.parse(teamData.team.solved).array.length
                    //teamData.team.statistics = JSON.parse(teamData.team.statistics )
                    status = {
                        points: teamData.team.points,
                        moves: teamData.team.statistics && teamData.team.statistics.move ?  teamData.team.statistics.move : 0,
                        attacks: teamData.team.statistics && teamData.team.statistics.attack ?  teamData.team.statistics.attack : 0,
                        tasksSolved: numOfSolved
                    }
                    res.status(200).send(status)
                }
            }
        })
    } catch (error) {
        res.status(400).send(error);
    }
}

module.exports = {
    move,
    status
}