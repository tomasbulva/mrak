var crypto          = require('crypto');
var Token      		= require('./model');
var User            = require('../user/model');

var config          = require('../config');
var utilities       = require('../utilities');
var log             = utilities.iLog(module);

module.exports = {
    create:function(userID,callback){
    	log.debug('accessToken index create id: ',userID);
    	var newToken = new Token();
    	var now = new Date().getTime()
    	var exp = now + config.get('security:tokenLife');

    	log.debug("exp ",exp);

    	newToken.user = userID;
    	newToken.accessToken = crypto.randomBytes(32).toString('base64');
    	newToken.expiration = exp;

    	newToken.save(function(err,token){
    		//console.dir(token);
    		//log.debug(token.accessToken);
            User.findOneAndUpdate({ _id: userID }, { isloggedin: true });
    		if(err){ log.error(err); }
    		else { callback(token.accessToken); }
    	});
    },
    check: function(thetoken,callback){
    	var token = new Token();
    	token.tokentocheck = thetoken;
		token.checkToken(function(tokens){
			//log.debug("accessToken ",token.tokentocheck);
			if(!tokens) { 
				log.error('no token found!');
				callback(false);
			}else{
				var now = new Date().getTime();
				var exp = new Date(tokens.expiration).getTime();
				// log.debug("accessToken ",tokens.accessToken);// log.debug("now ",now);// log.debug("exp ",exp);//log.debug("compare dates ",utilities.dates.compare(exp,now));

				if(thetoken === tokens.accessToken){
			        //log.debug("accessToken found"); //log.debug("curr date ",new Date().getTime()); //log.debug("expr date ",tokens.expiration.toString());
			        if(utilities.dates.compare(exp,now) === 1){
			            log.info("access granted via accessToken: %s",tokens.accessToken);
			            callback(true);
			        }else{
			        	log.debug("token is old");
			            callback(false);
			        }
			    }else{
			    	log.debug("token not found");
			        callback(false);
			    }
		    }
		});
    },
    deleteOld: function(){
    	Token.remove({expiration: {"$lt": new Date()}}, function(err,results){
    		if(err) log.error(err);
    		log.debug(err,results)
    	});
    },
    deleteByUserId: function(userId,callback){
    	Token.remove({user: userId}, function(err,results){
    		if(err) log.error(err);
    		//log.debug(err,results)
    		callback(err,results);
    	});
    }
}