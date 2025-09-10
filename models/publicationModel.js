// models/publicationModel.js
const db = require('../database/db');

class PublicationModel {
  // ===== SERIES (CHUYÊN ĐỀ)=====
  // TẠO CHUYÊN ĐỀ
  createSeries(series) {
    return new Promise((resolve, reject) => {
      db.query('INSERT INTO publication_series SET ?', series, (err, rs) => err ? reject(err) : resolve(rs));
    });
  }
  // CẬP NHẬT CHUYÊN ĐỀ
  updateSeries(id, series) {
  return new Promise((resolve, reject) => {
    db.query(
      'UPDATE publication_series SET ? WHERE series_id=?',
      [series, id],
      (err, rs) => {
        if (err) return reject(err);
        if (rs.affectedRows === 0) return reject(new Error("Không tìm thấy series"));
        resolve(rs);
      }
    );
  });
}


  // LẤY 1 CHUYÊN ĐỀ
  getSeriesById(id) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM publication_series WHERE series_id=?', [id], (err, rows) => err ? reject(err) : resolve(rows[0]));
    });
  }
 // +1 view khi mở trang chuyên đề
  bumpSeriesViews(id) {
    return new Promise((resolve, reject) => {
      db.query('UPDATE publication_series SET views = views + 1 WHERE series_id=?', [id], (err, rs) => err ? reject(err) : resolve(rs));
    });
  }
// 

  // LẤY TẤT CẢ CHUYÊN ĐỀ
  listSeries() {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM publication_series ORDER BY posted_at DESC, series_id DESC', [], (err, rows) => err ? reject(err) : resolve(rows));
    });
  }
 

  // XÓA CHUYÊN ĐỀ
    deleteSeries(id) {
        return new Promise((resolve, reject) => {
            db.query(
                "DELETE FROM publication_series WHERE series_id=?",
                [id],
                (err, rs) => err ? reject(err) : resolve(rs)
            );
        });
    }







  // ===== ISSUES (SỐ) =====

  // TẠO ẤN PHẨM
  createIssue(data) {
    return new Promise((resolve, reject) => {
      db.query('INSERT INTO publications SET ?', data, (err, rs) => err ? reject(err) : resolve(rs));
    });
  }

  // CẬP NHẬT ẤN PHẨM
  updateIssue(id, data) {
  return new Promise((resolve, reject) => {
    // Nếu không có published_at thì set mặc định = NOW()
    if (!data.published_at) {
      data.published_at = new Date(); // lấy thời gian hiện tại server
    }

    db.query(
      'UPDATE publications SET ? WHERE pub_id=?',
      [data, id],
      (err, rs) => {
        if (err) return reject(err);

        // Nếu không có bản ghi nào được cập nhật
        if (rs.affectedRows === 0) {
          return reject(new Error("Không tìm thấy ấn phẩm"));
        }

        resolve(rs);
      }
    );
  });
}


  // LẤY 1 ẤN PHẨM
  getIssueById(id) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT p.*, s.name AS series_name, u.username AS updated_by
        FROM publications p
        JOIN publication_series s ON s.series_id = p.series_id
        JOIN users u ON u.userID = p.userID
        WHERE p.pub_id=?`;
      db.query(sql, [id], (err, rows) => err ? reject(err) : resolve(rows[0]));
    });
  }

  // LẤY TOÀN BỘ ẤN PHẨM
  getIssues({ series_id, page=1, limit=12, status }) {
    const offset = (page-1)*limit;
    const params = [];
    let sql = `
      SELECT p.*, s.name AS series_name, u.username AS updated_by
      FROM publications p
      JOIN publication_series s ON s.series_id = p.series_id 
      JOIN users u ON u.userID = p.userID
      WHERE p.status='Đã duyệt' AND 1=1`;
    if (series_id) { sql += ' AND p.series_id=?'; params.push(series_id); }
    if (status)    { sql += ' AND p.status=?';   params.push(status); }
    sql += ' ORDER BY p.published_at DESC, p.pub_id DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));
    return new Promise((resolve, reject) => {
      db.query(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
    });
  }

  // ==== LẤY TOÀN BỘ ẤN PHẨM (ADMIN) ====
getIssuesAdmin({ series_id, page=1, limit=12, status }) {
  const offset = (page - 1) * limit;
  const params = [];
  let sql = `
    SELECT p.*, s.name AS series_name, u.username AS updated_by
    FROM publications p
    JOIN publication_series s ON s.series_id = p.series_id
    JOIN users u ON u.userID = p.userID
    WHERE 1=1
  `;

  // Nếu lọc theo series_id
  if (series_id) {
    sql += ' AND p.series_id=?';
    params.push(series_id);
  }

  // Nếu có truyền status thì lọc, còn không thì lấy tất cả
  if (status) {
    sql += ' AND p.status=?';
    params.push(status);
  }

  sql += ' ORDER BY p.published_at DESC, p.pub_id DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
  });
}

// lấy danh sách "các số trước"
  getIssuesBySeries(series_id, { page=1, limit=20, exclude_pub_id=null } = {}) {
    const offset = (page-1)*limit;
    const params = [series_id];
    let sql = `
      SELECT p.pub_id, p.issue_no, p.cover, p.pdf_file, p.published_at, s.name AS series_name, u.username AS updated_by
      FROM publications p
      JOIN publication_series s ON s.series_id = p.series_id
      JOIN users u ON u.userID = p.userID
      WHERE p.status='Đã duyệt' AND p.series_id=?`;
    if (exclude_pub_id) { sql += ' AND p.pub_id<>?'; params.push(exclude_pub_id); }
    sql += ' ORDER BY p.published_at DESC, p.pub_id DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));
    return new Promise((resolve, reject) => {
      db.query(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
    });
  }

  // Lấy số mới nhất theo series 
getLatestIssueBySeries(series_id) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT p.*, s.name AS series_name, u.username AS updated_by
      FROM publications p
      JOIN publication_series s ON s.series_id = p.series_id
      JOIN users u ON u.userID = p.userID
      WHERE p.series_id = ? AND p.status = 'Đã duyệt'
      ORDER BY (p.published_at IS NULL), p.published_at DESC, p.pub_id DESC
      LIMIT 1
    `;
    db.query(sql, [series_id], (err, rows) => err ? reject(err) : resolve(rows[0]));
  });
}

// Số mới nhất toàn hệ thống (bất kỳ series nào)
getLatestIssue() {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT p.*, s.name AS series_name, u.username AS updated_by
      FROM publications p
      JOIN publication_series s ON s.series_id = p.series_id
      JOIN users u ON u.userID = p.userID
      WHERE p.status = 'Đã duyệt'
      ORDER BY (p.published_at IS NULL), p.published_at DESC, p.pub_id DESC
      LIMIT 1
    `;
    db.query(sql, [], (err, rows) => err ? reject(err) : resolve(rows[0]));
  });
}

// Bài + tên chuyên mục của 1 pub (để build outline)
getArticlesByIssueWithCategory(pub_id) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT a.article_id, a.title, a.summary, a.audio_file, a.audio_url,
             a.pc_id, pc.name AS category_name
      FROM publication_articles a
      LEFT JOIN publication_categories pc ON pc.pc_id = a.pc_id
      WHERE a.pub_id = ? AND a.status = 'Đã duyệt'
      ORDER BY pc.name ASC, a.sort_order ASC, a.article_id ASC
    `;
    db.query(sql, [pub_id], (err, rows) => err ? reject(err) : resolve(rows));
  });
}

// Trả danh sách issues theo series, có thể loại trừ 1 pub_id, limit tuỳ chọn
getIssuesBySeries(series_id, { exclude_pub_id = null, limit = null } = {}) {
  return new Promise((resolve, reject) => {
    let sql = `
      SELECT p.*, s.name AS series_name, u.username AS updated_by
      FROM publications p
      JOIN publication_series s ON s.series_id = p.series_id
      JOIN users u ON u.userID = p.userID
      WHERE p.series_id = ? AND p.status = 'Đã duyệt'
    `;
    const params = [series_id];

    if (exclude_pub_id) {
      sql += ' AND p.pub_id <> ?';
      params.push(exclude_pub_id);
    }

    sql += `
      ORDER BY (p.published_at IS NULL), p.published_at DESC, p.pub_id DESC
    `;

    if (limit != null) {
      sql += ' LIMIT ?';
      params.push(Number(limit) || 20);
    }

    db.query(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
  });
}

 // lấy toàn bộ bài của các kỳ đó (1 query)
getArticlesByIssuesWithCategory(pubIds, status = null) {
  return new Promise((resolve, reject) => {
    if (!pubIds || pubIds.length === 0) return resolve([]);

    const placeholders = pubIds.map(() => '?').join(',');
    let sql = `
      SELECT a.pub_id, a.article_id, a.title, a.summary,
             a.audio_file, a.audio_url,
             a.pc_id, pc.name AS category_name
      FROM publication_articles a
      LEFT JOIN publication_categories pc ON pc.pc_id = a.pc_id
      WHERE a.pub_id IN (${placeholders})
    `;
    const params = [...pubIds];
    if (status) { sql += ' AND a.status = ?'; params.push(status); }
    sql += ` ORDER BY a.pub_id DESC, pc.name ASC, a.sort_order ASC, a.article_id ASC`;

    db.query(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
  });
}

// Đếm bài viết thuộc 1 kỳ số
countArticlesByIssue(pub_id) {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT COUNT(*) AS total FROM publication_articles WHERE pub_id = ?`,
      [pub_id],
      (err, rows) => err ? reject(err) : resolve(rows[0])
    );
  });
}

// Xoá toàn bộ bài viết của 1 kỳ số (dùng khi cascade)
deleteArticlesByIssue(pub_id) {
  return new Promise((resolve, reject) => {
    db.query(
      `DELETE FROM publication_articles WHERE pub_id = ?`,
      [pub_id],
      (err, rs) => err ? reject(err) : resolve(rs)
    );
  });
}

// Xoá kỳ số khỏi bảng publications
deleteIssue(pub_id) {
  return new Promise((resolve, reject) => {
    db.query(
      `DELETE FROM publications WHERE pub_id = ?`,
      [pub_id],
      (err, rs) => err ? reject(err) : resolve(rs)
    );
  });
}

// lấy tất cả kỳ số của 1 user
getIssuesByUser({ userID, page = 1, limit = 12, status, series_id }) {
  return new Promise((resolve, reject) => {
    const offset = (page - 1) * limit;
    const params = [ userID ];

    let sql = `
      SELECT
        p.*,
        s.name AS series_name,
        COALESCE(COUNT(a.article_id), 0) AS total_articles, u.username AS updated_by
      FROM publications p
      JOIN publication_series s ON s.series_id = p.series_id
      JOIN users u ON u.userID = p.userID
      LEFT JOIN publication_articles a ON a.pub_id = p.pub_id
      WHERE p.userID = ?
    `;

    if (status)    { sql += ' AND p.status = ?';     params.push(status); }
    if (series_id) { sql += ' AND p.series_id = ?';  params.push(series_id); }

    sql += `
      GROUP BY p.pub_id
      ORDER BY p.published_at DESC, p.pub_id DESC
      LIMIT ? OFFSET ?
    `;

    params.push(Number(limit), Number(offset));

    db.query(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
  });
}


  // ===== ARTICLES (BÀI/PHẦN ẤN PHẨM)=====
   // TẠO BÀI ẤN PHẨM
  
createArticle(data) {
  return new Promise((resolve, reject) => {
    db.query(`INSERT INTO publication_articles SET ?`, data,
      (err, rs) => err ? reject(err) : resolve(rs));
  });
}
  // CẬP NHẬT BÀI ẤN PHẨM
 // CẬP NHẬT BÀI ẤN PHẨM
updateArticle(id, data) {
  return new Promise((resolve, reject) => {
    db.query(
      'UPDATE publication_articles SET ? WHERE article_id=?',
      [data, id],
      (err, rs) => {
        if (err) return reject(err);
        if (rs.affectedRows === 0) return reject(new Error("Không tìm thấy bài ấn phẩm"));
        resolve(rs);
      }
    );
  });
}


  // LẤY DANH SÁCH BÀI/“PHẦN” THUỘC 1 KỲ ẤN PHẨM
  getArticlesByIssue(pub_id) {
    return new Promise((resolve, reject) => {
      const sql = `
         SELECT 
        a.*, 
        c.name AS category_name,
        p.issue_no,
        s.series_id,
        s.name AS series_name
      FROM publication_articles a
      LEFT JOIN publication_categories c ON c.pc_id = a.pc_id
      INNER JOIN publications p ON p.pub_id = a.pub_id
      INNER JOIN publication_series s ON s.series_id = p.series_id
      WHERE a.pub_id=? AND a.status='Đã duyệt'
      ORDER BY a.sort_order ASC, a.article_id ASC`;
      db.query(sql, [pub_id], (err, rows) => err ? reject(err) : resolve(rows));
    });
  }


  getArticlesByIssueWithCategory(pub_id) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT a.article_id,a.pub_id,a.pc_id,a.title,a.summary,a.image,
               a.audio_file,a.audio_url,a.sort_order,c.name AS category_name
        FROM publication_articles a
        LEFT JOIN publication_categories c ON c.pc_id=a.pc_id
        WHERE a.pub_id=? AND a.status='Đã duyệt'
        ORDER BY c.name ASC, a.sort_order ASC, a.article_id ASC`;
      db.query(sql, [pub_id], (err, rows) => err ? reject(err) : resolve(rows));
    });
  }


  // LẤY CHI TIẾT 1 BÀI.
  getArticleById(id) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT a.*, p.issue_no, p.series_id, s.name AS series_name, c.name AS category_name
        FROM publication_articles a
        JOIN publications p ON p.pub_id = a.pub_id
        JOIN publication_series s ON s.series_id = p.series_id
        LEFT JOIN publication_categories c ON c.pc_id = a.pc_id
        WHERE a.article_id=?`;
      db.query(sql, [id], (err, rows) => err ? reject(err) : resolve(rows[0]));
    });
  }

  // +1 view cho bài
bumpArticleViews(id) {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE publication_articles
      SET views = COALESCE(views, 0) + 1
      WHERE article_id = ? LIMIT 1
    `;
    db.query(sql, [id], (err, rs) => err ? reject(err) : resolve(rs));
  });
}



  // LẤY BÀI THEO CHUYÊN MỤC.
  getArticlesByCategory(pc_id, pub_id=null) {
    const params = [pc_id];
    let sql = `SELECT * FROM publication_articles WHERE status='Đã duyệt' AND pc_id=?`;
    if (pub_id) { sql += ' AND pub_id=?'; params.push(pub_id); }
    sql += ' ORDER BY sort_order ASC, article_id DESC';
    return new Promise((resolve, reject) => {
      db.query(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
    });
  }

  
// TÌM KIẾM BÀI PHẦN ẤN PHẨM
  searchArticles(q) {
    const like = `%${q}%`;
    const sql = `
      SELECT article_id, pub_id, title, summary
      FROM publication_articles
      WHERE status='Đã duyệt' AND (title LIKE ? OR summary LIKE ?)
      ORDER BY article_id DESC LIMIT 50`;
    return new Promise((resolve, reject) => {
      db.query(sql, [like, like], (err, rows) => err ? reject(err) : resolve(rows));
    });
  }

// Xoá 1 bài theo id
deleteArticle(id) {
  return new Promise((resolve, reject) => {
    const sql = `DELETE FROM publication_articles WHERE article_id = ?`;
    db.query(sql, [id], (err, rs) => err ? reject(err) : resolve(rs));
  });
}



// LẤY TẤT CẢ BÀI ẤN PHẨM THEO USER TẠO
getByUserCreate(id) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        a.article_id, a.pub_id, a.userID, a.pc_id,
        a.title, a.summary, a.content,
        a.image, a.audio_file, a.audio_url,
        a.sort_order, a.status, a.views,
        a.date, a.updated_date, a.updated_by,
        p.issue_no,
        s.name AS series_name,
        c.name AS category_name,
        u.username AS created_by
      FROM publication_articles a
      INNER JOIN publications p ON a.pub_id = p.pub_id
      INNER JOIN publication_series s ON p.series_id = s.series_id
      LEFT JOIN publication_categories c ON a.pc_id = c.pc_id
      INNER JOIN users u ON a.userID = u.userID
      WHERE a.userID = ?
      ORDER BY a.date DESC
    `;
    db.query(sql, [id], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}


// LẤY TOÀN BỘ BÀI THEO 1 KỲ (ADMIN)
getAllByIssueAdmin(pub_id) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT a.*, 
             u.username AS author_name, 
             p.issue_no, 
             s.series_id,
             s.name AS series_name, 
             c.name AS category_name
      FROM publication_articles a
      INNER JOIN users u ON a.userID = u.userID
      INNER JOIN publications p ON a.pub_id = p.pub_id
      INNER JOIN publication_series s ON p.series_id = s.series_id
      LEFT JOIN publication_categories c ON a.pc_id = c.pc_id
      WHERE a.pub_id = ?
      ORDER BY c.pc_id, a.sort_order, a.article_id DESC
    `;
    db.query(sql, [pub_id], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

  // ===== CATEGORIES =====



// // LẤY TẤT CẢ CHUYÊN MỤC
// listCategories(series_id = null) {
//   return new Promise((resolve, reject) => {
//     let sql = `
//       SELECT pc_id, pub_id, name, description, created_at
//       FROM publication_categories
//     `;
//     const params = [];
//     if (series_id) { sql += ' WHERE series_id = ?'; params.push(series_id); }
//     sql += ' ORDER BY created_at ASC, name ASC';

//     db.query(sql, params, (err, rs) => err ? reject(err) : resolve(rs));
//   });
// }

// // LẤY 1 DANH MỤC
// getCategoryById(id) {
//   return new Promise((resolve, reject) => {
//     db.query(`SELECT * FROM publication_categories WHERE pc_id = ?`, [id],
//       (err, rows) => err ? reject(err) : resolve(rows[0]));
//   });
// }


// // slug duy nhất trong 1 series
// findCategoryBySlug(series_id, slug) {
//   return new Promise((resolve, reject) => {
//     db.query(
//       `SELECT pc_id FROM publication_categories WHERE series_id = ? AND slug = ?`,
//       [series_id, slug],
//       (err, rows) => err ? reject(err) : resolve(rows)
//     );
//   });
// }

// // TẠO DANH MỤC
// createCategory(category) {
//   return new Promise((resolve, reject) => {
//     db.query(`INSERT INTO publication_categories SET ?`, category,
//       (err, rs) => err ? reject(err) : resolve(rs));
//   });
// }

// // CẬP NHẬT DANH MỤC
// updateCategory(id, patch) {
//   return new Promise((resolve, reject) => {
//     db.query(
//       `UPDATE publication_categories SET ? WHERE pc_id = ?`,
//       [patch, id],
//       (err, rs) => {
//         if (err) return reject(err);
//         if (rs.affectedRows === 0) return reject(new Error("Không tìm thấy category"));
//         resolve(rs);
//       }
//     );
//   });
// }


//   // XÓA DANH MỤC
// deleteCategory(id) {
//   return new Promise((resolve, reject) => {
//     db.query(`DELETE FROM publication_categories WHERE pc_id = ?`, [id],
//       (err, rs) => err ? reject(err) : resolve(rs));
//   });
// }

// // Đếm & xoá bài viết theo chuyên mục (dùng khi xoá cascade)
// countArticlesByCategory(pc_id) {
//   return new Promise((resolve, reject) => {
//     db.query(`SELECT COUNT(*) AS total FROM publication_articles WHERE pc_id = ?`, [pc_id],
//       (err, rows) => err ? reject(err) : resolve(rows[0]));
//   });
// }

//   // XÓA DANH MỤC
// deleteArticlesByCategory(pc_id) {
//   return new Promise((resolve, reject) => {
//     db.query(`DELETE FROM publication_articles WHERE pc_id = ?`, [pc_id],
//       (err, rs) => err ? reject(err) : resolve(rs));
//   });
// }

// ===== CATEGORIES (DANH MỤC ẤN PHẨM) – MODEL ===== đã bỏ pub_id

/** Lấy tất cả danh mục (toàn site) */
listCategories() {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT pc_id, name, description, created_at
      FROM publication_categories
      ORDER BY created_at DESC, pc_id DESC
    `;
    db.query(sql, (err, rows) => err ? reject(err) : resolve(rows));
  });
}

/** Lấy 1 danh mục theo pc_id */
getCategoryById(id) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT pc_id, name, description, created_at
      FROM publication_categories
      WHERE pc_id = ?
      LIMIT 1
    `;
    db.query(sql, [id], (err, rows) => err ? reject(err) : resolve(rows[0]));
  });
}

/** Tạo danh mục */
createCategory(category) {
  return new Promise((resolve, reject) => {
    db.query(`INSERT INTO publication_categories SET ?`, category,
      (err, rs) => err ? reject(err) : resolve(rs));
  });
}

/** Cập nhật danh mục */
updateCategory(id, patch) {
  return new Promise((resolve, reject) => {
    db.query(`UPDATE publication_categories SET ? WHERE pc_id = ?`,
      [patch, id],
      (err, rs) => {
        if (err) return reject(err);
        if (rs.affectedRows === 0) return reject(new Error('Không tìm thấy category'));
        resolve(rs);
      }
    );
  });
}

/** Xoá danh mục */
deleteCategory(id) {
  return new Promise((resolve, reject) => {
    db.query(`DELETE FROM publication_categories WHERE pc_id = ?`, [id],
      (err, rs) => err ? reject(err) : resolve(rs));
  });
}

/** Đếm số bài thuộc 1 danh mục (để cảnh báo/xoá cascade) */
countArticlesByCategory(pc_id) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT COUNT(*) AS total FROM publication_articles WHERE pc_id = ?`;
    db.query(sql, [pc_id], (err, rows) => err ? reject(err) : resolve(rows[0]));
  });
}

/** Xoá tất cả bài theo danh mục (nếu muốn cascade) */
deleteArticlesByCategory(pc_id) {
  return new Promise((resolve, reject) => {
    // Nếu bạn cần xoá file vật lý (image/audio) thì xử lý trước khi DELETE
    db.query(`DELETE FROM publication_articles WHERE pc_id = ?`, [pc_id],
      (err, rs) => err ? reject(err) : resolve(rs));
  });
}


// Tú yêu cầu 

  // Lấy username để ghi updated_by tự động
  getUsernameByUserId(userID) {
    return new Promise((resolve, reject) => {
      db.query('SELECT username FROM users WHERE userID=?', [userID], (err, rows) =>
        err ? reject(err) : resolve(rows?.[0]?.username || null)
      );
    });
  }

  // Cập nhật bài theo article_id + pub_id, chỉ update các trường có giá trị
  updateArticleByPub(article_id, pub_id, payload = {}) {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];

      // chỉ push các cột có undefined !== value
      const push = (col, val) => {
        if (val !== undefined) {
          fields.push(`${col} = ?`);
          values.push(val);
        }
      };

      push('pc_id', payload.pc_id);
      push('title', payload.title);
      push('summary', payload.summary);
      push('content', payload.content);
      push('sort_order', payload.sort_order);
      push('status', payload.status);
      push('audio_url', payload.audio_url);
      push('image', payload.image);
      push('audio_file', payload.audio_file);
      push('updated_by', payload.updated_by);
      push('updated_date', payload.updated_date);
      push('date', payload.date);

      if (!fields.length) {
        // Không có gì để cập nhật
        return resolve({ affectedRows: 0 });
      }

      const sql = `
        UPDATE publication_articles
        SET ${fields.join(', ')}
        WHERE article_id = ? AND pub_id = ?
      `;
      values.push(article_id, pub_id);

      db.query(sql, values, (err, rs) => err ? reject(err) : resolve(rs));
    });
  }

  // Xoá bài theo article_id + pub_id
  deleteArticleByPub(article_id, pub_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'DELETE FROM publication_articles WHERE article_id=? AND pub_id=?',
        [article_id, pub_id],
        (err, rs) => err ? reject(err) : resolve(rs)
      );
    });
  }

  // LẤY CHI TIẾT 1 BÀI THEO PUB + ID (mới)
getArticleByPubAndId(pub_id, article_id) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT a.*,
             p.issue_no, p.series_id,
             s.name AS series_name,
             c.name AS category_name
      FROM publication_articles a
      JOIN publications p       ON p.pub_id    = a.pub_id
      JOIN publication_series s ON s.series_id = p.series_id
      LEFT JOIN publication_categories c ON c.pc_id = a.pc_id
      WHERE a.article_id = ? AND a.pub_id = ?
      LIMIT 1
    `;
    db.query(sql, [article_id, pub_id],
      (err, rows) => err ? reject(err) : resolve(rows[0] || null)
    );
  });
}

// +1 VIEW THEO PUB + ID (mới)
bumpArticleViewsByPub(pub_id, article_id) {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE publication_articles
      SET views = COALESCE(views, 0) + 1
      WHERE article_id = ? AND pub_id = ?
      LIMIT 1
    `;
    db.query(sql, [article_id, pub_id],
      (err, rs) => err ? reject(err) : resolve(rs)
    );
  });
}

// LẤY BÀI THEO CHUYÊN MỤC + PUB (mới)
getArticlesByCategoryByPub(pc_id, pub_id) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT a.*,
             p.issue_no, p.series_id,
             s.name AS series_name,
             c.name AS category_name
      FROM publication_articles a
      JOIN publications p       ON p.pub_id    = a.pub_id
      JOIN publication_series s ON s.series_id = p.series_id
      LEFT JOIN publication_categories c ON c.pc_id = a.pc_id
      WHERE a.status='Đã duyệt' AND a.pc_id=? AND a.pub_id=?
      ORDER BY a.sort_order ASC, a.article_id DESC
    `;
    db.query(sql, [pc_id, pub_id], (err, rows) =>
      err ? reject(err) : resolve(rows)
    );
  });
}
}




module.exports = new PublicationModel();
