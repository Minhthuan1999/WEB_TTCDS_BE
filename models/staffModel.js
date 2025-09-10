// models/staffModel.js
const db = require("../database/db");

class Staff {
  create(data) {
    return new Promise((resolve, reject) => {
      db.query("INSERT INTO staff SET ?", data, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }

  update(id, data) {
    return new Promise((resolve, reject) => {
      db.query("UPDATE staff SET ? WHERE id = ?", [data, id], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }

  // Trả về tên file ảnh để controller xóa trên ổ đĩa
  delete(id) {
    return new Promise((resolve, reject) => {
      db.query("SELECT image FROM staff WHERE id = ?", [id], (err, rows) => {
        if (err) return reject(err);
        const imagePath = rows?.[0]?.image || null;
        db.query("DELETE FROM staff WHERE id = ?", [id], (err2, res) => {
          if (err2) return reject(err2);
          resolve({ result: res, imagePath });
        });
      });
    });
  }

  // ?department_id= lọc theo phòng ban (tuỳ chọn)
  findAll(filters = {}) {
    return new Promise((resolve, reject) => {
      let sql = `SELECT s.*, d.name AS department_name
                 FROM staff s JOIN departments d ON s.department_id = d.id`;
      const params = [];
      if (filters.department_id) {
        sql += " WHERE s.department_id = ?";
        params.push(Number(filters.department_id));
      }
      sql += " ORDER BY d.sort_order ASC, s.sort_order ASC, s.id DESC";
      db.query(sql, params, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }

  findById(id) {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT s.*, d.name AS department_name
         FROM staff s JOIN departments d ON s.department_id = d.id
         WHERE s.id = ?`,
        [id],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows?.[0] || null);
        }
      );
    });
  }
}

module.exports = new Staff();
