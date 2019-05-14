
const problems = require('../models').problems;



getAll = () => {
    return problems.findAll()
        .catch((error) => {
            console.log(error)
        });
}

get = (id) => {
    return problems
        .findByPk(id)
        .catch((error) => {
            console.log(error)
        });
}

module.exports = {
    getAll,
    get
};