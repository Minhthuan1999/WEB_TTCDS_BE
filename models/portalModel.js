const db = require('../database/db')

    class Portal {

        getAll() {
            return new Promise((resolve, reject) => {
                db.query('SELECT * FROM portals', (err, results) => {
                    if (err) reject(err)
                    resolve(results)
                } )
            })    
        }

        getOne(id) {
            return new Promise((resolve, reject) => {
                db.query('SELECT * FROM portals WHERE portal_id = ?', [id], (error, results) => {
                    if (error) reject(error)
                    resolve(results[0])
                })
            })
        }

        create(portal) {
            return new Promise((resolve, reject) => {
                db.query('INSERT INTO portals SET ?', portal, (err, result) => {
                    if (err) reject(err);
                    resolve(result)
                })
            })
        }

        delete(id) {
            return new Promise((resolve, reject) => {
                db.query('DELETE FROM portals WHERE portal_id = ?', [id], (error, results) => {
                    if(error) reject(error);
                    resolve(results)
                })
            })  
        }


        update(id, data) {
            return new Promise((resolve, reject) => {
              db.query(
                "UPDATE portals SET ? WHERE portal_id = ?",
                [data, id], (error, results) => {
                  if (error) reject(error);
                  resolve(results);
                }
              );
            });
          }



    }

module.exports = new Portal();