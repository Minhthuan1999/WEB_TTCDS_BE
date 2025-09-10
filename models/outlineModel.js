const db = require("../database/db");

class Banner {

    async isOrderIndexDuplicated(data) {
        return new Promise((resolve, reject) => {
          db.query("SELECT * FROM banners WHERE order_index = ?", data, (selectErr, selectResults) => {
            if (selectErr) {
               reject(selectErr);
            } else {
              resolve(selectResults.length > 0);
            }
          });
        });
    }
    
    create(data) {
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM banners WHERE order_index = ?", [data.order_index], (selectErr, selectResults) => {
                if (selectErr) {
                    reject(selectErr);
                } else {
                    if (selectResults.length === 0) {
                        db.query("INSERT INTO banners SET ?", data, (insertErr, insertResult) => {
                            if (insertErr) {
                                reject(insertErr);
                            } else {
                                resolve(insertResult);
                            }
                        });
                    } else {
                        reject(new Error("Order index is duplicated."));
                    }
                }
            });
        });
    }

    getAll() {
        return new Promise((resolve, reject) => {
            db.query(`
                SELECT *, (SELECT COUNT(*) FROM banners WHERE is_active = 1) AS active_banner_count
                FROM banners
                ORDER BY order_index;
            `, (err, results) => {
                if (err) reject(err)
                resolve(results)
            } )
        })    
    }


    getByPath(path) {
        return new Promise((resolve, reject) => {
            db.query(`
                SELECT * FROM banners WHERE path = ? ORDER BY order_index;`, [path], (err, results) => {
                if (err) reject(err)
                resolve(results)
            } )
        })    
    }


    getOne(id) {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM banners WHERE id = ?', [id], (error, results) => {
                if (error) reject(error)
                resolve(results[0])
            })
        })
    }


    delete(id) {
        return new Promise((resolve, reject) => {
            db.query('DELETE FROM banners WHERE id = ?', [id], (error, results) => {
                if(error) reject(error);
                resolve(results)
            })
        })  
    }


    update(id, data) {
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM banners WHERE order_index = ? AND id <> ?", [data.order_index, id], (selectErr, selectResults) => {
                if (selectErr) {
                    reject(selectErr);
                } else {
                    // Nếu không có bản ghi nào trùng lặp, thêm bản ghi mới
                    if (selectResults.length === 0) {
                        db.query('UPDATE banners SET ? WHERE id = ?', [data, id], (error, results) => {
                            if(error) reject(error);
                            resolve(results)
                        })
                    } else {
                        // Nếu có sự trùng lặp, trả về thông báo hoặc xử lý theo cách bạn muốn
                        reject(new Error("Order index is duplicated."));
                    }
                }
            });
           
        })
    }

    // updateOrderIndexes() {
    //     return new Promise((resolve, reject) => {
    //         const sql = 'UPDATE banners SET order_index = order_index + 1 WHERE order_index >= 1 ORDER BY order_index DESC';
    //         db.query(sql, (err, results) => {
    //             if (err) reject(err);
    //             resolve(results);
    //         });
    //     });
    // }
    updateOrderIndex(bannerId, newOrderIndex) {
        return new Promise((resolve, reject) => {
            db.beginTransaction(async (err) => {
                if (err) {
                    reject(err);
                    return;
                }
    
                try {
                    const bannerToUpdate = await this.getOne(bannerId);
                    const currentOrderIndex = bannerToUpdate.order_index;
    
                    await this.update(bannerId, { order_index: newOrderIndex });
    
                    console.log(currentOrderIndex)
                    console.log(newOrderIndex)
                    if (newOrderIndex < currentOrderIndex) {
                        console.log('case 1')
                        db.query('UPDATE banners SET order_index = order_index + 1 WHERE order_index >= ? AND order_index < ?;', [newOrderIndex + 1, currentOrderIndex], (error, results) => {
                            if(error) reject(error);
                            resolve(results)
                        })
                    }
                    else if (newOrderIndex > currentOrderIndex) {
                        console.log('case 2')
                        db.query('UPDATE banners SET order_index = order_index - 1 WHERE order_index > ? AND order_index <= ?;', [currentOrderIndex, newOrderIndex], (error, results) => {
                            if(error) reject(error);
                            resolve(results)
                        })
                    }
    
                    db.commit((err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                } catch (error) {
                    db.rollback(() => {
                        reject(error);
                    });
                }
            });
        });
    }
    
}

class Navbar {
    create(data) {
        return new Promise((resolve, reject) => {
            db.query('INSERT INTO navbar SET ?', data, (err, result) => {
                if (err) reject(err);
                resolve(result)
            })
        })
    }

    getAll() {
        return new Promise((resolve, reject) => {
            db.query(`
                SELECT *, (SELECT COUNT(*) FROM navbar WHERE is_active = 1) AS active_navbar_count
                FROM navbar
                ORDER BY orderID;
            `, (err, results) => {
                if (err) reject(err)
                resolve(results)
            } )
        })    
    }


    getById(id) {
        return new Promise((resolve, reject) => {
            db.query(`
                SELECT categories.cid, categories.cname, news.news_id 
                FROM navbar 
                INNER JOIN categories ON categories.parentID = navbar.id 
                INNER JOIN news ON news.category = categories.cid 
                WHERE news.status = "Đã duyệt" AND navbar.id = ?;
            `, [id], (err, results) => {
                if (err) reject(err)
                const resultMap = new Map();
            
                results.forEach(result => {
                    const key = result.cid.toString() + '_' + result.cname;
                    if (!resultMap.has(key)) {
                        resultMap.set(key, { cid: result.cid, cname: result.cname, news_ids: result.news_id });
                    } else {
                        resultMap.get(key).news_ids = Array.isArray(resultMap.get(key).news_ids) ? resultMap.get(key).news_ids : [resultMap.get(key).news_ids];
                        resultMap.get(key).news_ids.push(result.news_id);
                    }
                });

                const processedResults = Array.from(resultMap.values());
                
                resolve(processedResults);
            } )
        })    
    }

    delete(id) {
        return new Promise((resolve, reject) => {
            db.query('DELETE FROM navbar WHERE id = ?', [id], (error, results) => {
                if(error) reject(error);
                resolve(results)
            })
        })  
    }

    update(id, data) {
        return new Promise((resolve, reject) => {
            db.query('UPDATE navbar SET ? WHERE id = ?', [data, id], (error, results) => {
                if(error) reject(error);
                resolve(results)
            })
        })
    }

}

module.exports = {
    Banner: new Banner(),
    Navbar: new Navbar()
};
