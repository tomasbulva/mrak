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
        log.debug("file/index.js > getList");
        Files.find({}).populate('users.owner').exec(function findAllFilesCb(err,result){
        	if (err) log.error('findAllFilesCb error: \n',err);
        	log.debug("findAllFilesCb: result ", util.inspect(result, { showHidden: true, depth: null }));
        	
        	var i = 0;
        	cleanResult = [];
        	___.each(result,function(value, key){
        		if(value.isLive === true){
	        		cleanResult[i] = {
	        			fileName: value.filenameOrig,
						fileOwner: value.users.owner.username,
						resourceId: value.versions[0].id,
						size: value.meta.size,
						fileCreated: value.created,
						fileModified: value.versions[0].created,
						versionsTotal: value.versions.length
	        		}
	        		i++;
        		}
        	});

        	callback(null,cleanResult);
        });
    },
    getFile: function(req, callback){
    	//log.debug("file/index.js > getFile");
    	//log.debug("req.params.id \n",util.inspect(req.params.id, { showHidden: true, depth: null }))
    	var fileName;
		var fileNameOrig;
		var filePath;
		var wholeFilePath;

    	Files.findOne({"versions._id": req.params.id},function(err,result){
    		//log.debug("Files.findOne result \n",util.inspect(result.versions[0].filenameTmp, { showHidden: true, depth: null }));
    		
    		if(!err){
	    			if(!result){
	    				Files.findOne({"_id": req.params.id},function(err,result){
	    					if(result.isLive){
		    					fileName = result.versions[0].filenameTmp;
					    		fileNameOrig = result.filenameOrig;
					    		filePath = result.filePath;
					    		wholeFilePath = path.join(filePath, fileName);
					    	}else{
				    			callback({"writeHead":404},null, null);
				    		}
	    				});
	    			}else{
	    				if(result.isLive){
							fileName = result.versions[0].filenameTmp;
				    		fileNameOrig = result.filenameOrig;
				    		filePath = result.filePath;
				    		wholeFilePath = path.join(filePath, fileName);    				
				    	}else{
			    			callback({"writeHead":404},null, null);
			    		}
	    			}

	    			callback(false,wholeFilePath, fileNameOrig);
    		}else{
    			log.error('getFile (by id: %s) error %s: ',req.params.id,err);
    		}

    	}); //findOne end

    },
    deleteFile: function(req, callback) {
    	Files.findOne({"versions._id": req.params.id},function(err,fileinfo){
			//log.debug("Files.findOne result \n",util.inspect(result.versions[0].filenameTmp, { showHidden: true, depth: null }));
			
			if(!err){
	    			if(!fileinfo){
	    				Files.findOne({"_id": req.params.id},function(err,fileinfo){
	    					if(fileinfo.isLive){
		    					fileinfo.isLive = false;
					    	}else{
				    			callback(false, {"writeHead":404});
				    		}
	    				});
	    			}else{
	    				if(fileinfo.isLive){
							 fileinfo.isLive = false;			
				    	}else{
			    			callback(false, {"writeHead":404});
			    		}
	    			}
	    			fileinfo.save(function fileDeleteUpdateCb(err){
	    				if(!err) {
			                log.debug("deleteFile fileDeleteUpdateCb success");
			                callback(false,{"writeHead":200});
			            }
	    			});
	    			
			}else{
				log.error('getFile (by id: %s) error %s: ',req.params.id,err);
			}
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
					type: "file",
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
					    		var query = {
					    			"filenameOrig": origFileName, 
					    			"virtualPath": virtualPathTmp,
					    			"users.owner": currUserId
					    		}

					    		//log.debug("writeToDB query: \n",util.inspect(query, { showHidden: true, depth: null }));

					    		Files.findOne(query, function fileRecordFindOneCb(err, fileinfo) {
								    if(!err) {

								    	// file record doesn't exist yet, create new one
								        if(!fileinfo) {
											var fileinfo = new Files();
					    					fileinfo = ___.extend(fileinfo,filedescription);
					    					fileinfo.versions = [{
								    			filenameTmp: fileNameTmp,
								    			created: new Date()
								    		}];
								        }else{
								        	if(!fileinfo.isLive){
									        	var i=0;
									        	___.each(fileinfo.versions,function(value, key){
									        		log.debug("___.each(fileinfo.versions value:",value);
									        		fileinfo.versions[i].deleted = true;
									        		i++;
									        	});
									        	fileinfo.isLive = true;
								        	}
								        	fileinfo.versions.unshift({
								    			filenameTmp: fileNameTmp,
								    			created: new Date()
								    		});
								        }
							   			
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