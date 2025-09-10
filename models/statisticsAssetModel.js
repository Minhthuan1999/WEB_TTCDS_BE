const db = require("../database/db");

class StatisticsAsset {
  create(data) {
    return new Promise((resolve, reject) => {
      db.query("INSERT INTO statistics_assets SET ?", data, (err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    });
  }

  bulkCreate(records) {
    if (!records.length) return Promise.resolve({ affectedRows: 0 });
    const sql = "INSERT INTO statistics_assets (statistics_id, filename, mime_type, kind, size) VALUES ?";
    const values = records.map(r => [r.statistics_id, r.filename, r.mime_type, r.kind, r.size]);
    return new Promise((resolve, reject) => {
      db.query(sql, [values], (err, res) => (err ? reject(err) : resolve(res)));
    });
  }

  findByStatistics(statistics_id) {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM statistics_assets WHERE statistics_id = ? ORDER BY id ASC",
        [statistics_id],
        (err, rows) => (err ? reject(err) : resolve(rows))
      );
    });
  }

  findByStatisticsIds(ids) {
    if (!ids.length) return Promise.resolve([]);
    const placeholders = ids.map(() => "?").join(",");
    const sql = `SELECT * FROM statistics_assets WHERE statistics_id IN (${placeholders}) ORDER BY id ASC`;
    return new Promise((resolve, reject) => {
      db.query(sql, ids, (err, rows) => (err ? reject(err) : resolve(rows)));
    });
  }

  findById(id) {
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM statistics_assets WHERE id = ?", [id], (err, rows) =>
        err ? reject(err) : resolve(rows?.[0])
      );
    });
  }

  delete(id) {
    return new Promise((resolve, reject) => {
      db.query("DELETE FROM statistics_assets WHERE id = ?", [id], (err, res) =>
        err ? reject(err) : resolve(res)
      );
    });
  }

  
  deleteByStatistics(statistics_id) {
    return new Promise((resolve, reject) => {
      db.query("DELETE FROM statistics_assets WHERE statistics_id = ?", [statistics_id], (err, res) =>
        err ? reject(err) : resolve(res)
      );
    });
  }

  }


module.exports = new StatisticsAsset();
