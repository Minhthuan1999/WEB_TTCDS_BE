const db = require("../database/db");

class StatisticsCategory {
  create(data) {
    return new Promise((resolve, reject) => {
      db.query("INSERT INTO statistics_categories SET ?", data, (err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    });
  }

  update(id, data) {
    return new Promise((resolve, reject) => {
      db.query("UPDATE statistics_categories SET ? WHERE id = ?", [data, id], (err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    });
  }

  delete(id) {
    return new Promise((resolve, reject) => {
      db.query("DELETE FROM statistics_categories WHERE id = ?", [id], (err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    });
  }

  findAll() {
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM statistics_categories ORDER BY id DESC", [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  findById(id) {
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM statistics_categories WHERE id = ?", [id], (err, rows) => {
        if (err) return reject(err);
        resolve(rows?.[0]);
      });
    });
  }
}

module.exports = new StatisticsCategory();
