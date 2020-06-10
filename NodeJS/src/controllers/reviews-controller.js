// import sequelize from '../models';
const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize("postgres://kronk:GfEuJUBq37jWU3tgD48mHQ2@localhost:5432/bookchain_test");
const Reviews = require("../models/Reviews.js")(sequelize, DataTypes);

//create new review
exports.create = (req, res) => {
  if (!req.body.isbn) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  const review = {
      Book_ID: req.body.isbn,
      Text: req.body.text,
      Rating: req.body.rating,
      Title: req.body.title,
      Name: req.body.name
  };

  Reviews.create(review)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the review."
    });
  });
};

//find average rating
exports.avgRating = (req, res) => {
  const isbn = req.params.isbn;

  Reviews.findAll({
    where : {
      Book_ID: isbn
    }
  }).then(data => {
      if(data != "[]"){
        const length = data.length;
        var rating = 0;

        for(var i = 0; i < length; i++){
            rating += data[i].dataValues.Rating;
        }
        rating = rating / length;
        const response = `{"avgRating": ${rating}}`;
        res.json(response);
      }
      else{
        res.send();
      }
  }).catch(err => {
      res.status(500).send({
        message: "Error retrieving average rating"
      });
    });
};

//find reviews by book
exports.findByIsbn = (req, res) => {
  const isbn = req.params.isbn;

  Reviews.findAll({
    where : {
      Book_ID: isbn
    }
  })
  .then(data => {
    res.json(data);
  })
  .catch(err => {
    res.status(500).send({
      message:
        err.message || "Error retrieving Reviews with isbn=" + isbn
    });
  });
};

//find review by primary key
exports.findByPk = (req, res) => {
  const pk = req.params.pk;
  Reviews.findByPk(pk)
    .then(data => {
      res.json(data);
  })
  .catch(err => {
    res.status(500).send({
      message: "Error retrieving Review with pk=" + pk
    });
  });
};

//update a Review
exports.update = (req, res) => {
  const pk = req.params.pk;

  Reviews.update(req.body, {
    where : {Review_ID: pk}
  }).then(num => {
    if (num == 1) {
      res.send({
        message: "Review was updated successfully."
      });
    } else {
      res.send({
        message: `Cannot update Review with pk=${pk}. Either the review was not found or request body is empty!`
      });
    }
  })
  .catch(err => {
    res.status(500).send({
      message: "Error updating review with pk=" + pk
    });
  });
};

//DELETE a review
exports.delete = (req, res) => {
  const pk = req.params.pk;

  Reviews.destroy({
    where: { Review_ID: pk }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Review was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete review with pk=${pk}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Review with pk=" + pk
      });
    });
};
