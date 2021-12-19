const mysql = require("mysql");
const dbConfig = require("../config/db.config.js");

var connection = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "jupiler",
});

module.exports = connection;
