const db = require("../database/db");

class Target {
  create(data) {
    return new Promise((resolve, reject) => {
      db.query("INSERT INTO targets SET ?", data, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }

  findAll() {
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM targets ORDER BY id DESC", (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  findById(id) {
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM targets WHERE id = ?", [id], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      });
    });
  }

  update(id, data) {
    return new Promise((resolve, reject) => {
      db.query("UPDATE targets SET ? WHERE id = ?", [data, id], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }

  delete(id) {
    return new Promise((resolve, reject) => {
      db.query("DELETE FROM targets WHERE id = ?", [id], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }
}

module.exports = new Target();
