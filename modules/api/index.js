
var files 		= require("../files");
var user 		= require("../user");
var auth        = require('../auth');
var busboy      = require('connect-busboy');
var utilities 	= require("../utilities");
var log 		= utilities.iLog(module);
var util            = require('util');

// var multipart   = require('connect-multiparty');
// var multipartMiddleware = multipart();

var express 	= require("express");
var app 		= module.exports = express(); // we export new express app here!

/*
 *
 *   Files
 *
 */
app.use('/files/upload', busboy());
app.post('/files/upload', auth.authorise, function(req, res, next) {
    log.debug("api/index > files create");
    files.create(req, function createFilesCb(err, files) {
        if(err) log.error("api/index > files upload Error ", err);
        //log.debug("api/index > files upload success ", file);
        utilities.globalHeaders(res); //X-Powered-By
        res.json(files); // return user json if ok
    });
});

app.post('/files/folder', auth.authorise, function(req, res, next) {
    log.debug("api/index > files create folder");
    files.createFolder(req, function createFolderCb(err, folder) {
        if(err) log.error("api/index > files create folder Error ", err);
        log.debug("api/index > files create folder success ", folder);
        utilities.globalHeaders(res); //X-Powered-By
        res.json(folder); // return user json if ok
    });
});

app.get('/files/list', auth.authorise, function(req, res, next) {
    log.debug("api/index > files list");
    files.getList(req, function getFilesCb(err, files) {
        if(err) log.error("api/index > files list Error ", err);
        //log.debug("api/index > files success ", file);
        utilities.globalHeaders(res); //X-Powered-By
        res.json(files); // return user json if ok
    });
});

app.get('/files/:id', auth.authorise, function(req, res, next) {
    //log.debug("api/index > files id");
    files.getFile(req, res, function getFilesByIdCb(err, wholeFilePath, fileNameOrig) {
        if(err) log.error("api/index > get File Error ", err);
        //log.debug("api/index > files success ", file);
        utilities.globalHeaders(res); //X-Powered-By
        if(!err){
            res.download(wholeFilePath, fileNameOrig);
        }else{
            //  res.json(err); // return user json if ok
            for(headerType in err){
                if(headerType == "writeHead"){
                    log.debug("res.headerType(%s)",err[headerType]);
                    res.writeHead(err[headerType]);
                }
                if(headerType == "setHeader"){
                    log.debug("res.setHeader('accessToken',%s)",err[headerType].accessToken);
                    res.setHeader("accessToken",err[headerType].accessToken);
                }
            }
            res.end();
        }
        
    });
});

app.delete('/files/:id', auth.authorise, function(req, res, next) {
    log.debug("api/index > files id");
    files.deleteFile(req, function deleteFilesByIdCb(err, success) {
        if(err) log.error("api/index > delete file Error ", err);
        log.debug("api/index > files success ", util.inspect(success, { showHidden: true, depth: null }));
        utilities.globalHeaders(res); //X-Powered-By
        if(!err){
            for(headerType in success){
                if(headerType == "writeHead"){
                    log.debug("res.headerType(%s)",success[headerType]);
                    res.writeHead(success[headerType]);
                }
                if(headerType == "setHeader"){
                    log.debug("res.setHeader('accessToken',%s)",success[headerType].accessToken);
                    res.setHeader("accessToken",success[headerType].accessToken);
                }
            }
            res.end();
        }
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
        //console.dir(user);
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

// current user info
app.get('/user/inf', auth.authorise, function(req, res, next){
    log.debug("api/index > user info");
    user.getUserByToken(req.headers.accesstoken,function(err,user){
        if(err) log.error("api/index > user info Error", err);
        res.json(user);
        //console.dir(user);
    });
});

// id user info
app.get('/user/:user_id/inf', auth.authorise, function(req, res, next){
    log.debug("api/index > user id:%s info", req.params.user_id);
});



