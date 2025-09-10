

const db = require("../database/db");

class Header {
  create(data) {
    return new Promise((resolve, reject) => {
      db.query("INSERT INTO headers SET ?", data, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }

  update(id, data) {
    return new Promise((resolve, reject) => {
      db.query("UPDATE headers SET ? WHERE id = ?", [data, id], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }

  delete(id) {
    return new Promise((resolve, reject) => {
      db.query("SELECT image FROM headers WHERE id = ?", [id], (err, result) => {
        if (err) return reject(err);
        const imagePath = result?.[0]?.image;
        db.query("DELETE FROM headers WHERE id = ?", [id], (err, res) => {
          if (err) return reject(err);
          resolve({ result: res, imagePath });
        });
      });
    });
  }

  findAll(isActive) {
    return new Promise((resolve, reject) => {
      let sql = "SELECT * FROM headers";
      const params = [];
      if (typeof isActive !== "undefined") {
        sql += " WHERE is_active = ?";
        params.push(isActive ? 1 : 0);
      }
      sql += " ORDER BY id DESC";
      db.query(sql, params, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  findById(id) {
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM headers WHERE id = ?", [id], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      });
    });
  }
}

module.exports = new Header();
