module.exports = app => {
  const review = require("../controllers/reviews-controller.js");

  var router = require("express").Router();

  // Create a new Review
  // -- POST host.name/api/reviews
  router.post("/", review.create);

  //find a review by ISBN
  // -- GET host.name/api/reviews/:isbn
  router.get("/isbn/:isbn", review.findByIsbn);

  //find review by PK
  // -- GET host.name/api/reviews/:pk
  router.get("/:pk", review.findByPk);
   
  //get average rating for a book
  // -- GET host.name/api/reviews/ratings/:isbn
  router.get("/ratings/:isbn", review.avgRating);

  //update review
  // -- PUT host.name/api/reviews/:isbn ***Body JSON names must be capital***
  router.put("/:pk", review.update);

  //delete specific review
  // -- DELETE host.name/api/reviews/:isbn
  router.delete("/:pk", review.delete);

  app.use('/api/reviews', router);
};
