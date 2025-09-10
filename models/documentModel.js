// const db = require("../database/db");

// class Document {
//   create(data) {
//     return new Promise((resolve, reject) => {
//       db.query("INSERT INTO documents SET ?", data, (err, result) => {
//         if (err) reject(err);
//         resolve(result);
//       });
//     });
//   }

//   findAll() {
//     return new Promise((resolve, reject) => {
//       db.query("SELECT * FROM documents ORDER BY created_at DESC", (err, results) => {
//         if (err) reject(err);
//         resolve(results);
//       });
//     });
//   }

//   findById(id) {
//     return new Promise((resolve, reject) => {
//       db.query("SELECT * FROM documents WHERE id = ?", [id], (err, results) => {
//         if (err) reject(err);
//         resolve(results[0]);
//       });
//     });
//   }

//   searchAdvanced({ name, number, month, year }) {
//   return new Promise((resolve, reject) => {
//     let sql = "SELECT * FROM documents WHERE 1=1";
//     const params = [];

//     if (name) {
//       sql += " AND name LIKE ?";
//       params.push(`%${name}%`);
//     }

//     if (number) {
//       sql += " AND number LIKE ?";
//       params.push(`%${number}%`);
//     }

//     if (month) {
//       sql += " AND month = ?";
//       params.push(month);
//     }

//     if (year) {
//       sql += " AND year = ?";
//       params.push(year);
//     }

//     db.query(sql, params, (err, results) => {
//       if (err) reject(err);
//       resolve(results);
//     });
//   });
// }


//   update(id, data) {
//     return new Promise((resolve, reject) => {
//       db.query("UPDATE documents SET ? WHERE id = ?", [data, id], (err, result) => {
//         if (err) reject(err);
//         resolve(result);
//       });
//     });
//   }

//   delete(id) {
//     return new Promise((resolve, reject) => {
//       db.query("DELETE FROM documents WHERE id = ?", [id], (err, result) => {
//         if (err) reject(err);
//         resolve(result);
//       });
//     });
//   }
// }

// module.exports = new Document();

// documentModel.js
// documentModel.js

//phần 2
// const db = require("../database/db");

// class Document {
//   create(data) {
//     return new Promise((resolve, reject) => {
//       db.query("INSERT INTO documents SET ?", data, (err, result) => {
//         if (err) reject(err);
//         resolve(result);
//       });
//     });
//   }

//   findAll() {
//     return new Promise((resolve, reject) => {
//       db.query(
//         "SELECT id, name, number, date, file_path, created_at FROM documents ORDER BY created_at DESC",
//         (err, results) => {
//           if (err) reject(err);
//           resolve(results);
//         }
//       );
//     });
//   }

//   findById(id) {
//     return new Promise((resolve, reject) => {
//       db.query(
//         "SELECT id, name, number, date, file_path, created_at FROM documents WHERE id = ?",
//         [id],
//         (err, results) => {
//           if (err) reject(err);
//           resolve(results[0]);
//         }
//       );
//     });
//   }

//   searchAdvanced({ name, number, date }) {
//     return new Promise((resolve, reject) => {
//       let sql = "SELECT id, name, number, date, file_path, created_at FROM documents WHERE 1=1";
//       const params = [];

//       if (name) {
//         sql += " AND name LIKE ?";
//         params.push(`%${name}%`);
//       }

//       if (number) {
//         sql += " AND number LIKE ?";
//         params.push(`%${number}%`);
//       }

//       if (date) {
//         const [year, month, day] = date.split("-");
//         sql += " AND YEAR(date) = ? AND MONTH(date) = ?";
//         params.push(year, month);
//       }

//       db.query(sql, params, (err, results) => {
//         if (err) reject(err);
//         resolve(results);
//       });
//     });
//   }

//   update(id, data) {
//     return new Promise((resolve, reject) => {
//       db.query("UPDATE documents SET ? WHERE id = ?", [data, id], (err, result) => {
//         if (err) reject(err);
//         resolve(result);
//       });
//     });
//   }

//   delete(id) {
//     return new Promise((resolve, reject) => {
//       db.query("DELETE FROM documents WHERE id = ?", [id], (err, result) => {
//         if (err) reject(err);
//         resolve(result);
//       });
//     });
//   }
// }

// module.exports = new Document();

//phần 3
// documentModel.js
const db = require("../database/db");

class Document {
  create(data) {
    return new Promise((resolve, reject) => {
      db.query("INSERT INTO documents SET ?", data, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  }

  findAll() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT d.*, c.id AS category_id, c.name AS category_name
        FROM documents d
        LEFT JOIN document_categories c ON d.category_id = c.id
        ORDER BY d.issued_date DESC
      `;
      db.query(sql, (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }

  findById(id) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT d.*, c.id AS category_id, c.name AS category_name
        FROM documents d
        LEFT JOIN document_categories c ON d.category_id = c.id
        WHERE d.id = ?
      `;
      db.query(sql, [id], (err, results) => {
        if (err) reject(err);
        resolve(results[0]);
      });
    });
  }

  searchAdvanced({ symbol, issued_date, effective_date, category_id, agency, signer, abstract }) {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT d.*, c.id AS category_id, c.name AS category_name
        FROM documents d
        LEFT JOIN document_categories c ON d.category_id = c.id
        WHERE 1=1
      `;
      const params = [];

      if (symbol) {
        sql += " AND d.symbol LIKE ?";
        params.push(`%${symbol}%`);
      }

      if (issued_date) {
        sql += " AND DATE_FORMAT(d.issued_date, '%d/%m/%Y') = ?";
        params.push(issued_date);
      }

      if (effective_date) {
        sql += " AND DATE_FORMAT(d.effective_date, '%d/%m/%Y') = ?";
        params.push(effective_date);
      }

      if (category_id) {
        sql += " AND d.category_id = ?";
        params.push(category_id);
      }

      if (agency) {
        sql += " AND d.agency LIKE ?";
        params.push(`%${agency}%`);
      }

      if (signer) {
        sql += " AND d.signer LIKE ?";
        params.push(`%${signer}%`);
      }

      if (abstract) {
        sql += " AND d.abstract LIKE ?";
        params.push(`%${abstract}%`);
      }

      db.query(sql, params, (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }

  update(id, data) {
    return new Promise((resolve, reject) => {
      db.query("UPDATE documents SET ? WHERE id = ?", [data, id], (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  }

  delete(id) {
    return new Promise((resolve, reject) => {
      db.query("DELETE FROM documents WHERE id = ?", [id], (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  }

  rawQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.query(sql, params, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }
}

module.exports = new Document();
