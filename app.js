var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var logger = require('./utils/logger')
var Ddos = require('ddos')
var ddos = new Ddos({ burst: 15, limit: 222 })
var indexRouter = require('./routes/index');
var loginRouter = require('./routes/login');
var attackRouter = require('./routes/attack');
var actionsRouter = require('./routes/actions');
var mapRouter = require('./routes/map')
var adminRouter = require('./routes/admin')
var statisticsLogger = require('./utils/statisticsLogger')
var crypto = require('./utils/crypto')
var teamCache = require('./redis/teamCache')
var _ = require("lodash")

if (typeof(PhusionPassenger) !== 'undefined') {
  PhusionPassenger.configure({ autoInstall: false });
}


var app = express();
var net = require('net');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.set('trust proxy', true)
//app.use(ddos.express);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(morgan('dev'));
app.use(statisticsLogger.logToDb)
app.use('/', indexRouter);
app.use('/teams', loginRouter);
app.use('/attack', attackRouter);
app.use('/action', actionsRouter);
app.use('/techadmin', adminRouter)

app.use('/map', mapRouter)


//Posobile fix for bellow :
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something went wrong!!');
});

//TODO: FIX
 //catch 404 and forward to error handler
//app.use(function(req, res, next) {
//  next(createError(404));
//});

// error handler
//app.use(function (err, req, res, next) {
//  // set locals, only providing error in development
//  if(err){
//    res.locals.message = err.message;
//    res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//    // render the error page
//    res.status(err.status || 500).send();
//  }
//});
//
if (typeof(PhusionPassenger) !== 'undefined') {
  app.listen('passenger');
} else {
  app.listen(3000);
}

////HEARTHBEAT
//var socketServer = net.createServer(function (client) {
//  console.log('Client connect. Client local address : ' + client.localAddress + ':' + client.localPort + '. client remote address : ' + client.remoteAddress + ':' + client.remotePort);
//  clients = {}
//  client.setEncoding('utf-8');
//  client.setTimeout(7000);
//  client.on('data', function (data) {
//
//    //console.log('Receive client send data : ' + data + ', data size : ' + client.bytesRead);
//    teamId = crypto.decrypt(data).split("|")[2]
//
//    teamCache.get(teamId, teamData => {
//      teamData.online = true
//      teamData.onlineTime = client.bytesRead
//
//      clients[client.localAddress] = {
//        teamId: teamId,
//        time: new Date() / 1000
//      }
//
//      for(ip in clients){
//        if(clients[ip].time + 5 < new Date() / 1000 ){
//          teamData.online=false
//        }
//      }
//      //console.log(clients)
//      teamCache.set(teamId, teamData)
//    })
//
//    client.write("OK")
//  });
//
//  client.on('end', function (data) {
//    console.log('Client disconnect.' + client.localAddress);
//    
//    // Get current connections count.
//    socketServer.getConnections(function (err, count) {
//      if (!err) {
//        // Print current connection count in server console.
//        console.log("[SOCKET] There are %d connections now. ", count);
//      } else {
//        console.error(JSON.stringify(err));
//      }
//
//    });
//  });
//
//  // When client timeout.
//  client.on('timeout', function () {
//    console.log('[SOCKET] Client request time out. ');
//  })
//
//});
//
//// Make the server a TCP server listening on port 9999.
//socketServer.listen(3001, function () {
//
//  // Get server address info.
//  var serverInfo = socketServer.address();
//
//  var serverInfoJson = JSON.stringify(serverInfo);
//
//  console.log('[SOCKET] TCP server listen on address : ' + serverInfoJson);
//
//  socketServer.on('close', function () {
//    console.log('[SOCKET] TCP server socket is closed.');
//  });
//
//  socketServer.on('error', function (error) {
//    console.error(JSON.stringify(error));
//  });
//
//});


var loadApp = require("./loadApp")
 loadApp.loadMap()
 loadApp.loadTeams()
 loadApp.loadProblemsForHttp()
 loadApp.loadEntriesForTeams()

module.exports = app;
