const db = require("../database/db");

class FooterModel {
  // -------- footers --------
  create(data) {
    return new Promise((resolve, reject) => {
      db.query("INSERT INTO footers SET ?", data, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }

  // findAll() {
  //   return new Promise((resolve, reject) => {
  //     db.query("SELECT * FROM footers ORDER BY id DESC", (err, results) => {
  //       if (err) return reject(err);
  //       resolve(results);
  //     });
  //   });
  // }

  // ⬇️ thêm tham số visible để lọc
  findAll(visible) {
    return new Promise((resolve, reject) => {
      let sql = "SELECT * FROM footers";
      const params = [];
      if (typeof visible !== "undefined") {
        sql += " WHERE is_visible = ?";
        params.push(visible ? 1 : 0);
      }
      sql += " ORDER BY id DESC";
      db.query(sql, params, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  findById(id) {
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM footers WHERE id = ?", [id], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      });
    });
  }

  update(id, data) {
    return new Promise((resolve, reject) => {
      db.query("UPDATE footers SET ? WHERE id = ?", [data, id], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }

  delete(id) {
    return new Promise((resolve, reject) => {
      db.query("DELETE FROM footers WHERE id = ?", [id], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }

  // -------- socials --------
  deleteSocials(footerId) {
    return new Promise((resolve, reject) => {
      db.query("DELETE FROM footer_socials WHERE footer_id = ?", [footerId], (err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    });
  }

  insertSocials(footerId, items = []) {
    if (!items.length) return Promise.resolve();
    const values = items.map((it, idx) => [footerId, it.platform || "", it.url || "", it.sort_order ?? idx]);
    return new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO footer_socials (footer_id, platform, url, sort_order) VALUES ?",
        [values],
        (err, res) => {
          if (err) return reject(err);
          resolve(res);
        }
      );
    });
  }

  getSocials(footerIds) {
    if (!footerIds.length) return Promise.resolve([]);
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM footer_socials WHERE footer_id IN (?) ORDER BY sort_order, id",
        [footerIds],
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });
  }

  // -------- services --------
  deleteServices(footerId) {
    return new Promise((resolve, reject) => {
      db.query("DELETE FROM footer_services WHERE footer_id = ?", [footerId], (err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    });
  }

  insertServices(footerId, items = []) {
    if (!items.length) return Promise.resolve();
    const values = items.map((it, idx) => [footerId, it.title || "", it.url || null, it.sort_order ?? idx]);
    return new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO footer_services (footer_id, title, url, sort_order) VALUES ?",
        [values],
        (err, res) => {
          if (err) return reject(err);
          resolve(res);
        }
      );
    });
  }

  getServices(footerIds) {
    if (!footerIds.length) return Promise.resolve([]);
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM footer_services WHERE footer_id IN (?) ORDER BY sort_order, id",
        [footerIds],
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });
  }

  // -------- activities --------
  deleteActivities(footerId) {
    return new Promise((resolve, reject) => {
      db.query("DELETE FROM footer_activities WHERE footer_id = ?", [footerId], (err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    });
  }

  insertActivities(footerId, items = []) {
    if (!items.length) return Promise.resolve();
    const values = items.map((it, idx) => [footerId, it.title || "", it.url || null, it.sort_order ?? idx]);
    return new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO footer_activities (footer_id, title, url, sort_order) VALUES ?",
        [values],
        (err, res) => {
          if (err) return reject(err);
          resolve(res);
        }
      );
    });
  }

  getActivities(footerIds) {
    if (!footerIds.length) return Promise.resolve([]);
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM footer_activities WHERE footer_id IN (?) ORDER BY sort_order, id",
        [footerIds],
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });
  }

  // -------- helpers (gộp dữ liệu con) --------
  // async findAllWithChildren() {
  //   const footers = await this.findAll();
  //   if (!footers.length) return [];
  //   const ids = footers.map(f => f.id);

  //   const [socials, services, activities] = await Promise.all([
  //     this.getSocials(ids),
  //     this.getServices(ids),
  //     this.getActivities(ids)
  //   ]);

  //   const byFooter = {};
  //   footers.forEach(f => byFooter[f.id] = { ...f, socials: [], services: [], activities: [] });
  //   socials.forEach(s => byFooter[s.footer_id].socials.push(s));
  //   services.forEach(sv => byFooter[sv.footer_id].services.push(sv));
  //   activities.forEach(ac => byFooter[ac.footer_id].activities.push(ac));

  //   return Object.values(byFooter);
  // }

  // ⬇️ nhận visible để gộp dữ liệu con theo filter
  async findAllWithChildren(visible) {
    const footers = await this.findAll(visible);
    if (!footers.length) return [];
    const ids = footers.map(f => f.id);
    const [socials, services, activities] = await Promise.all([
      this.getSocials(ids),
      this.getServices(ids),
      this.getActivities(ids)
    ]);
    const byFooter = {};
    footers.forEach(f => byFooter[f.id] = { ...f, socials: [], services: [], activities: [] });
    socials.forEach(s => byFooter[s.footer_id].socials.push(s));
    services.forEach(sv => byFooter[sv.footer_id].services.push(sv));
    activities.forEach(ac => byFooter[ac.footer_id].activities.push(ac));
    return Object.values(byFooter);
  }


  async findOneWithChildren(id) {
    const footer = await this.findById(id);
    if (!footer) return null;
    const [socials, services, activities] = await Promise.all([
      this.getSocials([id]),
      this.getServices([id]),
      this.getActivities([id])
    ]);
    return { ...footer, socials, services, activities };
  }
}

module.exports = new FooterModel();
