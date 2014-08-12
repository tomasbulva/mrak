var files 		= require("../files");
var user 		= require("../user");
var auth        = require('../auth');
var busboy      = require('connect-busboy');
var utilities 	= require("../utilities");
var log 		= utilities.iLog(module);

// var multipart   = require('connect-multiparty');
// var multipartMiddleware = multipart();

var express 	= require("express");
var app 		= module.exports = express(); // we export new express app here!

/*
 *
 *   Files
 *
 */
app.use('/file/upload', busboy());
app.post('/file/upload', auth.authorise, function(req, res, next) {
    log.debug("api/index > file create");
    files.create(req, function createFileCb(err, file) {
        if(err) log.error("api/index > file create Error ", err);
        log.debug("api/index > file success ", file);
        utilities.globalHeaders(res); //X-Powered-By
        res.json(file); // return user json if ok
    });
});

/*
 *
 *   Users
 *
 */ 
app.post('/user/create', function(req, res, next) {
    log.debug("api/index > user create", req.body);
    user.create(req, function createUserCb(err, user) {
        if(err) log.error("api/index > user create Error ",err);
        utilities.globalHeaders(res); //X-Powered-By
        res.json(user);
    });
});


app.get('/user/login', function(req, res, next){
    log.debug("api/index > user login", req.body);
    user.login(req, res, function loginUserCb(err, user) {
        if(err) log.error("api/index > user login Error", err);
        log.info('user %s is logged in', req.query.user);
        console.dir(user);
        utilities.globalHeaders(res); //X-Powered-By
        for(headerType in user){
            if(headerType == "writeHead"){
                log.debug("res.headerType(%s)",user[headerType]);
                res.writeHead(user[headerType]);
            }
            if(headerType == "setHeader"){
                log.debug("res.setHeader('accessToken',%s)",user[headerType].accessToken);
                res.setHeader("accessToken",user[headerType].accessToken);
            }
        }
        res.end();
        //next();
    });
});


app.get('/user/logout', auth.authorise, function(req, res, next){
    log.debug("api/index > user logout");
    user.logout(req, res, function logoutUserCb(err, user) {
        if(err) log.error("api/index > user logout Error ", err);
        //log.info('user %s is logged out', req.query.user);
        for(headerType in user){
            if(headerType == "writeHead"){
                log.debug("res.headerType(%s)",user[headerType]);
                res.writeHead(user[headerType]);
            }
            if(headerType == "setHeader"){
                log.debug("res.setHeader('accessToken',%s)",user[headerType].accessToken);
                res.setHeader("accessToken",user[headerType].accessToken);
            }
        }
        res.end();
    });
});

app.get('/user/inf', auth.authorise, function(req, res, next){
    log.debug("api/index > user info");
    user.getUserByToken(req.headers.accesstoken,function(err,user){
        if(err) log.error("api/index > user info Error", err);
        res.json(user);
        //console.dir(user);
    });
});