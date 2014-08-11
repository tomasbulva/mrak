var path 			= require('path');
var fs 				= require('fs');
var async 			= require('async');
var files 			= require("../files");
var user 			= require("../user");
var config          = require('../config');
var utilities 		= require("../utilities");
var log 			= utilities.iLog(module);

/*
	
	The idea: 
	Every user is a folder named as userID string in file system (config->filesystem).
	Every file is a folder with fileID.

*/


module.exports = {
	currUserDir: function(currUserID){
		pathBase = config.get('filesystem:uploadDir');
		return path.join(global.ServerRootDir+'/'+pathBase+'/'+currUserID);
	},
	currFileDir: function(currUserID,currFileNameOrig){
		pathBase = config.get('filesystem:uploadDir');
		return path.join(global.ServerRootDir+'/'+pathBase+'/'+currUserID+'/'+currFileNameOrig);
	},
	currUserDirCheck: function(currUserID,cb){
		// Perform test whether the current user directory exists.
		var path = module.exports.currUserDir(currUserID);
		fs.exists(path,cb);
	},
	currUserDirCreate: function(currUserID,cb){
		// Create current user directory if it does not exists.
		var path = module.exports.currUserDir(currUserID);
		fs.mkdir(path,cb);
	},
	currFileCheck: function(currUserID,currFileNameOrig,cb){
		// Perform test wherher the current file has existing structure build.
		var path = module.exports.currFileDir(currUserID,currFileNameOrig);
		fs.exists(path,cb);
	},
	currFileDirCreate: function(currUserID,currFileNameOrig,cb){
		// Create new file folder.
		var path = module.exports.currFileDir(currUserID,currFileNameOrig);
		fs.mkdir(path,cb);
	},
	currFileLogistics: function(currUserID,currFileNameOrig,callback){
		// Set of tests and operations to write each file.
		var m = module.exports;

		async.series([
			function(cb){
				if(!m.currUserDirCheck(currUserID,cb)){
					log.debug("User directory %s doesn't exist we'll try to create it", currUserID);
					m.currUserDirCreate(currUserID,cb);
					cb();
				}
				else{
					log.debug("User directory %s exists", currUserID);
					cb();
				}
			},
			function(cb){
				if(!m.currFileCheck(currUserID,currFileNameOrig,cb)){
					log.debug("File directory %s doesn't exist we'll try to create it",currFileNameOrig);
					m.currFileDirCreate(currUserID,currFileNameOrig,cb);
					cb();
				}else{
					log.debug("File directory %s exists",currFileNameOrig);
					cb();
				}
			}],
			function(err){
				//finishing the series
				//if(err) log.error(err);

				var path = m.currFileDir(currUserID,currFileNameOrig);
				log.info("User and File directory %s is created",path);
				callback(err,path);
			});


		// if(!){
		// 	log.debug("User directory %s doesn't exist we'll try to create it", currUserID);
		// 	createDir = m.currUserDirCreate(currUserID);
		// 	log.debug("createDir ",createDir);
		// 	if(createDir !== undefined){
		// 		log.error("Error, User directory not created");
		// 		return false;
		// 	}else{
		// 		log.debug("User directory %s should be created", currUserID);
		// 	}
		// }else if(!m.currFileCheck(currUserID,currFileNameOrig)){
		// 	log.debug("File directory %s doesn't exist we'll try to create it",currFileNameOrig);
		// 	if(m.currFileDirCreate(currUserID,currFileNameOrig) !== undefined){
		// 		log.error("Error, File directory not created");
		// 		return false;
		// 	}else{
		// 		log.debug("File directory %s should be created", currFileNameOrig);
		// 	}
		// }else{
		// 	var path = m.currFileDir(currUserID,currFileNameOrig);
		// 	log.info("User and File directory %s is created",path);
		// 	return path;
		// }
	}

}