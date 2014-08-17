# API overview



 | legend
---|---
**\+** | already build
**\-** | needs to be build
**\~** | Future versions


### Files
state | API           | method | description
   ---|---------------|--------|---
\+    | /files/upload | POST   | upload file by current logged in user 
\-    | /files/move   | POST   | move file in or out of folders
\+    | /files/folder | POST   | create folder/s
\-    | /files/rename | POST   | create folder/s
\-    | /files/search | POST   | file search
\+    | /files/list   | GET    | list all files
\+    | /files/:id    | GET    | download file by ID
\+    | /files/:id    | DELETE | delete file -> just change of db flag

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



------------



# Examples

### User
signup
```
curl -v --data "username=tom&password=1234&firstname=Tomas&lastname=Bulva&email=tom.bulva@gmail.com" http://localhost:8081/api/user/create
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
curl -i --header "accessToken:=login-genrated-token=" -F name=file -F filedata=@file.jpg http://localhost:8081/api/files/upload
```

download
```
curl -i --header "accessToken:=login-genrated-token=" http://localhost:8081/api/files/000000000000000000000000
```

delete
```
curl -i --header "accessToken:=login-genrated-token=" -X DELETE http://localhost:8081/api/files/000000000000000000000000
```

list all files owned by curr user
```
curl -i --header "accessToken:=login-genrated-token=" http://localhost:8081/api/files/list
```





