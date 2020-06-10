module.exports = app => {
  const request = require("../controllers/requests-controller.js");

  var router = require("express").Router();

  // Create a new Request
  // -- POST host.name/api/reviews
  router.post("/", request.create);
  
  //find all requests
  // -- GET host.name/api/requests/
  router.get("/", request.findAll);
  
  //find a request by ISBN
  // -- GET host.name/api/requests/:isbn
  router.get("/isbn/:isbn", request.findByIsbn);

  //find all requests, or get requests by isbn
  // -- GET host.name/api/requests/:pk
  router.get("/:pk", request.findByPk); 

  //Increase a request by ISBN
  // -- PUT host.name/api/requests/increase/:isbn
  router.put("/increase/:isbn", request.increase);
  //update request
  // -- PUT host.name/api/requests/:isbn ***Body JSON names must be capital***
  router.put("/:pk", request.update);
  
    //maybe fill request and send emails and delete
  router.put("/isbn/:isbn", request.fillRequest);

  //delete specific request
  // -- DELETE host.name/api/requests/:isbn
  router.delete("/:pk", request.delete);

  app.use('/api/requests', router);
};
