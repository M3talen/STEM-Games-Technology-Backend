const teams = require('../models').teams;
const crypto = require('../utils/crypto')
getAll = () => {
    return teams.findAll({ raw: true })
        .catch((error) => {
            console.log(error)
        });
}
get = (id) => {
    return teams
        .findByPk(id)
        .catch((error) => {
            console.log(error)
        });
}
add = (teamData) => {
    teams.bulkCreate(teamData)
    .then(() => {
        //return mapBlocks.findAll();
        console.log("Inserted teams")
    })
    .catch((error) => {
        console.log(error)
    });
}

checkCredentials = (username, password) => {
    return teams.findOne({
            where: [{
                "username": username,
                "password": crypto.encrypt(password)
            }]
        })
}

module.exports = {
    getAll,
    get,
    add,
    checkCredentials
};