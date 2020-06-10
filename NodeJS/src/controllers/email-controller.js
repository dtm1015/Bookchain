const { Sequelize, Model, DataTypes } = require("sequelize");
const sequelize = new Sequelize("postgres://kronk:GfEuJUBq37jWU3tgD48mHQ2@l@localhost:5432/Capstone-Test");

const db = require("../models");
const Emails = require("../models/Request_Emails.js")(sequelize, DataTypes);
const Op = db.sequelize.Op;
const axios = require('axios');

const mailer = require('nodemailer');

exports.create = (req, res) => {
  if (!req.body.Email_address) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  const email = {
      Request_ID: req.body.Request_ID,
      Email_address: req.body.Email_address
  };

  Emails.create(email)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the email address."
    });
  });
};


//find reviews by book
exports.findEmails = (req, res) => {
  if (!req.params.Request_ID) {
    res.status(400).send({
      message: "Must include request ID!"
    });
    return;
  }
  const request = req.params.Request_ID;

  Emails.findAll({
    attributes: ['Email_address'],
    where : {
      Request_ID: request
    }
  })
  .then(data => {
    res.json(data);
  })
  .catch(err => {
    res.status(500).send({
      message:
        err.message || "Error retrieving addresses with id=" + request
    });
  });
};

exports.sendEmails = (req, res) => {
  if (!req.params.Request_ID) {
    res.status(400).send({
      message: "Must include a request ID!"
    });
    return;
  }

  const request = req.params.Request_ID;

  axios.get(`http://localhost:3000/api/emails/${request}`)
  .then(response => {
        var data = response.data;
        var recipients = "";
        const length = data.length;

        for(var i = 0; i < length; i++){
          recipients = recipients.concat(data[i].Email_address);
          if(i < length - 1){
            recipients = recipients.concat(", ");
          }
        }
        if(recipients){
          (async () => {
            let testAccount = await mailer.createTestAccount();

            // create reusable transporter object using the default SMTP transport
            let transporter = mailer.createTransport({
              host: "smtp.ethereal.email",
              port: 587,
              secure: false, // true for 465, false for other ports
              auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass // generated ethereal password
              }
            });

            // verify connection configuration
            transporter.verify(function(error, success) {
              if (error) {
                console.log(error);
              } else {
                console.log("Server is ready to take our messages");
              }
            });

            let info = await transporter.sendMail({
              from: '"Book Chain" <bookchainio@gmail.com>',
              to: recipients,
              subject: 'Request Filled',
              text: 'A book you were interested in has beeen donated!'
            });

            console.log(info);
          })();
          res.send("Emails sent");
      }
      else{
        res.send("No recipients listed");
      }
  })
  .catch(error => {
    console.log(error);
  });
};
