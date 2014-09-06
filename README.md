# API overview



 | legend
---|---
**\+** | already build
**\-** | needs to be build
**\~** | Future versions


### Files
state | API           | method     | description
   ---|---------------|------------|---
\+    | /file/upload  |   POST     |   upload file by current logged in user 
\-    | /file/move    |   POST     |   move file in or out of folders
\-    | /file/rename  |   POST     |   rename folder/s
\-    | /file/search  |   POST     |   file search
\+    | /file/list    |   GET      |   list all files
\+    | /file/:id     |   GET      |   download file by ID
\+    | /file/:id     |   DELETE   |   delete file -> just change of db flag


### Folders
state | API              | method    | description
   ---|------------------|-----------|---
\+ 	  | /folder/create   |  POST     |   create folder -> path 
\+    | /folder/move     |  POST     |   move folder -> id, path
\+    | /folder/rename   |  POST     |   rename folder -> id, new_name
\-    | /folder/tree     |  GET      |   return complete folder tree
\+    | /folder/:id      |  GET      |   folder info returns -> content, size, owner, sharee
\+    | /folder/:id      |  DELETE   |   delete folder


### Users
state | API | method | description
---|---|---|---
\+ | /user/create | POST | user sign up
\+ | /user/login | GET | user login -> returns accessToken in header
\+ | /user/logout | GET | user logout -> deletes accessToken reference from DB 
\+ | /user/inf | GET | logged-in/current user info
\- | /user/search | POST  | search user db by email
\- | /user/:user_id | GET | user info by ID -> will need special admin privilage

### Share
state | API | method | description
---|---|---|---
\- | /share/create | POST | create share record ID accepts (fileID, userID, [email], [password])
\- | /share/:file_id | DELETE | cancel sharing (will delete the file from all sharees if they have copy in theyir accounts)


8008313842
------------



# Examples

### User
signup
```
curl -v --data "username=bob&password=1234&firstname=Robert&lastname=Kennedy&email=bob.kennedy@email.com" http://localhost:8081/api/user/create
```

login
```
curl -v "http://localhost:8081/api/user/login?user=username&password=pass"
```

logout
```
curl -v --header "accessToken:=login-genrated-token=" "http://localhost:8081/api/user/logout"
```

info
```
curl -v --header "accessToken:=login-genrated-token=" "http://localhost:8080/api/user/inf"
```


### Files
upload
```
curl -i --header "accessToken:=login-genrated-token=" -F name=file -F filedata=@file.jpg http://localhost:8081/api/file/upload
```

download
```
curl -i --header "accessToken:=login-genrated-token=" http://localhost:8081/api/file/000000000000000000000000
```

delete
```
curl -i --header "accessToken:=login-genrated-token=" -X DELETE http://localhost:8081/api/file/000000000000000000000000
```

list all files owned by curr user
```
curl -i --header "accessToken:=login-genrated-token=" http://localhost:8081/api/file/list
```





