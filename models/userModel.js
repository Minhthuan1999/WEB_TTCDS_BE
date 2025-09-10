const db = require('../database/db')
const bcrypt = require('bcryptjs')

    class User {

        getAll() {
            return new Promise((resolve, reject) => {
                db.query('SELECT * FROM users INNER JOIN roles ON users.roleID = roles.roleID', (error, results) => {
                    if (error) reject(error);
                    resolve(results);
                });
            });
        }


        getById(id) {
            return new Promise((resolve, reject) => {
                db.query('SELECT * FROM users INNER JOIN roles ON users.roleID = roles.roleID WHERE userID = ?', [id], (error, results) => {
                    if (error) reject(error)
                    resolve(results[0])
                })
            })
        }
        
        create(user) {
            return new Promise((resolve, reject) => {
                db.query('INSERT INTO users SET ?', user, (error, results) => {
                    if (error) reject(error);
                    resolve(results);
                });
            });
        }
        
        update(id, user) {
            return new Promise((resolve, reject) => {
                db.query('UPDATE users SET ? WHERE userID = ?', [user, id], (error, results) => {
                    if(error) reject(error);
                    resolve(results)
                })
            })
        }
        
        delete(id) {
            return new Promise((resolve, reject) => {
                db.query('DELETE FROM users WHERE userID = ?', [id], (error, results) => {
                    if(error) reject(error);
                    resolve(results)
                })
            })  
        }

        getUserByEmail(email) {
            return new Promise((resolve, reject) => {
                db.query('SELECT * FROM users INNER JOIN roles ON users.roleID = roles.roleID WHERE email = ?', [email], (err, results) => {
                    if(err) {
                        reject(err)
                    } else {
                        resolve(results[0])
                    }
                })
            })
        }
        //compare password
        comparePassword(password, hashedPassword) {
            return bcrypt.compareSync(password, hashedPassword)
        }
        
        // change password
        updatePassword(id, hashedNewPassword) {
            return new Promise((resolve, reject) => {
                db.query('UPDATE users SET password = ? WHERE userID = ?', [hashedNewPassword, id], (error, results) => {
                    if(error) reject(error);
                    resolve(results)
                })
            })
        }


    }

module.exports = new User();