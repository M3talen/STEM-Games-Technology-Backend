const submissions = require('../models').submissions;

getAll = () => {
    return submissions.findAll({ raw: true })
        .catch((error) => {
            console.log(error)
        });
}

get = (team_id, test_case_id) => {
    return submissions.findOne({
        where : {
            team_id: team_id,
            test_case_id : test_case_id
        }
    })
    .catch(error => console.log(error))
}

getSubmissonsFromTeam = (teamID) => {
    return submissions.findAll({ where:{
        team_id: teamID
    }})
    .catch(error => {
        console.log(error)
    })
}

module.exports = {
    getAll,
    get,
    getSubmissonsFromTeam
};