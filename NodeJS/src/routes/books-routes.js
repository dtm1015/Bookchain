module.exports = app => {
  const books = require("../controllers/book-controller.js");

  var router = require("express").Router();
  
  // Create a new Book in the database with quantity =0
  // -- POST host.name/api/books/init
  router.post("/init/", books.init);
  
  // Create a new Book
  // -- POST host.name/api/books
  router.post("/", books.create);

  //find a book by ISBN
  // -- GET host.name/api/books/:isbn
  router.get("/:isbn", books.findByIsbn);

  //find all books, or find all books by a given author
  // -- GET host.name/api/books?author=author name
  router.get("/", books.findAll);

  //update book quantity
  // -- PUT host.name/api/books/:isbn
  router.put("/:isbn", books.updateQuantity);

  //donate a book
  // -- PUT host.name/api/books/donate/:isbn
  router.put("/donate/:isbn", books.donate);

  //delete specific book
  // -- DELETE host.name/api/books/:isbn
  router.delete("/:isbn", books.delete);

  //report a specific book as missing
  // -- POST host.name/api/books/:isbn
  router.post("/report/", books.reportMissing);

//get a user's balance
  // --POST host.name/api/books/balance
  router.post("/balance", books.balance);

  //Internal validation route
  router.post("/validate", books.validate);

  //Get a new key
  router.get("/key/new", books.newkey);

  app.use('/api/books', router);
}
