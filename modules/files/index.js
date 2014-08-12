var fs 				= require('fs');
var path 			= require('path');
var crypto 			= require('crypto');
var async 			= require('async');
var ___ 			= require("underscore");
var util 			= require('util');
var Files 			= require("./model");
var userController 	= require("../user");
var fileLib      	= require('./lib');
var utilities 		= require("../utilities");
var log 			= utilities.iLog(module);

module.exports = {
    getList: function(req, callback) {
        console.log("get");
        Files.find(function findAllFilesCb(){
        	log.debug("createFileStruct: result ", util.inspect(result, { showHidden: true, depth: null }));
        });
    },
    create: function(req, callback) {
     	log.debug('create file object reached');
     	var fstream;
     	var filedescription;
     	var currUserId;
     	var fstream;
     	var finalHash;
     	var origFileName;
     	var theFile;
     	var theMimeType;
     	var structPath;
     	var fileExt;
     	var fileNameTmp;
     	var wholeFilePath;
     	var fileSize;
     	var finalBuffer;
     	var virtualPathTmp = 'user/';

     	var finalResult;

	    async.series([
	    	function getUserId(cb){
	    		userController.getUserByToken(req.headers.accesstoken, function(err,currUser){
	    			log.debug("getUserId: ", currUser.id);
					currUserId = currUser.id;
					cb();
	    		});
	    	},
	    	function busboyReadFile(cb){
	    		req.pipe(req.busboy);
	    		log.debug("busboyReadFile beggining");
	    		req.busboy.on('file', function fileupload(fieldname, file, filename, transferEncoding, mimeType) {
					log.debug('busboyReadFile: onFile');

					// checksum hash for potentially large files
					var hash = crypto.createHash('md5');
					file.fileRead = [];

			        file.on('data', function(data) {
				    	log.info('busboyReadFile File [' + filename + '] got ' + data.length + ' bytes');
				    	
				    	// checksum is being updated with each new chunk of data
				    	hash.update(data, 'utf8');
				    	this.fileRead.push(data);
				    });

				    file.on('end', function(data) {
						log.debug('busboyReadFile File [' + filename + '] Finished');
						
						// final hash
						finalHash = hash.digest('hex');
						finalBuffer = Buffer.concat(this.fileRead);

						fileSize = finalBuffer.length;
						theMimeType = mimeType;
						origFileName = filename;
						theFile = file;
						cb();
					});
				});
	    	},
	    	function createFileStruct(cb){
	    			async.series([
	    				function(cb){
	    					fileLib.currUserDirCheck(currUserId,function(exists){
	    						log.debug(exists ? "currUserDirCheck %s dir it's there" : "currUserDirCheck %s dir is not there!",currUserId);
	    						if(!exists){
	    							log.debug("createFileStruct: Creating User directory %s ", currUserId);
									fileLib.currUserDirCreate(currUserId,function(result){
										log.debug("createFileStruct: result ", util.inspect(result, { showHidden: true, depth: null }));
										if(result === undefined || result === null ){
											log.debug("createFileStruct: User directory created!");
											cb();
										}
									});
	    						}else{
	    							log.debug("createFileStruct: User directory %s exists", currUserId);
									cb();
	    						}
	    					});
						},
						function(cb){
							fileLib.currFileCheck(currUserId,origFileName,function(exists){
								log.debug(exists ? "currFileCheck %s dir it's there" : "currFileCheck %s dir is not there!", origFileName);
								if(!exists){
									log.debug("createFileStruct: Creating File directory %s ",origFileName);
									fileLib.currFileDirCreate(currUserId,origFileName,function(result){
										if(result === undefined || result === null){
											log.debug("createFileStruct: File directory created!");
											cb();
										}
									});
								}else{
									log.debug("createFileStruct: File directory %s exists",origFileName);
									cb();
								}
							});
						}],
						function(err){
							structPath = fileLib.currFileDir(currUserId,origFileName);
							log.info("createFileStruct: User and File directory %s is created",structPath);
							cb();
						}
					);
	    	},
	    	function collectAdditionalInfo(cb){
	    		log.debug('collectAdditionalInfo begining');

	    		fileExt = utilities.getFileExtension(origFileName);
			    fileNameTmp = utilities.randomCharacterString(10)+'.'+fileExt;
				wholeFilePath = path.join(structPath, fileNameTmp);

	    		// file model
				filedescription = { 
					filenameOrig: origFileName,
					filePath: structPath,
					virtualPath: virtualPathTmp,
					users: {
						owner: currUserId,
						sharee: null
					},
					meta: {
						size: fileSize,
						mime: theMimeType,
						publ: true, // this will depend on user preferences in future
						hash: finalHash,
						ext: fileExt
					}
					// created: auto populated [default: now]
				}
				cb();

	    	},
	    	function parallelStoreAction(cb) {
            	async.parallel([
            		function writeFileToDest(cb){
						log.debug("writeFileToDest begining");
			    		fs.open(wholeFilePath, 'w', function(err, fd) {
						    if (err) {
						        log.error('fstream error: ',err);
						    } else {
						        fs.write(fd, finalBuffer, 0, finalBuffer.length, null, function(err) {
							        if (err) log.error('fstream error: ',err);
									fs.close(fd, function() {
							            log.debug("writeFileToDest fstream on close");
										cb();
							        });
							    });
						    }
						});
			    	},
			    	function writeToDB(cb){
			    		// async.series([
			    	// 		function writeFileInfoDB(cb){
					   //  		var fileinfo = new Files();
					   //  		fileinfo = ___.extend(fileinfo,filedescription)
					   //          fileinfo.save(function(err, filedeeds) {
								// 	finalResult = filedeeds;
								// 	if(err) log.error("writeFileInfoDB Error: \n", err);
								// 	log.debug("writeFileInfoDB File success: \n",filedeeds, util.inspect(filedeeds, { showHidden: true, depth: null }));
								// 	cb();
								// });
					   //  	},
					    	// function writeVersionInfoDB(cb){
					    		//var readingDBResult;

					    		// var query = {
					    		// 	filenameOrig: origFileName, 
					    		// 	virtualPath: virtualPathTmp,
					    		// 	users: {
					    		// 		owner: currUserId
					    		// 	}
					    		// }
					    		var query = {
					    			"filenameOrig": origFileName, 
					    			"virtualPath": virtualPathTmp,
					    			"users.owner": currUserId
					    		}

					    		log.debug("writeToDB query: \n",util.inspect(query, { showHidden: true, depth: null }));

					    		Files.findOne(query, function fileRecordFindOneCb(err, fileinfo) {
								    if(!err) {

								    	// file record doesn't exist yet, create new one
								        if(!fileinfo) {
											var fileinfo = new Files();
					    					fileinfo = ___.extend(fileinfo,filedescription);
					    					fileinfo.versions = [{
								    			filenameTmp: fileNameTmp,
								    			createDate: new Date()
								    		}];
								        }else{
								        	fileinfo.versions.unshift({
								    			filenameTmp: fileNameTmp,
								    			createDate: new Date()
								    		});
								        }
								        //contact.status = request.status;
								        //myversions = readingDBResult.versions;
							   			
								        //log.debug("writeToDB fileinfo: \n",util.inspect(fileinfo, { showHidden: true, depth: null }));

								        fileinfo.save(function writeFileUpdateCb(err) {
								            if(!err) {
								                log.debug("writeToDB writeFileUpdateCb success");
								                cb();
								            }
								            else {
								                log.debug("writeToDB writeFileUpdateCb error: \n", err);
								            }
								        });
								    }else{
								    	log.error("writeToDB writeFileUpdateCb file record lookup error: \n", err);
								    }
								});
					    	// }
			    		// ],cb)
			    	}
            	],cb);
            }],
            function onFileCreateEnd(err,result){
            	//log.debug("onFileCreateEnd: \n",util.inspect(result, { showHidden: true, depth: null }));
            	log.debug("onFileCreateEnd success")
            	callback(err,filedescription);
            }
	    );
    }    
};