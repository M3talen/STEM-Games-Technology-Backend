var express = require('express');
var router = express.Router();

const attackController = require('../controllers').attack

router.post("/", attackController.attack)

module.exports = router;