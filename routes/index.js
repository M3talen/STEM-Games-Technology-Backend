var express = require('express');
var router = express.Router();
var crypto = require('../utils/crypto')
var mapController = require("../controllers/map")
var problemsCache = require("../redis/problemsCache")
var renderMd = require("../zadaci/readMd")
var path = require('path');
var entriesCache = require("../redis/entriesCache")
var _ = require('lodash');
var nl2br = require('nl2br');
const clipboardy = require('clipboardy');
const teamCache = require('../redis/teamCache')
const teamController = require('../controllers/teams')
const adminCache = require('../redis/adminCache')
var Cookies = require('cookies')

/* GET home page. */
router.get('/zadatak', function (req, res, next) {
  encrypedId = req.query.id
  decryptedId = crypto.decrypt(encrypedId)
  id = decryptedId.split("|")[0]
  teamId = decryptedId.split("|")[1]
  problemsCache.get(id, problemData => {

    entriesCache.get(teamId, entries => {
      entries = JSON.parse(entries)
      problemData = JSON.parse(problemData)
      entry = _.filter(entries.entries, { 'problem_id': problemData.id })
     
        entry.cases = _.sortBy(entry.cases, "test_case_id")
        var mdFile = renderMd.renderMd(problemData.displayMetadata.file)
        downloadHref = "https://tech.stemgames.hr/download?name=" + crypto.encrypt(problemData.displayMetadata.file)
        res.render('zadatak', { data: problemData, mdFile: mdFile, testCases: entry.cases, reduced: false, clipboardy: clipboardy, nl2br: nl2br, downloadHref: downloadHref });
      
    })
  })
});


router.get('/download', function (req, res, next) {
  encrypedName = req.query.name
  decryptedName = crypto.decrypt(encrypedName)
  var filepath = './zadaci/' + decryptedName + '/' + decryptedName + '.zip';
  res.download(filepath);
});

router.get('/map', function (req, res, next) {
  mapController.getAll().then(data => {

    res.render('map', { map: data });
  })
});

// statistics page
router.get('/statistics', (req, res, next) => {
  teamCache.getAll(data => {
    teamArray = []
    for (teamID in data) {
      values = data[Number(teamID)]
      values = JSON.parse(values)
      //console.log(values.team)
      //values.team.statistics = JSON.parse(values.team.statistics)
      if (!values.team.name.startsWith("TechAdmin"))
        teamArray.push({
          name: values.team.name,
          points: values.team.points,
          moves: values.team.statistics && values.team.statistics.move ? values.team.statistics.move : 0,
          attacks: values.team.statistics && values.team.statistics.attack ? values.team.statistics.attack : 0,
          online: values.online ? values.online : false
        })
    }

    teamArray.sort((t1, t2) => {
      const t1Points = Number(t1.points)
      const t2Points = Number(t2.points)

      if (t1Points < t2Points)
        return 1
      if (t1Points > t2Points)
        return -1
      return 0
    })

    res.render('statistics', { teamArray: teamArray, _: _ })
  })
})

const jsonwebtoken = require('jsonwebtoken')

const jwtKey = process.env['JWT_KEY'] || 'stem2019jebeno'

// admin route login
router.get('/api/login', (req, res) => {
  const user = "TechAdminZvonimir"
  const password = "Tech5623Admin2019" /* Get credentials somehow */
  teamController.checkCredentials(user, password)
    .then(entity => {
      if (entity && user.startsWith('TechAdmin')) {
        const jwt = jsonwebtoken.sign({ sub: user }, jwtKey)
        adminCache.add(jwt, entity.id)
        var cookies = new Cookies(req, res)
        cookies.set('jwt', jwt, { maxAge: 1000 * 60 * 10, httpOnly: false })
        res.status(200).send("to je to") // res.render('admin')
      } else {
        res.status(200).send('no cookie') // res.render('login')
      }
    })
})

// admin page
router.get('/techAdmin', (req, res) => {
  /* See: req['authUserId'] */
  var cookies = new Cookies(req, res)
  try {
    if (cookies.get('jwt')) {
      const pass = cookies.get('jwt')
      adminCache.get(pass, (data) => {
        console.log(data)
        if (data) {
          res.status(200).send("radi") // res.render('admin')
        } else {
          res.status(200).send("ne radi") // res.render('login')
        }
      })

    } else {
      res.status(200).send("ne radi") // res.render('login')
    }
  } catch (error) {
    res.status(200).send(error)
  }

})

module.exports = router;
