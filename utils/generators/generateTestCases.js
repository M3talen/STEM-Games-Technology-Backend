const testCases = require("../../controllers/testCases")
const fs = require('fs');
generateTestCases = (path, problem_id) => {
    const testFolder = './zadaci/' + path + '/test_cases';
    fs.readdir(testFolder, (err, files) => {

        var testC = []
        for (let i = 0; i < files.length/2; i++) {

            //var input = fs.readFileSync(testFolder + "/" + i + ".in", "utf8").trim();
            var output = fs.readFileSync(testFolder + "/" + i + ".out", "utf8").trim();

            testC.push({
                id: problem_id + "0" + i,
                input: "",
                problem_id: problem_id,
                expectedOutput: output
            })
        }
        testCases.add(testC)
    });
}



module.exports = {
    generateTestCases
}