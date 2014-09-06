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
	currUserTmpDir: function(currUserID){
		pathBase = config.get('filesystem:tempDir');
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
	}
}