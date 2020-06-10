module.exports = app => {
  const emails = require("../controllers/email-controller.js");

  var router = require("express").Router();

  // Create a new email address
  // -- POST host.name/api/emails
  router.post("/", emails.create);

  //send emails for a specific request
  router.post("/send/:Request_ID", emails.sendEmails);

  //find emials for a specific request
  // -- GET host.name/api/books/:isbn
  router.get("/:Request_ID", emails.findEmails);

  app.use('/api/emails', router);
};
