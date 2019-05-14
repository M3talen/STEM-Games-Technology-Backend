const submissions = require('../models').submissions;
const testCases = require('../models').test_cases;

const teamCache = require("../redis/teamCache")
const crypto = require("../utils/crypto")
const teamController = require("../controllers/teams")
const entriesCache = require("../redis/entriesCache")
const submissionController = require('../controllers/submissons')
const problemsController = require('../controllers/problems')
const util = require('../utils/utils')
const queueHandler = require('../queue/queueHandler')


const env = process.env.NODE_ENV || 'development';
var config = require('../config/config.json')[env]

/**
    //attack api
    REQ :
    {
        "token" : "team_id",
        "problem_id" : "12"
        "case_id" : "23",
        "submission" : "rjesenje 0 1 02"
    }

    RES : 
    {
        "solved" : "true \ false",
        "healthbar" : [0 1 0 0 1 1],
        "points" : current_points
    }
*/

updateOrCreate = (model, where, newItem, onUpdateOrCreate) => {
    // First try to find the record
    model.findOne({where: where}).then(function (foundItem) {
        if (!foundItem) {
            // Item not found, create a new one
            model.create(newItem)
                .then(onUpdateOrCreate)
                .catch(error => console.log(error));
        } else {
            // Found an item, update it
            model.update(newItem, {where: where})
                .then(onUpdateOrCreate)
                .catch(error => console.log(error));
            ;
        }
    }).catch(error => console.log(error));
}

checkIfProblemIsSolved = (problems, problem_id) => {
    if(!problems)
        return false
    check = false;
    let problem 
    try {
        problem = JSON.parse(problems)
    } catch (error) {
        problem = problem
    }
    problem.array.forEach(problem => {
        if(parseInt(problem) === parseInt(problem_id)){
            check = true;
            return;
        }
    });
    return check;
}

attack = (req, res) => {
    
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
                    problemsController.get(req.body.problem_id).then(problem => {
                    teamController.get(teamData.team.id).then(team => {
                        teamDBData = team.get()
                        
                        entriesCache.checkIfSolved(teamId, req.body.problem_id, req.body.problem_id + "0" + req.body.case_id, (check) => {
                            if(check){
                                // if already solved return current values
                                entriesCache.getHealthBar(teamId, req.body.problem_id, (bar) => {
                                    submissionController.getSubmissonsFromTeam(teamId).then( (submissions) => {
                                        let points = 0
                                        if(submissions){
                                            submissions.forEach(entry => {
                                                points = points + entry.points
                                            })
                                        }
                                        points = Math.round(points * 100) /100
                                        attack_status = {
                                            solved: true,
                                            healthbar: bar,
                                            points: points,
                                            solvedBefore: true
                                        }
                                        res.status(200).send(attack_status)
                                        return;
                                    })
                                })
                            } else {
                                // else check if solved (test case)
                                testCases.findOne({
                                    where:[{
                                        id: req.body.problem_id + "0" + req.body.case_id,
                                        problem_id: req.body.problem_id
                                    }]
                                })
                                .then(testCase => {
                                    if(testCase === null){
                                        res.status(400).send("Test case ID is not valid for that problem");
                                        return;
                                    }
                                    correct = testCase.dataValues.expectedOutput.trim() === req.body.submission.trim();
                                    let points = 0;
                                    if(correct){
                                        factor = Number(util.getDayDiffrence()) === problem.unlockedDay ? 1 : Number(util.getDayDiffrence()) === 1 ? config.OneDayFactor : config.TwoDayFactor // points factoring in relations to days
                                        points = factor * config.factors[Number(req.body.case_id)] * problem.points
                                    }
                                    updateOrCreate(submissions, {team_id: teamId, test_case_id: testCase.id},
                                        {
                                            team_id: teamId, 
                                            test_case_id:  testCase.id,
                                            solution: req.body.submission,
                                            is_correct: correct,
                                            points: points
                                        },
                                        _ => {
                                            // first setting in cache if case is correct or not
                                            entriesCache.setTestCase(teamId, req.body.problem_id, testCase.id, correct, () =>{
                                                entriesCache.getHealthBar(teamId, req.body.problem_id, (bar) => {
                                                    submissionController.getSubmissonsFromTeam(teamId).then( (submissions) => {
                                                        let points = 0
                                                        if(submissions){
                                                            submissions.forEach(entry => {
                                                                points = points + entry.points
                                                            })
                                                        }
                                                        let solvedJSON = {}
                                                        points = Math.round(points * 100) / 100
                                                        problemSolved = bar.every(e => parseInt(e) === 1)
                                                        solved = teamDBData.solved
                                                        if(solved){
                                                            solvedJSON = JSON.parse(solved)
                                                        }
                                                        // if problems is solved then store it in db under team
                                                        if(problemSolved && (!solved || !checkIfProblemIsSolved(solvedJSON, req.body.problem_id))) {
                                                            attack_status = {
                                                                solved: correct,
                                                                healthbar: bar,
                                                                points: points,
                                                                solvedBefore: false
                                                            }
                                                            if(!solved){
                                                                solvedJSON = {
                                                                    array : [
                                                                        req.body.problem_id
                                                                    ]
                                                                }
                                                            } else {
                                                                solvedJSON.array.push(req.body.problem_id)
                                                            }
                                                            
                                                            // update team points and solved list
                                                            team.update({
                                                                points: attack_status.points,
                                                                solved: JSON.stringify(solvedJSON)
                                                            }).then(_ => {
                                                                teamData.team.points = attack_status.points
                                                                teamData.team.solved = solvedJSON
                                                                teamCache.set(teamId, teamData)
            
                                                                res.status(200).send(attack_status)
                                                                return;
                                                            })
                                                        // if problem is not solved return current status
                                                        } else {
                                                            attack_status = {
                                                                solved: correct,
                                                                healthbar: bar,
                                                                points: points,
                                                                solvedBefore: false
                                                            }

                                                            // update team points
                                                            team.update({
                                                                points: attack_status.points
                                                            }).then(_ => {
                                                                teamData.team.points = attack_status.points
                                                                teamCache.set(teamId, teamData)
            
                                                                res.status(200).send(attack_status)
                                                                return;
                                                            })
                                                        }
                                                    })
                                                })
                                            })
                                        })
                                })
                                .catch(error => console.log(error))
                            }
                        })

                    })
                })        
                }
            } else {
                res.status(401).send("Team not logged in");
            }   
        })
    } catch (error) {
        res.status(400).send(error);
    }
}

module.exports = {
    attack
}