var utilities               = require("../utilities");
var log                     = utilities.iLog(module);
var tokenController         = require('../accesstoken');


module.exports = {
    // ------------------------------------------------------
    // helper functions for auth

    // .............................................
    // true if req == GET /login 

    isGETLogin: function (req) {
        if (req.path != "/api/user/login") { return false; }
        if ( req.method != "GET" ) { return false; }
        log.debug("isGETLogin req.path %s, req.method %s", req.path, req.method);
        return true;
    },
    isPOSTSignUp: function (req) {
        if (req.path != "/api/user/create") { return false; }
        if ( req.method != "POST" ) { return false; }
        log.debug("isPOSTSignUp req.path %s, req.method %s", req.path, req.method);
        return true;
    },
    reqHasPermission: function (req,callback) {
        tokenController.check(req.headers.accesstoken, function checkTokenCb(tokenCorrect){
            callback(tokenCorrect);
        });
    },
    authorise: function(req, res, next) {
        module.exports.reqHasPermission(req, function(HasPermission){
            if (!HasPermission){
                log.debug('info', 'User is not authorised. Request from address ' + req.connection.remoteAddress + '.');
                utilities.globalHeaders(res);
                res.writeHead(401);
                res.end();
                return;
            }else{
                utilities.globalHeaders(res);
                next();
            }
        });
    }
}