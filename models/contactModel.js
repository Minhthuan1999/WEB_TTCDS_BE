const db = require('../database/db')

    class Contact {

        getAll() {
            return new Promise((resolve, reject) => {
                db.query('SELECT * FROM contact ORDER BY sending_date DESC', (err, results) => {
                    if(err) reject(err)
                    resolve(results)
                })  
            })
        }

        create(contact) {
            return new Promise((resolve, reject) => {
                db.query('INSERT INTO contact SET ?', contact, (err, result) => {
                    if (err) reject(err);
                    resolve(result)
                })
            })
        }

        check(id) {
            return new Promise((resolve, reject) => {
                db.query('UPDATE contact SET isChecked = true WHERE cid = ?', id, (err, result) => {
                    if (err) reject(err);
                    resolve(result)
                })
            })
        }

        

        filter(col, value) {
            return new Promise((resolve, reject) => {
                if (Array.isArray(col)) {
                    db.query(`SELECT * FROM contact WHERE ${col[0]} = ? AND DATE(${col[1]}) = ?`, [value[0], value[1]],
                    (err, results) => {
                        if(err) reject(err)
                        resolve(results)
                    });
                }
                db.query(`SELECT * FROM contact WHERE ?? = ?`,
                    [col, value], (err, results) => {
                        if(err) reject(err)
                        resolve(results)
                })

            })
        }  

        delete(id) {
            return new Promise((resolve, reject) => {
                db.query('DELETE FROM contact WHERE cid = ?', id, (err, result) => {
                    if(err) reject(err)
                    resolve(result)
                })
            })
        }


    }

module.exports = new Contact();