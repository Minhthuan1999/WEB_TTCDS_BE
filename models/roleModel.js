const db = require("../database/db");

class Role {
  getAll() {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM roles",
        (err, results) => {
          if (err) reject(err);
          resolve(results);
        }
      );
    });
  }
}

module.exports = new Role();
