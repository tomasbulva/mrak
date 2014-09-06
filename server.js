// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    		= require('express');
var app        		= express();
var morgan      	= require('morgan');
app.use(morgan('combined')); // http requests logging

global.ServerRootDir= __dirname;
var config          = require('./modules/config');
var auth          	= require('./modules/auth');
var fs				= require('fs');
var qs				= require('qs');
var https			= require('https');
var http			= require('http');

var bodyParser 		= require('body-parser');

var mongoose		= require('mongoose');

var utilities 		= require("./modules/utilities");
var log 			= utilities.iLog(module);

var securityOptions = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('certificate.pem'),
    requestCert: true
};

app.use(bodyParser.urlencoded({ extended: false }));

mongoose.connect(config.get('mongoose:uri'));

// mount all the applications
app.use('/api', require("./modules/api"));
app.use('/s', require("./modules/api/share"));


// START THE SERVER
// =============================================================================
//var secureServer 	= https.createServer(securityOptions, app);
//var unsecureServer 	= http.createServer(app);

//unsecureServer.listen(config.get('http-port'));
//secureServer.listen(config.get('https-port'));
app.listen(config.get('https-port'));
log.info('Logomatic is running on port http %s ',config.get('https-port'));