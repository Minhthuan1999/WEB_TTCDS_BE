const db = require("../database/db");

class CategoryModel {
  create(data) {
    return new Promise((resolve, reject) => {
      db.query("INSERT INTO document_categories SET ?", data, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  }

  findAll() {
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM document_categories ORDER BY created_at DESC", (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }

  findById(id) {
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM document_categories WHERE id = ?", [id], (err, results) => {
        if (err) reject(err);
        resolve(results[0]);
      });
    });
  }

  update(id, data) {
    return new Promise((resolve, reject) => {
      db.query("UPDATE document_categories SET ? WHERE id = ?", [data, id], (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  }

  delete(id) {
    return new Promise((resolve, reject) => {
      db.query("DELETE FROM document_categories WHERE id = ?", [id], (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  }
}

module.exports = new CategoryModel();
