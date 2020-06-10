# bookchainfrontend
```
This web app allows a user to interact with and modify both a backend database and a blockchain in
several ways. A user can request a private key that will be associated with an amount of tokens 
that they can use to claim books. Supported features include donating, requesting, claiming, and reporting books. 
Users can also view information related to specific books such as the title, authors, date published, and 
the number of pages. Reviews can be left about specific books and users can browse other reviews. Donations require
a user's private key and a specific ISBN. Similarly, requests need a user's private key and ISBN along 
with a certain number of tokens they are putting towards that request. When fulfilling a request, a user receives 
all tokens associated with that request. When claiming a book, a user must pay one token. Reporting books is 
also allowed to make sure that missing books are not still in the database or blockchain. Lastly, 
users can search through the available books to find one that they are looking for. 
```

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
