require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();

// const multer = require("multer");
// const upload = multer();

// app.use(upload.array());
// app.use(express.static("public"));

var corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ type: "*" }));
app.use(bodyParser.urlencoded({ extended: true }));

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// Home Route
app.get("/", (req, res) => {
  res.json({ message: "Jupiler Application.", routes: "/api" });
});

require("./app/routes/updateUser.routes.js")(app);
require("./app/routes/createUser.routes.js")(app);

// set port, listen for requests
const PORT = process.env.SERVER_PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
