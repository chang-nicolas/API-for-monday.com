module.exports = app => {
  const users = require("../controllers/updateUser.controller.js");

  var router = require("express").Router();

  // Merge User with Mysql - Monday.com
  router.post("/", users.create);

  // Retrieve all User
  router.get("/", users.findAll);

  // Retrieve all published User
  router.get("/published", users.findAllPublished);

  // Retrieve a single User with id
  router.get("/:id", users.findOne);

  app.use('/update', router);
};
