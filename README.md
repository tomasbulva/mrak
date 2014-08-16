# API overview

|--------------------------|
| \+ already build\        |
| \- needs to be build\    |
| \~ Future versions\      |
|--------------------------|


* Files
+    /files/upload                 POST     // upload file by current logged in user
-    /files/move                   POST     // move file in or out of folders
+    /files/folder                 POST     // create folder/s
-    /files/rename                 POST     // create folder/s
-    /files/search                 POST     // file search
+    /files/list                   GET      // list all files
+    /files/:id                    GET      // download file by ID
+    /files/:id                    DELETE   // delete file -> just change of dbFlag flag

* Users
+    /user/create                  POST     // user sign up
+    /user/login                   GET      // user login -> returns accessToken in header
+    /user/logout                  GET      // user logout -> deletes accessToken reference from DB 
+    /user/inf                     GET      // logged-in/current user info
-    /user/search/                 POST     // search user db by email
-    /user/:user_id                GET      // user info by ID      
                                               will need special admin privilage

* Share
-    /share/create                 POST     // create share record ID (not mongo id) 
                                               accepts (fileID, userID, [email], [password])
-    /share/:file_id               DELETE   // cancel sharing (will delete the file 
                                               from all sharees if they have copy in theyir accounts)



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
Examples:

* Files
+ /files/upload            TEST          ( curl -i --header "accessToken:8cmvoyMUwks4cidezTAkJzrq8XYWj6hsCRLeQD4plsQ=" -F name=file -F filedata=@back.jpg http://localhost:8081/api/files/upload )


* Users
+ /user/create             POST          ( curl -v --data "username=tom&password=1234&firstname=Tomas&lastname=Bulva&email=tom.bulva@gmail.com" http://localhost:8081/api/user/create )

