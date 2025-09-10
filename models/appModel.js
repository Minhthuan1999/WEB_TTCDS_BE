const db = require("../database/db");

class App {
  getStatistic() {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT 'Người Dùng' AS field, COUNT(*) AS total FROM users UNION ALL SELECT 'Bản Tin' AS field, COUNT(*) AS total FROM news UNION ALL SELECT 'Dịch Vụ' AS field, COUNT(*) AS total FROM services UNION ALL SELECT 'Góp ý' AS field, COUNT(*) AS total FROM contact",
        (err, results) => {
          if (err) reject(err);
          resolve(results);
        }
      );
    });
  }

  // loadAccess(ipAddress) {
  //   return new Promise((resolve, reject) => {
  //     db.query(
  //       "INSERT INTO visits (timestamp, ip_address) VALUES (CURRENT_TIMESTAMP, ?)", [ipAddress],
  //       (err, results) => {
  //         if (err) reject(err);
  //         resolve(results);
  //       }
  //     );
  //   });
  // }

  //Visit function
  updateVisitor() {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE visits SET visits = visits + 1, pageviews = pageviews + 1 WHERE id = 1';
      db.query(query, (err, results) => {
        if (err) {
          reject(err); // Trả về lỗi nếu có lỗi xảy ra trong quá trình thực thi truy vấn
        } else {
          resolve({ message: 'Visit count updated successfully' }); // Trả về thông báo thành công nếu không có lỗi
        }
      });
    });
  }


  updatePageviews() {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE visits SET pageviews = pageviews + 1 WHERE id = 1';
      db.query(query, (err, results) => {
        if (err) {
          reject(err); // Trả về lỗi nếu có lỗi xảy ra trong quá trình thực thi truy vấn
        } else {
          resolve({ message: 'Pageviews count updated successfully' }); // Trả về thông báo thành công nếu không có lỗi
        }
      });
    });
  }

  getTotalVisitor() {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM visits';
      db.query(query, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0]);
        }
      });
    });
  }

  


}

module.exports = new App();
