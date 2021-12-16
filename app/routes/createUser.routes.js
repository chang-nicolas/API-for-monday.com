module.exports = app => {
    const users = require("../controllers/createUser.controller.js");
  
    var router = require("express").Router();
  
    // Create User (MYSQL)
    router.post("/", users.create);
  
    app.use('/create', router);
  };
  