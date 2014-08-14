var crypto          = require('crypto');
var User            = require('./model');
var TokenController = require('../accesstoken');
var Token           = require('../accesstoken/model');
var utilities       = require('../utilities');
var log             = utilities.iLog(module);


module.exports = {
    create: function(req, callback) {
        
        log.debug("create function",req.body.username);

        log.debug(req.body);


        var userinfo = new User();
        
        userinfo.firstName = null;
        userinfo.middleName = null;
        userinfo.lastName = null;
        userinfo.email = null;
        userinfo.username = req.body.username;
        userinfo.password = req.body.password;

        userinfo.save(function(err, user) {
            if(err) log.error(err);
            log.info("New user - %s:%s - userId %s - id %s",user.username,user.password,user.userId,user.id);
            callback(err, user);
        });
    },
    login: function(req, res, callback){
        
        log.debug('login req.query user: %s pass: %s', req.query.user, req.query.password);

        var userinfo = new User();
        userinfo.username = req.query.user;
        userinfo.password = req.query.password;
        
        log.debug("checkPassword: ",userinfo.checkPassword());
        
        var logincheck = userinfo.checkPassword();
        if (!logincheck) {
            callback(null,{"writeHead":403});
        } else {
            TokenController.deleteOld();
            User.findOne({username: req.query.user}, function returnUserId(err,user){ //, password: req.query.password
                log.debug("returnUserId ", user.id);
                //console.dir(user._id);

                TokenController.create(user.id,function(mytoken){
                    //console.dir(mytoken);
                    callback(null,{"setHeader": {"accessToken": mytoken}, "writeHead":200});
                });
            });
            
        }
    },
    logout: function(req, res, callback){
        log.debug('logout req.query user: ', req.query.user);

        User.findOneAndUpdate({ username: req.query.user }, { isloggedin: false },function logoutCb(err,logoutRef){
            log.debug("logoutRef._id ", logoutRef.id);
            TokenController.deleteByUserId(logoutRef._id,function tokenDeleteByUsrIdCb(err,result){
                //console.dir(result);
                var tokenConfirm = (result === 1)? "token removed" : "token not removed";
                log.info("user %s has logged out and %s",logoutRef.username, tokenConfirm);
                callback(null,{"writeHead":200});
            });
        });
    },
    getUserByToken: function(token,callback){
        Token.findOne({accessToken: token}).populate('user').exec(function (err, accessToken) {
          if (err) log.error(err);
          callback(err,accessToken.user);
        });
    }
}