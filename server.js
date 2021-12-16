require('dotenv').config();
const express = require("express");
const cors = require("cors");

const app = express();

var corsOptions = {
  origin: "*"
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Home Route
app.get("/", (req, res) => {
  res.json({ message: "Jupiler Application.", routes: "/api"});
});

require("./app/routes/updateUser.routes.js")(app);
require("./app/routes/createUser.routes.js")(app);

// set port, listen for requests
const PORT = process.env.SERVER_PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
