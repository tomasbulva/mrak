var crypto          = require('crypto');
var User            = require('./model');
var TokenController = require('../accesstoken');
var Token           = require('../accesstoken/model');
var utilities       = require('../utilities');
var log             = utilities.iLog(module);
var util            = require('util');


module.exports = {
    create: function(req, res, next) {
        
        log.debug("create function",req.body.username);

        //log.debug(req.body);


        var userinfo = new User();
        
        userinfo.firstName = req.body.firstname;
        userinfo.middleName = req.body.middlename;
        userinfo.lastName = req.body.lastname;
        userinfo.email = req.body.email;
        userinfo.username = req.body.username;
        userinfo.password = req.body.password;

        userinfo.save(function(err, user) {
            if(err) log.error(err);
            log.info("New user ",util.inspect(user, { showHidden: true, depth: null }));
            //callback(err, user);
            utilities.globalHeaders(res); //X-Powered-By
            res.json(user);
        });
    },
    login: function(req, res, next){
        utilities.globalHeaders(res); //X-Powered-By
        //log.debug("api/index > user login", req.body);
        //log.debug('login req.query user: %s pass: %s', req.query.user, req.query.password);
        var userinfo = new User();
            userinfo.username = req.query.user;
            userinfo.password = req.query.password;
        var logincheck = userinfo.checkPassword();
        log.debug("checkPassword: ",logincheck);
        if (!logincheck) {
            res.writeHead(403);
            res.end();
        } else {
            TokenController.deleteOld();
            User.findOne({username: req.query.user}, function returnUserId(err,user){ //, password: req.query.password
                log.debug("returnUserId ", user.id);
                TokenController.create(user.id,function(mytoken){
                    res.setHeader("accessToken",mytoken);
                    res.writeHead(200);
                    res.end();
                });
            });
            
        }
        
    },
    logout: function(req, res, next){
        utilities.globalHeaders(res); //X-Powered-By
        module.exports.getUserByToken(req.headers.accesstoken, function(currUser){
            if(currUser) {
                log.debug('logout user: ',util.inspect(user, { showHidden: true, depth: null }) );
                User.findOneAndUpdate({ username: currUser.username }, { isloggedin: false },function logoutCb(err,logoutRef){
                    log.debug("logoutRef._id ", currUser.id);
                    TokenController.deleteByUserId(currUser._id,function tokenDeleteByUsrIdCb(err,result){
                        var tokenConfirm = (result === 1)? "token removed" : "token not removed";
                        log.info("user %s has logged out and %s",currUser.username, tokenConfirm);
                        res.writeHead(200);
                        res.end();
                    });
                });

            }
        });
        
    },
    getUserByToken: function(token,callback){
        Token.findOne({accessToken: token}).populate('user').exec(function (err, accessToken) {
          if (err) log.error(err);
          //log.debug("accessToken.user",accessToken.user);
          callback(err,accessToken.user);
        });
    },
    currUserInfo: function(req, res, next){
        log.debug("getUserByToken");
        Token.findOne({accessToken: req.headers.accesstoken}).populate('user').exec(function (err, accessToken) {
          if (err) log.error(err);
          
          var currUser = {
            id: accessToken.user.id,
            username: accessToken.user.username,
            email: accessToken.user.email,
            firstName: accessToken.user.firstName,
            middleName: accessToken.user.middleName,
            lastName: accessToken.user.lastName
          };
          
          res.json(currUser);
        });
    }
}