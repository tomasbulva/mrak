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
    get: function(id, callback) {
        console.log("get");
        // User.findOne(id, function(err, user) {
        //    callback(err, user);
        // });
    },
    create: function(req, callback) {
     	//app.use(busboy());
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
	    						log.debug(exists ? "it's there" : "is not there!");
	    						if(!exists){
	    							log.debug("createFileStruct: User directory %s doesn't exist we'll try to create it", currUserId);
									fileLib.currUserDirCreate(currUserId,function(result){
										if(result === undefined){
											log.debug("createFileStruct: User directory created!");
											cb();
										}
									});
									cb();
	    						}else{
	    							log.debug("createFileStruct: User directory %s exists", currUserId);
									cb();
	    						}
	    					});
						},
						function(cb){
							fileLib.currFileCheck(currUserId,origFileName,function(exists){
								log.debug(exists ? "it's there" : "is not there!");
								if(!exists){
									log.debug("createFileStruct: File directory %s doesn't exist we'll try to create it",origFileName);
									fileLib.currFileDirCreate(currUserId,origFileName,function(result){
										if(result === undefined){
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
					filenameTmp: fileNameTmp,
					filePath: structPath,
					virtualPath: 'user/',
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

				//console.dir(filedescription);
				cb();

	    	},
	    	function parallelStoreAction(cb) {
            	async.parallel([
            		function writeFileToDest(cb){
						var fstream = fs.createWriteStream(wholeFilePath);

			    		//theFile.pipe(fstream);
			    		fstream.write(finalBuffer);

			    		fstream.on('error', function(err) {
				        	log.error('fstream error: ',err);
				        });

				        fstream.on('close', function() {
							cb();
				        });
			    	},
			    	function writeFileInfoDB(cb){
			    		var fileinfo = new Files();
			    		fileinfo = ___.extend(fileinfo,filedescription)
			            fileinfo.save(function(err, filedeeds) {
							finalResult = filedeeds;
							if(err) log.error("writeFileInfoDB Error: ", err);
							//log.debug("writeFileInfoDB: ",filedeeds, util.inspect(filedeeds, { showHidden: true, depth: null }));
							cb();
							//callback(err, filedeeds);
						});
			    	}
            	],cb);
            }],
            function onFileCreateEnd(err,result){
            	log.debug("onFileCreateEnd: \n",util.inspect(finalResult, { showHidden: true, depth: null }));
            	//console.dir(finalResult);
            	callback(err,true);
            }
	    );
    }    
};