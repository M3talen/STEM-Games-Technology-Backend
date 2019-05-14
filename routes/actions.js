var express = require('express');
var router = express.Router();

const actionsController = require('../controllers').actions

router.post("/move", actionsController.move)
router.post("/stats", actionsController.status)

module.exports = router;