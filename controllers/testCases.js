const testCases = require('../models').test_cases;

add = (array) => {
    return testCases.bulkCreate(array)
        .then(() => {
            //return mapBlocks.findAll();
            console.log("inserted")
        })
        .catch((error) => {
            console.log(error)
        });
}

getAll = () => {
    return testCases.findAll({ raw: true })
        .catch((error) => {
            console.log(error)
        });
}

module.exports = {
    add,
    getAll
};