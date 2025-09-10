const db = require('../database/db')

    class Attachment {

        getById(id) {
          return new Promise((resolve, reject) => {
            db.query(
              "SELECT * FROM attachments WHERE nid = ? ",
              [id],
              (error, results) => {
                if (error) reject(error);
                resolve(results);
              }
            );
          });
        }

        upload(data) {
            return new Promise((resolve, reject) => {
              db.query('INSERT INTO attachments SET ?', data, (err, result) => {
                if(err) reject(err)
                resolve(data)
              })
            })
        }

        delete(id) {
          return new Promise((resolve, reject) => {
            db.query("DELETE FROM attachments WHERE nid = ?", [id], (error, results) => {
              if (error) reject(error);
              resolve(results);
            });
          });
        }

        

        


    }

module.exports = new Attachment();