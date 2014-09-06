var crypto          = require('crypto');
var fs 				= require('fs');
var path 			= require('path');
var Share      		= require('./model');
var UserController  = require('../user/');
var File 			= require('../files/model');
var Folder 			= require('../folders/model');
var fileLib      	= require('../files/lib');

var ___ 			= require("underscore");
var config          = require('../config');
var utilities       = require('../utilities');
var async 			= require('async');
var log             = utilities.iLog(module);
var btfy 			= utilities.logDir;


module.exports = {
    create: function(req, res, next) {
    	log.debug('createController create');
    	
    	// it's error when both are empty and both are full
    	// only one variable at the time is permited 
    	if((!req.body.fileId && !req.body.folderId) || (req.body.fileId && req.body.folderId)) {
    		log.info("Share Create suplied with wrong data fileId %s and folderId %s",req.body.fileId,req.body.folderId)
    		res.writeHead(403);
            res.end();
            return;
    	}else{
    		var currID = (!req.body.fileId) ? req.body.folderId : req.body.fileId;
    		var currIDType = (!req.body.fileId) ? "folder" : "file";
    	}

    	var myResult;
    	var newShare = new Share();

    	async.series([
    		function getUserID(cb){
    			UserController.getUserByToken(req.headers.accesstoken, function getUserByTokenCb(err,user){
    				newShare.issuer = user.id;
    				cb();
		    	});
    		},
    		function checkIfCurrUserHasRightToShare(cb){
				
    			if(currIDType == "file"){
    				File.findOne(currID,function(err,resultFile){
    					if(err) log.error(err);

    					log.debug("resultFile \n", btfy(resultFile));
    					log.debug("newShare \n", btfy(newShare));

    					if(resultFile.users.owner == newShare.issuer.toHexString()){
    						cb();
    					}else if(resultFile.users.sharee){
    						___.each(resultFile.users.sharee,function(value, key){
    							if(value == newShare.issuer.toHexString()){
    								cb();
    							}
    						});
    					}else{
    						log.debug("newShare.issuer \n", btfy(newShare.issuer));
							log.info("The %s name %s was found, but User %s has no rights to share",currIDType, resultFile.filenameOrig, newShare.issuer.toHexString());
					    	res.writeHead(403);
						    res.end();
						    return;
						}
    				});
			    }else if(currIDType == "folder"){
			    	Folder.findOne(currID,function(err,resultFolder){
    					if(err) log.error(err);

    					if(resultFolder.users.owner == newShare.issuer){
    						cb();
    					}else if(resultFolder.users.sharee){
    						___.each(resultFolder.users.sharee,function(value, key){
    							if(value == newShare.issuer){
    								cb();
    							}
    						});
    					}else{
							log.info("User %s has no rights to share %s with id %s",newShare.issuer,currIDType,currID)
					    	res.writeHead(403);
						    res.end();
						    return;
						}
    				});
			    }
    		},
    		function getRestOfInfoAndSave2DB(cb){
    			newShare.myIdHash = utilities.randomCharacterString(8);
		    	newShare.fileId = req.body.fileId;
		    	newShare.folderId = req.body.folderId;

		    	newShare.save(function(err,share){
		    		myResult = share;
		    		cb();
		    	});
    		}

		],
        function onShareCreateEnd(err,result){
        	log.debug("onShareCreateEnd: \n",btfy(myResult));
        	log.debug("onShareCreateEnd success");
        	if(err) log.error("Share Create Error ", err);
        	
    		res.json(myResult); // return user json if ok
        });
    	
    },
    findByHash: function(hash, callback){
    	// this DB call could check if the currUser is owner or sharee 
    	// possible improvement for version 2.0 
    	Share.findOne({myIdHash: hash}).populate('fileId folderId').exec(function (err, ShareObject) {
          if (err) log.error("ShareObject Error %s for Hash %s",err,hash);
          log.debug("findByHash: ShareObjectCB",btfy(ShareObject));
          callback(err,ShareObject);
        });
    },
    getByHash: function(req, res, next){
    	// if no valid accessToken return only file as download.
    	// if no valid accessToken return folder as zipfile.
    	// ~ if accessToken and add field is true just save the sharee to DB.

		var currUser = false;

    	async.series([
    		function getUserID(cb){
    			if(req.headers.accesstoken){
	    			UserController.getUserByToken(req.headers.accesstoken, function getUserByTokenCb(err,user){
	    				currUser = user.id;
	    				cb();
			    	});
		    	}else{
		    		cb();
		    	}
    		},
    		function retriveFile(cb){
    			module.exports.findByHash(req.params.hash, function(err,ShareObject){
    				if(ShareObject.fileId){
    					var result = ShareObject.fileId
    					if(result.isLive){
	    					fileName = result.versions[0].filenameTmp;
				    		fileNameOrig = result.filenameOrig;
				    		filePath = result.filePath;
				    		wholeFilePath = path.join(filePath, fileName);
				    		res.download(wholeFilePath, fileNameOrig);
				    		cb();
				    	}else{
				    		log.info("Requested file %s was deleted",result.id);
        					res.writeHead(404);
        					res.end();
        					return;
			    		}
			    	}
			    	// Folder needs three builder

    				// }else{
    				// 	ShareObject.folderId
    				// }
				});
    		}

    	],
        function onGetByHashEnd(err,result){
        	//log.debug("onGetByHashEnd: \n",btfy(myResult));
        	log.debug("onGetByHashEnd success");
        	if(err) log.error("Share Create Error ", err);
        	
    		res.writeHead(200);
			res.end();
			return;
        });

    },
    // materializeFolder(thisLevelID,parentPath,callback){
    // 	Folder.findOne(thisLevelID, function(err,subLevelFoler){
    // 		newFolder = path.join(parentPath, subLevelFoler.name);
    // 		fs.mkdir(newFolder, "0666", function(err){
    // 			if(err) log.error("materializeChildrenFolders folder name %s error: %s" err);
    // 			callback(newFolder,subLevelFoler.folders);
    // 		});
    // 	});
    // },
    // materializeFolderWithContent function(currUser,folderID,callback){
    // 	var tmpRootPath = fileLib.currUserTmpDir(currUser);
    // 	Folder.findOne(folderID, function(err,topLevelFoler){
    // 		topFolder = path.join(tmpRootPath, topLevelFoler.name);
    // 		fs.mkdir(topFolder, "0666", function(err){
    // 			if(err) log.error("materializeChildrenFolders folder name %s error: %s" err);
    // 			___.each(topLevelFoler.folders,function(value,key){
    // 				module.exports.materializeFolderWithContent(currUser,value,callback);
    // 			});
    		
    // 		});
    		
    // 	});
    // },
    deleteByHash: function(req, res, next){
    	// only issuer can delete
    }
}