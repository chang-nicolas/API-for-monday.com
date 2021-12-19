const multiparty = require("multiparty");

module.exports = (app) => {
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

  app.use("/update", router);
  // app.post("/update", async function (req, res) {
  //   let form = new multiparty.Form();
  //   console.log("FIELDS");
  //   // var userId, cardNumber;
  //   await form.parse(req, async (err, fields, files) => {
  //     console.log("FIELDS");
  //     console.log("FIELDS", fields);
  //     var userId = await fields.userId.toString();
  //     var cardNumber = await fields.cardNumber.toString();
  //   });

  //   console.log(userId);
  // });
};
