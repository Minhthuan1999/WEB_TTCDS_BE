const db = require("../database/db");

class News {
  getAll() {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM news " +
          "INNER JOIN users ON news.userID = users.userID " +
          "INNER JOIN categories ON news.category = categories.cid " +
          "LEFT JOIN attachments ON news.news_id = attachments.nid " +
          `WHERE status = "Đã duyệt" AND categories.parentID = 2 ORDER BY date DESC`,
        // "SELECT * FROM news INNER JOIN users ON news.userID = users.userID INNER JOIN categories ON news.category = categories.cid LEFT JOIN attachments ON news.news_id = attachments.nid ORDER BY date DESC",
        (err, results) => {
          if (err) {
            reject(err);
          } else {
            const newsMap = new Map();

            const fieldsToRemove = ["content", "password", "isLoggedIn"];
  
            results.forEach((row) => {
              const newsId = row.news_id;
              if (!newsMap.has(newsId)) {
                newsMap.set(newsId, {
                  ...row,
                  attachments: [],
                });
              }
  
              if (row.id) {
                newsMap.get(newsId).attachments.push({
                  id: row.id,
                  file_path: row.file_path,
                  file_type: row.file_type,
                  file_size: row.file_size,
                  filename: row.filename,
                  originalname: row.originalname
                });
              }

              fieldsToRemove.forEach((field) => {
                if (newsMap.get(newsId)[field]) {
                  delete newsMap.get(newsId)[field];
                }
              });

            });
  
            const newsArray = Array.from(newsMap.values());
            resolve(newsArray);
          }
        }
      );
    });
  }


  getAllByAdmin(id) {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM news " +
          "INNER JOIN users ON news.userID = users.userID " +
          "INNER JOIN categories ON news.category = categories.cid " +
          "LEFT JOIN attachments ON news.news_id = attachments.nid " +
          `WHERE categories.parentID = ? ORDER BY date DESC`,
        [id], (err, results) => {
          if (err) {
            reject(err);
          } else {
            const newsMap = new Map();

            const fieldsToRemove = ["content", "password", "isLoggedIn"];
  
            results.forEach((row) => {
              const newsId = row.news_id;
              if (!newsMap.has(newsId)) {
                newsMap.set(newsId, {
                  ...row,
                  attachments: [],
                });
              }
  
              if (row.id) {
                newsMap.get(newsId).attachments.push({
                  id: row.id,
                  file_path: row.file_path,
                  file_type: row.file_type,
                  file_size: row.file_size,
                  filename: row.filename,
                  originalname: row.originalname
                });
              }

              fieldsToRemove.forEach((field) => {
                if (newsMap.get(newsId)[field]) {
                  delete newsMap.get(newsId)[field];
                }
              });

            });
  
            const newsArray = Array.from(newsMap.values());
            resolve(newsArray);
          }
        }
      );
    });
  }
  

  getById(id) {
    return new Promise((resolve, reject) => {
      db.query(
        // "SELECT * FROM news " +
        //   "INNER JOIN users ON news.userID = users.userID " +
        //   "INNER JOIN categories ON news.category = categories.cid " +
        //   "LEFT JOIN attachments ON news.news_id = attachments.nid " +
        //   "WHERE news_id = ?",
         "SELECT n.*, u.*, c.cname AS category_name, sc.sname AS service_cname, " +
         "a.id AS att_id, a.file_path, a.file_type, a.file_size, a.filename, a.originalname " +
         "FROM news n " +
         "INNER JOIN users u ON n.userID = u.userID " +
         "LEFT JOIN categories c ON n.category = c.cid " +
         "LEFT JOIN service_categories sc ON n.service_cid = sc.sid " +
         "LEFT JOIN attachments a ON n.news_id = a.nid " +
         "WHERE n.news_id = ?",
        [id],
        (error, results) => {
          if (error) {
            reject(error);
          } else {
            if (results.length === 0) {
              resolve(null);
            } else {
              const fieldsToRemove = [
                "id",
                "file_path",
                "file_type",
                "file_size",
                "nid",
                "password",
                "isLoggedIn",
              ];

              const newsInfo = {
                ...results[0],
                attachments: results
                  .filter((row) => row.id)
                  .map((row) => ({
                    id: row.id,
                    file_path: row.file_path,
                    file_type: row.file_type,
                    file_size: row.file_size,
                    filename: row.filename,
                    originalname: row.originalname
                  })),
              };

              fieldsToRemove.forEach((field) => {
                if (newsInfo.hasOwnProperty(field)) {
                  delete newsInfo[field];
                }
              });
              resolve(newsInfo);
            }
          }
        }
      );
    });
  }

  getByUserCreate(id) {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM news " +
          "INNER JOIN users ON news.userID = users.userID " +
          "INNER JOIN categories ON news.category = categories.cid " +
          "LEFT JOIN attachments ON news.news_id = attachments.nid " +
          "WHERE news.userID = ? ORDER BY date DESC",
        // "SELECT * FROM news INNER JOIN users ON news.userID = users.userID INNER JOIN categories ON news.category = categories.cid WHERE news.userID = ? ",
        [id],
        (error, results) => {
          if (error) {
            reject(error);
          } else {
            const newsMap = new Map();

            const fieldsToRemove = ["content", "password", "isLoggedIn"];
  
            results.forEach((row) => {
              const newsId = row.news_id;
              if (!newsMap.has(newsId)) {
                newsMap.set(newsId, {
                  ...row,
                  attachments: [],
                });
              }
  
              if (row.id) {
                newsMap.get(newsId).attachments.push({
                  id: row.id,
                  file_path: row.file_path,
                  file_type: row.file_type,
                  file_size: row.file_size,
                  filename: row.filename,
                  originalname: row.originalname
                });
              }

              fieldsToRemove.forEach((field) => {
                if (newsMap.get(newsId)[field]) {
                  delete newsMap.get(newsId)[field];
                }
              });

            });
  
            const newsArray = Array.from(newsMap.values());
            resolve(newsArray);
          }
        }
      );
    });
  }

  //API create

  create(news) {
    return new Promise((resolve, reject) => {
      db.query("INSERT INTO news SET ?", news, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  }

  update(id, news) {
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE news SET ? WHERE news_id = ?",
        [news, id],
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  upload(data) {
    return new Promise((resolve, reject) => {
      db.query("INSERT INTO attachments SET ?", data, (err, result) => {
        if (err) reject(err);
        resolve(data);
      });
    });
  }

  approve(id) {
    return new Promise((resolve, reject) => {
      db.query(
        'UPDATE news SET status = "Đã duyệt" WHERE news_id = ?',
        id,
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      );
    });
  }

  refuse(id) {
    return new Promise((resolve, reject) => {
      db.query(
        'UPDATE news SET status = "Từ chối" WHERE news_id = ?',
        id,
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      );
    });
  }

  resend(id) {
    return new Promise((resolve, reject) => {
      db.query(
        'UPDATE news SET status = "Chờ duyệt" WHERE news_id = ?',
        id,
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      );
    });
  }

  increaseViews(id) {
    return new Promise((resolve, reject) => {
      db.query(
        // "UPDATE news SET views = views + 1 WHERE news_id = ?"
        "UPDATE news SET views = IFNULL(views, 0) + 1 WHERE news_id = ?",
        [id],
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  delete(id) {
    return new Promise((resolve, reject) => {
      db.query("DELETE FROM news WHERE news_id = ?", [id], (error, results) => {
        if (error) reject(error);
        resolve(results);
      });
    });
  }

  //Search / filter
  search(searchKey) {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT news_id, title, category, image, views, date, description, status, news.userID, username, cname, updated_date, updated_by FROM news INNER JOIN users ON news.userID = users.userID INNER JOIN categories ON news.category = categories.cid WHERE title LIKE '%${searchKey}%'`,
        searchKey,
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }
  //Lay 4 tin tuc moi nhat
  getLatestNews(id) {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT news_id, title, category, image, views, date, cname FROM news INNER JOIN categories ON news.category = categories.cid WHERE news_id NOT IN (${id}) AND status = "Đã duyệt" ORDER BY date DESC LIMIT 3`,
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }
  //Lấy 6 tin trending
  getTrendingNews() {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT news_id, title, category, image, views, date, description, cname FROM news INNER JOIN categories ON news.category = categories.cid WHERE status = "Đã duyệt" ORDER BY views DESC LIMIT 6`,
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }
  //Lấy 4 thông báo 
  getAnnouncements() {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT news_id, title, category, image, views, date, cname 
         FROM news 
         INNER JOIN categories ON news.category = categories.cid 
         WHERE categories.cid = '23' AND status = 'Đã duyệt' 
         ORDER BY date DESC 
         LIMIT 4`,
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  //Lấy ra các tb về lịch làm việc
  getWorkSchedule() {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT news_id, title, category, image, views, date, cname 
         FROM news 
         INNER JOIN categories ON news.category = categories.cid 
         WHERE categories.cid = '27' AND status = 'Đã duyệt' 
         ORDER BY date DESC`,
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  getNewsByCategory(id) {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT news_id, title, category, image, views, date, description, cname FROM news INNER JOIN categories ON news.category = categories.cid WHERE category = ? AND status = "Đã duyệt"`,
        [id],
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  //Topic API
  getAllTopic() {
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM categories", (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }


  getTopicByParentId(id) {
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM categories WHERE parentID = ?", [id], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }


  getDisplayHomeTopic() {
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM categories WHERE isDisplayHome = '1'", (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }

  deleteTopic(id) {
    return new Promise((resolve, reject) => {
      db.query(
        "DELETE FROM categories WHERE cid = ?",
        [id],
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  getTopicById(id) {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM categories WHERE cid = ? ",
        [id],
        (error, results) => {
          if (error) reject(error);
          resolve(results[0]);
        }
      );
    });
  }

  createTopic(news) {
    return new Promise((resolve, reject) => {
      db.query("INSERT INTO categories SET ?", news, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  }

  updateTopic(id, news) {
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE categories SET ? WHERE cid = ?",
        [news, id],
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }
  // hiển thị tất cả tin tức
  //  getAllNoPaging() {
  //   return new Promise((resolve, reject) => {
  //     const sql = `
  //       SELECT *
  //       FROM news
  //       INNER JOIN users ON news.userID = users.userID
  //       INNER JOIN categories ON news.category = categories.cid
  //       LEFT JOIN attachments ON news.news_id = attachments.nid
  //       WHERE status = 'Đã duyệt'
  //       ORDER BY date DESC
  //     `;

  //     db.query(sql, (err, results) => {
  //       if (err) return reject(err);

  //       const newsMap = new Map();
  //       const fieldsToRemove = ["content","password", "isLoggedIn"]; // cần ẩn thêm gì thì bổ sung

  //       results.forEach((row) => {
  //         const newsId = row.news_id;

  //         if (!newsMap.has(newsId)) {
  //           const item = { ...row, attachments: [] };
  //           fieldsToRemove.forEach((f) => {
  //             if (item[f] !== undefined) delete item[f];
  //           });
  //           newsMap.set(newsId, item);
  //         }

  //         if (row.id) {
  //           newsMap.get(newsId).attachments.push({
  //             id: row.id,
  //             file_path: row.file_path,
  //             file_type: row.file_type,
  //             file_size: row.file_size,
  //             filename: row.filename,
  //             originalname: row.originalname,
  //           });
  //         }
  //       });

  //       resolve(Array.from(newsMap.values()));
  //     });
  //   });
  // }

  updateDate(id, data) {
    return new Promise((resolve, reject) => {
        db.query("UPDATE news SET date = ? WHERE news_id = ?", [data.date, id], (err, results) => {
            if (err) reject(err);
            resolve(results);
        });
    });
}

// === THÊM VÀO CUỐI FILE newsModel.js ===

getServiceNews() {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT n.*, u.*, sc.sname AS service_cname,
             a.id AS att_id, a.file_path, a.file_type, a.file_size, a.filename, a.originalname
      FROM news n
      INNER JOIN users u ON n.userID = u.userID
      LEFT JOIN service_categories sc ON n.service_cid = sc.sid
      LEFT JOIN attachments a ON n.news_id = a.nid
      WHERE n.post_type = 'service' /* AND n.status = 'đã duyệt' */
      ORDER BY n.date DESC
    `;
    db.query(sql, (err, results) => {
      if (err) return reject(err);

      const newsMap = new Map();
      const fieldsToRemove = ['content','password','isLoggedIn'];

      results.forEach((row) => {
        const id = row.news_id;
        if (!newsMap.has(id)) {
          // loại bỏ vài field nặng/nhạy cảm giống getAll()
          const cleanRow = { ...row };
          fieldsToRemove.forEach(k => delete cleanRow[k]);

          newsMap.set(id, { 
            ...cleanRow,
            attachments: []
          });
        }
        if (row.att_id) {
          newsMap.get(id).attachments.push({
            id: row.att_id,
            file_path: row.file_path,
            file_type: row.file_type,
            file_size: row.file_size,
            filename: row.filename,
            originalname: row.originalname
          });
        }
      });

      resolve(Array.from(newsMap.values()));
    });
  });
}

getServiceNewsByCategory(sid) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT n.*, u.*, sc.sname AS service_cname,
             a.id AS att_id, a.file_path, a.file_type, a.file_size, a.filename, a.originalname
      FROM news n
      INNER JOIN users u ON n.userID = u.userID
      LEFT JOIN service_categories sc ON n.service_cid = sc.sid
      LEFT JOIN attachments a ON n.news_id = a.nid
      WHERE n.post_type = 'service' AND n.service_cid = ?
      ORDER BY n.date DESC
    `;
    db.query(sql, [sid], (err, results) => {
      if (err) return reject(err);

      const newsMap = new Map();
      const fieldsToRemove = ['content','password','isLoggedIn'];

      results.forEach((row) => {
        const id = row.news_id;
        if (!newsMap.has(id)) {
          const cleanRow = { ...row };
          fieldsToRemove.forEach(k => delete cleanRow[k]);
          newsMap.set(id, { 
            ...cleanRow,
            attachments: []
          });
        }
        if (row.att_id) {
          newsMap.get(id).attachments.push({
            id: row.att_id,
            file_path: row.file_path,
            file_type: row.file_type,
            file_size: row.file_size,
            filename: row.filename,
            originalname: row.originalname
          });
        }
      });

      resolve(Array.from(newsMap.values()));
    });
  });
}

}

//Tạo lớp sự kiện
class Event {
  getById(id) {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM events WHERE event_id = ?",
        [id],
        (error, results) => {
          if (error) reject(error);
          resolve(results[0]);
        }
      );
    });
  }

  create(event) {
    return new Promise((resolve, reject) => {
      db.query("INSERT INTO events SET ?", event, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  }

  update(id, evt) {
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE events SET ? WHERE event_id = ?",
        [evt, id],
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  delete(id) {
    return new Promise((resolve, reject) => {
      db.query(
        "DELETE FROM events WHERE event_id = ?",
        [id],
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  findAll() {
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM events", (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }

  getByUpcomingDate(currentDate, state) {
    return new Promise((resolve, reject) => {
      if (state === 0) {
        db.query(
          "SELECT * FROM events WHERE start_date > ?",
          currentDate,
          (error, results) => {
            if (error) reject(error);
            resolve(results);
          }
        );
      }
      if (state === 1) {
        console.log();
        db.query(
          `SELECT * FROM events WHERE ? BETWEEN start_date AND end_date`,
          currentDate,
          (error, results) => {
            if (error) reject(error);
            resolve(results);
          }
        );
      }
      db.query(
        "SELECT * FROM events WHERE end_date < ?",
        currentDate,
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }


}

//Init Instance News, Event
const newsInstance = new News();

const eventInstance = new Event();

module.exports = {
  News: newsInstance,
  Event: eventInstance,
};
