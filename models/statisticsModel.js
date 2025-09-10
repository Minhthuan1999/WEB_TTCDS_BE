// models/statisticsModel.js
const db = require("../database/db");

class Statistics {
  create(data) {
    return new Promise((resolve, reject) => {
      db.query("INSERT INTO statistics SET ?", data, (err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    });
  }

  update(id, data) {
    return new Promise((resolve, reject) => {
      db.query("UPDATE statistics SET ? WHERE id = ?", [data, id], (err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    });
  }

  delete(id) {
    return new Promise((resolve, reject) => {
      db.query("DELETE FROM statistics WHERE id = ?", [id], (err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    });
  }

 findAll() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT s.*, c.name AS category_name
        FROM statistics s
        LEFT JOIN statistics_categories c ON s.category_id = c.id
        ORDER BY s.id DESC
      `;
      db.query(sql, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  findById(id) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT s.*, c.name AS category_name
        FROM statistics s
        LEFT JOIN statistics_categories c ON s.category_id = c.id
        WHERE s.id = ?
      `;
      db.query(sql, [id], (err, rows) => {
        if (err) return reject(err);
        resolve(rows?.[0]);
      });
    });
  }
}


module.exports = new Statistics();
