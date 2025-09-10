// models/departmentModel.js
const db = require("../database/db");

class Department {
  create(data) {
    return new Promise((resolve, reject) => {
      db.query("INSERT INTO departments SET ?", data, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }

  update(id, data) {
    return new Promise((resolve, reject) => {
      db.query("UPDATE departments SET ? WHERE id = ?", [data, id], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }

  delete(id) {
    return new Promise((resolve, reject) => {
      db.query("DELETE FROM departments WHERE id = ?", [id], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }

  // ⬇️ KHÔNG nhận isActive nữa
  findAll() {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM departments ORDER BY sort_order ASC, id DESC";
      db.query(sql, [], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }

  findById(id) {
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM departments WHERE id = ?", [id], (err, result) => {
        if (err) return reject(err);
        resolve(result?.[0] || null);
      });
    });
  }

  // ===== Phục vụ API cơ cấu tổ chức (không có image/is_active ở phòng) =====
  findAllWithStaff() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT d.id did, d.name dname, d.description, d.sort_order,
               s.id sid, s.name sname, s.position, s.email, s.phone, s.image simg,
               s.bio, s.sort_order sorder
        FROM departments d
        LEFT JOIN staff s ON s.department_id = d.id
        ORDER BY d.sort_order, d.id, s.sort_order, s.id
      `;
      db.query(sql, (err, rows) => (err ? reject(err) : resolve(rows)));
    });
  }

  findByIdWithStaff(id) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT d.id did, d.name dname, d.description, d.sort_order,
               s.id sid, s.name sname, s.position, s.email, s.phone, s.image simg,
               s.bio, s.sort_order sorder
        FROM departments d
        LEFT JOIN staff s ON s.department_id = d.id
        WHERE d.id = ?
        ORDER BY s.sort_order, s.id
      `;
      db.query(sql, [id], (err, rows) => (err ? reject(err) : resolve(rows)));
    });
  }
}

module.exports = new Department();
