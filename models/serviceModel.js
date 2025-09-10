// const db = require('../database/db')

//     class Service {

//         getAll() {
//             return new Promise((resolve, reject) => {
//                 db.query('SELECT * FROM services', (err, results) => {
//                     if (err) reject(err)
//                     resolve(results)
//                 } )
//             })    
//         }



//         getById(id) {
//             return new Promise((resolve, reject) => {
//                 db.query('SELECT * FROM services WHERE service_id = ?', [id], (error, results) => {
//                     if (error) reject(error)
//                     resolve(results[0])
//                 })
//             })
//         }

//         create(service) {
//             return new Promise((resolve, reject) => {
//                 db.query('INSERT INTO services SET ?', service, (err, result) => {
//                     if (err) reject(err);
//                     resolve(result)
//                 })
//             })
//         }

//         delete(id) {
//             return new Promise((resolve, reject) => {
//                 db.query('DELETE FROM services WHERE service_id = ?', [id], (error, results) => {
//                     if(error) reject(error);
//                     resolve(results)
//                 })
//             })  
//         }

//         update(id, service) {
//             return new Promise((resolve, reject) => {
//                 db.query('UPDATE services SET ? WHERE service_id = ?', [service, id], (error, results) => {
//                     if(error) reject(error);
//                     resolve(results)
//                 })
//             })
//         }

        


//     }

// module.exports = new Service();

/// // models/serviceModel.js
// models/serviceModel.js
const db = require('../database/db');

class ServiceCategory {
  create(data) {
    return new Promise((resolve, reject) => {
      db.query('INSERT INTO service_categories SET ?', data, (err, result) => {
        if (err) return reject(err);
        resolve(result); // { insertId, ... }
      });
    });
  }

  update(id, data) {
    return new Promise((resolve, reject) => {
      db.query('UPDATE service_categories SET ? WHERE sid = ?', [data, id], (err, result) => {
        if (err) return reject(err);
        resolve(result); // { affectedRows, ... }
      });
    });
  }

  delete(id) {
    return new Promise((resolve, reject) => {
      db.query('SELECT image FROM service_categories WHERE sid = ?', [id], (err, rows) => {
        if (err) return reject(err);
        const imagePath = rows?.[0]?.image || null;

        db.query('DELETE FROM service_categories WHERE sid = ?', [id], (err2, res) => {
          if (err2) return reject(err2);
          resolve({ result: res, imagePath }); // để controller xóa file vật lý
        });
      });
    });
  }

  findAll(isActive, navId) {
    return new Promise((resolve, reject) => {
      let sql = 'SELECT * FROM service_categories';
      const conds = [];
      const params = [];

      if (typeof isActive !== 'undefined') {
        conds.push('is_active = ?');
        params.push(isActive ? 1 : 0);
      }
      if (typeof navId !== 'undefined') {
        conds.push('nav_id = ?');
        params.push(navId);
      }
      if (conds.length) sql += ' WHERE ' + conds.join(' AND ');
      sql += ' ORDER BY sid DESC';

      db.query(sql, params, (err, results) => (err ? reject(err) : resolve(results)));
    });
  }

  findById(id) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM service_categories WHERE sid = ?', [id], (err, results) => {
        if (err) return reject(err);
        resolve(results?.[0] || null);
      });
    });
  }
}

module.exports = new ServiceCategory();
