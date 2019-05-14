const mapBlocks = require('../models').mapBlocks;
const problems = require('../models').problems;
/*
    //Login 
    REQ : 
    {
        "username":"abc",
        "password":"ab"
    }
    RES : 
    {
        "status":"True" ili "False",
        "token":"taem_id hash"
    } 
*/
add = (mapArray) => {
    mapBlocks.bulkCreate(mapArray)
        .then(() => {
            //return mapBlocks.findAll();
            console.log("inserted")
        })
        .catch((error) => {
            console.log(error)
        });
}
getAll = () => {
    return mapBlocks.findAll({
        include: [
            { model: problems, as: "problem" }
        ]
        })
        .catch((error) => {
            console.log(error)
        });
}
module.exports = {
    add,
    getAll

};