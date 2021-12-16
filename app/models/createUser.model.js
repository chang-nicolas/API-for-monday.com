const sql = require("./db.js");

// constructor
const User = function(user) {
  this.userId = user.userId;
  this.mondayId = user.mondayId;
  this.status = user.status;
};

User.create = (newUser, result) => {
  sql.query("INSERT INTO users SET ?", newUser, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    console.log("created user: ", { success: true, ...newUser });
    result(null, { success: true, ...newUser });
  });
};

module.exports = User;