/*
+ already build
- needs to be build
~ Future versions


* Files

+ /files/upload     POST        upload file by current logged in user 
- /files/move       POST        move file in or out of folders
+ /files/folder     POST        create folder/s
- /files/rename     POST        create folder/s
- /files/search     POST        file search
+ /files/list       GET         list all files
+ /files/:id        GET         download file by ID
+ /files/:id        DELETE      delete file -> just change of db flag

* Users

+ /user/create      POST        user sign up
+ /user/login       GET         user login -> returns accessToken in header
+ /user/logout      GET         user logout -> deletes accessToken reference from DB 
+ /user/inf         GET         logged-in/current user info
- /user/search      POST        search user db by email
- /user/:user_id    GET         user info by ID -> will need special admin privilage

* Share

- /share/create     POST        create share record ID accepts (fileID, userID, [email], [password])
- /share/:file_id   DELETE      cancel sharing (will delete the file from all sharees if they have copy in theyir accounts)

*/



var files 		= require("../files");
var user 		= require("../user");
var auth        = require('../auth');
var busboy      = require('connect-busboy');
var utilities 	= require("../utilities");
var log 		= utilities.iLog(module);
var util        = require('util');


var express 	= require("express");
var app 		= module.exports = express(); // we export new express app here!

/*
 *
 *   Files
 *
 */
app.use('/files/upload', busboy()); 
app.post('/files/upload', auth.authorise, files.create); 
// app.post('/files/folder', auth.authorise, files.createFolder); // --
app.get('/files/list', auth.authorise, files.getList); 
app.get('/files/:id', auth.authorise, files.getFile); 
app.delete('/files/:id', auth.authorise, files.deleteFile); 

/*
 *
 *   Users
 *
 */ 
app.post('/user/create', user.create); 
app.get('/user/login', user.login); 
app.get('/user/logout', auth.authorise, user.logout); 
app.get('/user/inf', auth.authorise, user.currUserInfo); 




