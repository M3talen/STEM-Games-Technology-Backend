var express = require('express');
var router = express.Router();

const teamCache = require('../redis/teamCache')

router.get("/status", (req, res) => {
    teamCache.getAll((data) => {
        values = []
        for(key in data){
            value = data[key]
            value = JSON.parse(value)
            values.push({
                name: value.team.name,
                x: value.team.x,
                y: value.team.y
            })
        }
        res.status(200).send({mapData: values})
    })
})

module.exports = router;