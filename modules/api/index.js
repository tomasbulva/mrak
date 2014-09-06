/*
+ already build
- needs to be build
~ Future versions


* Files

+ /file/upload     POST        upload file by current logged in user 
- /file/move       POST        move file in or out of folders
- /file/rename     POST        rename file
- /file/search     POST        file search
+ /file/list       GET         list all files
+ /file/:id        GET         download file by ID
+ /file/:id        DELETE      delete file -> just change of db flag

* Folders

+ /folder/create     POST        create folder -> path 
+ /folder/move       POST        move folder -> id, path
+ /folder/rename     POST        rename folder -> id, new_name
- /folder/tree       GET         return complete folder tree
+ /folder/:id        GET         folder info returns -> content, size, owner, sharee
+ /folder/:id        DELETE      delete folder

* Users

+ /user/create      POST        user sign up (needs foolproof for no post data passing)
+ /user/login       GET         user login -> returns accessToken in header
+ /user/logout      GET         user logout -> deletes accessToken reference from DB 
+ /user/inf         GET         logged-in/current user info
- /user/search      POST        search user db by email
- /user/:user_id    GET         user info by ID -> will need special admin privilage

* Share

- /create     POST        create share record ID accepts (fileID, userID, [email], [password])
- /:file_id   GET         get shared file/folder
- /:file_id   DELETE      cancel sharing (will delete the file from all sharees if they have copy in theyir accounts)

*/



var files 		= require("../files");
var folders     = require("../folders");
var share 		= require("../share");
var user 		= require("../user");
var auth        = require('../auth');
var busboy      = require('connect-busboy');


var express 	= require("express");
var app 		= module.exports = express(); // we export new express app here!

/*
 *
 *   Files
 *
 */
app.use('/file/upload', busboy()); 
app.post('/file/upload', auth.authorise, files.create); 
app.get('/file/list', auth.authorise, files.getList); 
app.get('/file/:id', auth.authorise, files.getFile); 
app.delete('/file/:id', auth.authorise, files.deleteFile); 

/*
 *
 *   Folders
 *
 */
app.post('/folder/create', auth.authorise, folders.create); //     POST        create folder -> path 
app.post('/folder/move', auth.authorise, folders.move);     //     POST        move folder -> id, path
app.post('/folder/rename', auth.authorise, folders.rename); //     POST        rename folder -> id, new_name
app.get('/folder/tree', auth.authorise, folders.tree);      //     GET         return complete folder tree
app.get('/folder/:id', auth.authorise, folders.getFolder);  //     GET         folder info returns -> content, size, owner, sharee
app.delete('/folder/:id', auth.authorise, folders.delete); 


/*
 *
 *   Users
 *
 */ 
app.post('/user/create', user.create); 
app.get('/user/login', user.login); 
app.get('/user/logout', auth.authorise, user.logout); 
app.get('/user/inf', auth.authorise, user.currUserInfo); 

/*
 *
 *   Share
 *
 */ 
app.post('/share/create', auth.authorise, share.create);


