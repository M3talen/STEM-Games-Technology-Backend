const client = require("./index").client()

add = (key, data) => {
    client.hset("entries:data", key, data, client.print);
}

get = (key, cb) => {
    client.hget("entries:data", key, (err,res) => {
        if(err){
            console.log(folder, err)
        }else{
            cb(res)
        }
    })
}

getAll = (cb) => {
    client.hgetall("entries:data", (err, res) => {
        if (err) {
            console.log(folder, err)
        } else {
            cb(res)
        }
    })
}

setTestCase = (key, problemId, testCaseId, correct, cb) => {
    client.hget("entries:data", key, (err,res) => {
        if(err){
            console.log(folder, err)
        }else{
            res = JSON.parse(res)

            res.entries.forEach(problem => {
                if(problem.problem_id === Number(problemId)){
                    problem.cases.forEach(testCase => {
                        if(testCase.test_case_id === testCaseId){
                            testCase.solved = correct
                            data = JSON.stringify(res)
                            client.hset("entries:data", key, data, client.print)
                            cb()
                        }
                    })
                }
            })
        }
    })
}

getHealthBar = (key, problem_id, cb) => {
    if(problem_id === undefined){
        cb(undefined)
        return
    }
    client.hget("entries:data", key, (err,res) => {
        if(err){
            console.log(folder, err)
        }else{
            bar = []
            res = JSON.parse(res)
            res.entries.forEach(problem => {
                if(Number(problem_id) === problem.problem_id){

                    cases = problem.cases;
                    cases.sort((t1, t2) => {
                        if(t1.test_case_id < t2.test_case_id)
                            return -1
                        if(t1.test_case_id > t2.test_case_id)
                            return 1 
                        return 0
                    })
                    cases.forEach(testCase => {
                        bar.push(testCase.solved ? 1 : 0)
                    })
                }
                
            });
            cb(bar)
        }
    })
}

checkIfSolved = (key, problemId, testCaseId, cb) => {
    client.hget("entries:data", key, (err,res) => {
        if(err){
            console.log(folder, err)
        }else{
            res = JSON.parse(res)
            find = false
            res.entries.forEach(problem => {
                if(problem.problem_id === Number(problemId)){
                    problem.cases.forEach(testCase => {
                        if(testCase.test_case_id === Number(testCaseId)){
                            find = true
                            cb(testCase.solved)
                        }
                    })
                }
            })
            if(!find){
                cb(false)
            }
        }
    })
}

module.exports = {
    add,
    get,
    getAll,
    getHealthBar,
    checkIfSolved,
    setTestCase
}