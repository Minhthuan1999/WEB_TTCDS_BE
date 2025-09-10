// controllers/PublicationController.js
const moment = require('moment');
const fs = require('fs');   // 🔥 Bổ sung dòng này
const Publication = require('../models/publicationModel');
const path = require('path');   
const Users = require('../models/userModel'); // thêm

const fileURL = (name) => (name ? `/uploads/${name}` : null);


const UPLOAD_PUB_DIR = path.join(process.cwd(), 'uploads');


// Xoá file an toàn, không lỗi nếu không tồn tại
async function removeFileIfExists(filename) {
  if (!filename) return;

  // chỉ lấy tên file, tránh prefix thư mục
  const clean = path.basename(filename);
  const filePath = path.join(UPLOAD_PUB_DIR, clean);

  console.log(" Đang xoá file:", filePath);

  try {
    await fs.promises.unlink(filePath);
    console.log("Đã xoá:", filePath);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.warn("File không tồn tại:", filePath);
    } else {
      console.error("Lỗi xoá file:", err);
    }
  }
}

class PublicationController {
  // ===== SERIES (CHUYÊN ĐỀ)=====
// TẠO CHUYÊN ĐỀ
async createSeries(req, res) {
  try {
    const { title, name, description, status, posted_at } = req.body;
    if (!title || !name) return res.status(400).json({ message: 'Thiếu dữ liệu' });

         // Nếu không có published_at từ body => lấy ngày giờ hiện tại
    const seriesDate = posted_at 
      ? moment(posted_at, "DD-MM-YYYY").format("YYYY-MM-DD HH:mm:ss")
      : moment().format("YYYY-MM-DD HH:mm:ss");

    // const slug = slugify(name);

    const result = await Publication.createSeries({
      title,
      name,
      // slug,
      description,
      status: status || 'Hiện',
      hero_image: req.files?.image?.[0]?.filename || null,
      posted_at: seriesDate
    });

    res.status(200).json({ success: true, message: "Thêm chuyên đề thành công", series_id: result.insertId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Lỗi' });
  }
}


// CẬP NHẬT CHUYÊN ĐỀ
async updateSeries(req, res) {
  try {
    const { title, name, description, status, posted_at } = req.body;

    const patch = {
      title,
      name,
      description,
      status,
      updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      posted_at: posted_at
        ? moment(posted_at, "DD-MM-YYYY").format("YYYY-MM-DD HH:mm:ss")
        : moment().format("YYYY-MM-DD HH:mm:ss")  // tự lấy thời gian hiện tại
    };

    if (req.files?.image?.[0]?.filename) {
      patch.hero_image = req.files.image[0].filename;
    }

    await Publication.updateSeries(req.params.id, patch);

    res.status(200).json({ success: true, message: "Cập nhật chuyên đề thành công" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Lỗi" });
  }
}

// LẤY TẤT CẢ CHUYÊN ĐỀ
  async listSeries(req, res) {
    try {
      const rows = await Publication.listSeries();
      rows.forEach(r => r.hero_url = fileURL(r.hero_image));
      res.status(200).json(rows);
    } catch (e) { console.error(e); res.status(500).json({ message: 'Lỗi' }); }
  }

  // LẤY 1 CHUYÊN ĐỀ
  async viewSeries(req, res) {
    try {
      const id = req.params.id;
      const s = await Publication.getSeriesById(id);
      if (!s) return res.status(404).json({ message: 'Không tìm thấy chuyên đề' });
      // +1 view khi mở trang chuyên đề
      await Publication.bumpSeriesViews(id);

      res.status(200).json({ ...s, hero_url: fileURL(s.hero_image) });
    } catch (e) { console.error(e); res.status(500).json({ message: 'Lỗi' }); }
  }

  // XÓA CHUYÊN ĐỀ
  async deleteSeries(req, res) {
        try {
            const { id } = req.params;
            if (!id) return res.status(400).json({ message: "Thiếu ID chuyên đề" });

            const result = await Publication.deleteSeries(id);
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Không tìm thấy chuyên đề" });
            }

            res.status(200).json({ success: true, message: "Xóa chuyên đề thành công" });
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: "Lỗi server" });
        }
    }





   
  // ===== ISSUES (KỲ SỐ ẤN PHẨM) =====
// TẠO ẤN PHẨM
async createIssue(req, res) {
  try {
    const { series_id, issue_no, published_at, status = 'Nhập tin', userID } = req.body;
    if (!series_id || !issue_no) {
      return res.status(400).json({ message: 'Thiếu series_id hoặc issue_no' });
    }
    if (!userID) {
      return res.status(400).json({ message: 'Thiếu userID' });
    }

    const cover   = req.files?.image?.[0]?.filename || null;
    const pdf_file = req.files?.file?.[0]?.filename || null;

    // published_at: lấy từ body hoặc mặc định thời điểm hiện tại
    const pubDate = published_at
      ? moment(published_at, 'DD-MM-YYYY').format('YYYY-MM-DD HH:mm:ss')
      : moment().format('YYYY-MM-DD HH:mm:ss');

    const rs = await Publication.createIssue({
      series_id,
      userID,               // ✅ thêm userID
      issue_no,
      cover,
      pdf_file,
      status,
      published_at: pubDate
    });

    res.status(200).json({
      success: true,
      message: status === 'Nhập tin' ? 'Lưu thành công' : 'Chuyển đi thành công',
      pub_id: rs.insertId
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Lỗi' });
  }
}

  // CẬP NHẬT ẤN PHẨM
async updateIssue(req, res) {
  try {
    const { series_id, issue_no, published_at, status, userID } = req.body;
    const patch = {};

    if (series_id) patch.series_id = series_id;
    if (issue_no)  patch.issue_no  = issue_no;
    if (status)    patch.status    = status;
    if (userID)    patch.userID    = userID;  // ✅ cho phép cập nhật userID

    if (req.files?.image?.[0]?.filename) {
      patch.cover = req.files.image[0].filename;
    }
    if (req.files?.file?.[0]?.filename) {
      patch.pdf_file = req.files.file[0].filename;
    }

    if (published_at) {
      patch.published_at = moment(published_at, 'DD-MM-YYYY').format('YYYY-MM-DD HH:mm:ss');
    }

    await Publication.updateIssue(req.params.id, patch);

    res.status(200).json({
      success: true,
      message: 'Cập nhật kỳ số ấn phẩm thành công'
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Lỗi' });
  }
}

  // LẤY 1 ẤN PHẨM
  async viewIssue(req, res) {
    try {
      const issue = await Publication.getIssueById(req.params.id);
      if (!issue) return res.status(404).json({ message: 'Không tìm thấy' });
      issue.cover_url = fileURL(issue.cover);
      issue.pdf_url   = fileURL(issue.pdf_file);

      const articles = await Publication.getArticlesByIssue(issue.pub_id);
      res.status(200).json({ issue, articles });
    } catch (e) { console.error(e); res.status(500).json({ message: 'Lỗi' }); }
  }


  // LẤY TOÀN BỘ ẤN PHẨM
  async listIssues(req, res) {
    try {
      const { series_id, page=1, limit=12, status } = req.query;
      const rows = await Publication.getIssues({ series_id, page, limit, status });
      rows.forEach(r => { r.cover_url = fileURL(r.cover); r.pdf_url = fileURL(r.pdf_file); });
      res.status(200).json(rows);
    } catch (e) { console.error(e); res.status(500).json({ message: 'Lỗi' }); }
  }

// LẤY TOÀN BỘ ẤN PHẨM (ADMIN)
async getIssuesAdmin(req, res) {
  try {
    const { series_id, page, limit, status } = req.query;
    const rs = await Publication.getIssuesAdmin({ series_id, page, limit, status });
    res.status(200).json(rs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi lấy danh sách ấn phẩm (Admin)" });
  }
}

// LẤY SỐ MỚI NHẤT + CHUYÊN MỤC ẤN PHẨM
  async latestIssue(req, res) {
  try {
    const { series_id } = req.query;

    // Lấy số mới nhất theo series hoặc toàn hệ thống
    const issue = series_id
      ? await Publication.getLatestIssueBySeries(series_id)
      : await Publication.getLatestIssue();

    if (!issue) return res.status(404).json({ message: 'Chưa có số đã duyệt' });

    // Lấy bài + tên chuyên mục
    const rows = await Publication.getArticlesByIssueWithCategory(issue.pub_id);

    // Nhóm theo chuyên mục để FE render cột bên phải
    const groups = {};
    for (const r of rows) {
      const key = r.pc_id || 0;
      if (!groups[key]) groups[key] = { pc_id: r.pc_id || 0, name: r.category_name || 'Khác', articles: [] };
      groups[key].articles.push({
        article_id: r.article_id,
        title: r.title,
        summary: r.summary,
        has_audio: !!(r.audio_file || r.audio_url)
      });
    }

    // Trả đúng phần “số mới nhất”
    return res.status(200).json({
      pub_id: issue.pub_id,
      userID: issue.userID,
      series_id: issue.series_id,
      series_name: issue.series_name,
      issue_no: issue.issue_no,
      cover_url: fileURL(issue.cover),
      pdf_url: fileURL(issue.pdf_file),
      published_at: issue.published_at,
      updated_by: issue.updated_by,
      outline: Object.values(groups)
    });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Lỗi' }); }
}


// LẤY CÁC SỐ KỲ TRƯỚC
async previousIssuesFull(req, res) {
  try {
    const { series_id } = req.query;
    if (!series_id) return res.status(400).json({ message: 'Thiếu series_id' });

    const limit  = req.query.limit ? Number(req.query.limit) : null;
    const status = req.query.status || null;        // null = không lọc trạng thái

    // tự tìm số mới nhất để loại trừ
    const latest = await Publication.getLatestIssueBySeries(series_id, status);
    const exclude_pub_id = latest?.pub_id || null;

    // lấy danh sách "các số trước"
    const issues = await Publication.getIssuesBySeries(series_id, {
      exclude_pub_id,
      limit,
      status
    });

    if (issues.length === 0) {
      return res.status(200).json({ series_id: Number(series_id), previous: [] });
    }

    // lấy toàn bộ bài của các kỳ đó (1 query)
    const pubIds   = issues.map(i => i.pub_id);
    const rows     = await Publication.getArticlesByIssuesWithCategory(pubIds, 'Đã duyệt'); // hoặc dùng 'status' nếu muốn đồng bộ
    const byPubMap = {};

    // group theo pub_id -> pc_id
    for (const r of rows) {
      if (!byPubMap[r.pub_id]) byPubMap[r.pub_id] = {};
      const key = r.pc_id || 0;
      if (!byPubMap[r.pub_id][key]) {
        byPubMap[r.pub_id][key] = { pc_id: r.pc_id || 0, name: r.category_name || 'Khác', articles: [] };
      }
      byPubMap[r.pub_id][key].articles.push({
        article_id: r.article_id,
        title: r.title,
        summary: r.summary,
        has_audio: !!(r.audio_file || r.audio_url)
      });
    }

    const previous = issues.map(p => ({
      pub_id: p.pub_id,
      userID: p.userID,
      issue_no: p.issue_no,
      series_id: p.series_id,
      series_name: p.series_name,
      cover_url: p.cover ? `/uploads/${p.cover}` : null,
      pdf_url: p.pdf_file ? `/uploads/${p.pdf_file}` : null,
      updated_by: p.updated_by,
      published_at: p.published_at,
      outline: Object.values(byPubMap[p.pub_id] || {})   // <<==== phần bên phải bạn cần
    }));

    return res.status(200).json({ series_id: Number(series_id), previous });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Lỗi' });
  }
}


// XÓA SỐ ẤN PHẨM
  async deleteIssue(req, res) {
    try {
      const id = req.params.id;
      const { cascade = '0' } = req.query;

      const issue = await Publication.getIssueById(id);
      if (!issue) return res.status(404).json({ message: 'Không tìm thấy ấn phẩm' });

      // kiểm tra còn bài không
      const { total } = await Publication.countArticlesByIssue(id);
      if (Number(total) > 0 && cascade !== '1') {
        return res.status(409).json({
          message: 'Ấn phẩm còn bài viết, không thể xoá. Gọi lại với ?cascade=1 để xoá kèm các bài.',
          articles: Number(total)
        });
      }

      // xoá bài nếu cascade
      if (Number(total) > 0 && cascade === '1') {
        await Publication.deleteArticlesByIssue(id);
      }

      // xoá ấn phẩm
      const rs = await Publication.deleteIssue(id);
      if (rs.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy ấn phẩm' });

      // xoá file cover & pdf
      await removeFileIfExists(issue.cover);
      await removeFileIfExists(issue.pdf_file);

      return res.status(200).json({
        success: true,
        message: 'Xóa thành công',
        deleted_articles: Number(total)
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Lỗi' });
    }
  }

// lấy tất cả ấn phẩm của 1 user
  async getIssuesByUser(req, res) {
  try {
    // cho phép nhận userID từ params hoặc query
    const userID = req.params.userID || req.query.userID;
    if (!userID) return res.status(400).json({ message: 'Thiếu userID' });

    const page      = Number(req.query.page  || 1);
    const limit     = Number(req.query.limit || 12);
    const status    = req.query.status || null;     // 'Đã duyệt' / 'Chờ duyệt' / 'Từ chối' ...
    const series_id = req.query.series_id || null;  // nếu muốn lọc theo series

    const rows = await Publication.getIssuesByUser({
      userID, page, limit, status, series_id
    });

    // (tuỳ chọn) map ra URL cho cover/pdf nếu bạn có helper fileURL(...)
    // const data = rows.map(r => ({
    //   ...r,
    //   cover_url: fileURL(r.cover),
    //   pdf_url:   fileURL(r.pdf_file)
    // }));

    res.status(200).json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Lỗi' });
  }
}

  // ===== ARTICLES (BÀI/PHẦN ẤN PHẨM)=====
//   // TẠO BÀI ẤN PHẨM
  async createArticle(req, res) {
    try {
      const { pub_id, userID, pc_id, title, summary, content, sort_order=0, status='Nhập tin', audio_url } = req.body;
      if (!pub_id || !title) return res.status(400).json({ message: 'Thiếu pub_id/title' });

      const image = req.files?.image?.[0]?.filename || null;
      const audio_file = req.files?.audio?.[0]?.filename || null;
// tự lấy username từ userID để ghi updated_by
    let updated_by = null;
    if (userID) {
      const uid = parseInt(userID, 10);
      if (!Number.isNaN(uid)) {
        const u = await Users.getById(uid);
        if (u) updated_by = u.username || u.name || String(uid);
      }
    }

      const rs = await Publication.createArticle({
        pub_id, userID, pc_id: pc_id || null, title, summary, content,
        image, audio_file, audio_url: audio_url || null, updated_by, 
        sort_order: Number(sort_order), status
      });
      res.status(200).json({ success: true, message: status === 'Nháp tin' ? 'Lưu thành công' : 'Chuyển đi thành công', article_id: rs.insertId });
    } catch (e) { console.error(e); res.status(500).json({ message: 'Lỗi' }); }
  }



// CẬP NHẬT BÀI ẤN PHẨM


  async updateArticle(req, res) {
  try {
    const id = Number(req.params.id);

    const {
      pub_id, userID, pc_id, title, summary, content,
      sort_order, status, audio_url,
      updated_by: updatedByClient // ← tên khác, không đụng vào biến kết quả
    } = req.body;

    // build patch từng phần, không tham chiếu biến chưa có
    const patch = {
      pub_id,
      pc_id,
      title,
      summary,
      content,
      status,
      audio_url
    };
    if (sort_order !== undefined) patch.sort_order = Number(sort_order);
    if (req.files?.image?.[0]) patch.image = req.files.image[0].filename;
    if (req.files?.audio?.[0]) patch.audio_file = req.files.audio[0].filename;

    // Quyết định updated_by:
    // 1) Nếu client gửi chuỗi updated_by → dùng luôn
    // 2) Nếu không, mà có userID → tra username theo userID
    let finalUpdatedBy;
    if (updatedByClient && String(updatedByClient).trim() !== '') {
      finalUpdatedBy = String(updatedByClient).trim();
    } else if (userID) {
      const u = await Users.getById(parseInt(userID, 10));
      if (u) finalUpdatedBy = u.username || u.name || String(userID);
    }
    if (finalUpdatedBy !== undefined) patch.updated_by = finalUpdatedBy;

    // xoá các key undefined để tránh set NULL ngoài ý muốn
    Object.keys(patch).forEach(k => patch[k] === undefined && delete patch[k]);

    await Publication.updateArticle(id, patch);
    return res.status(200).json({ success: true, message: 'Cập nhật bài ấn phẩm thành công' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Lỗi' });
  }
}

// LẤY DANH SÁCH BÀI/“PHẦN” THUỘC 1 KỲ ẤN PHẨM
  async getArticlesByIssue(req, res) {
    try {
      const rows = await Publication.getArticlesByIssue(req.params.pub_id);
      res.status(200).json(rows);
    } catch (e) { console.error(e); res.status(500).json({ message: 'Lỗi' }); }
  }


// LẤY CHI TIẾT 1 BÀI (tự +1 view trước rồi lấy dữ liệu mới nhất)
async getArticleById(req, res) {
  try {
    const id = Number(req.params.id);

    await Publication.bumpArticleViews(id);        // +1 view
    const row = await Publication.getArticleById(id);
    if (!row) return res.status(404).json({ message: 'Không tìm thấy bài' });

    row.image_url      = fileURL(row.image);
    row.audio_file_url = fileURL(row.audio_file);

    return res.status(200).json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Lỗi' });
  }
}




// LẤY BÀI THEO CHUYÊN MỤC.
  async getByCategory(req, res) {
    try {
      const { pc_id } = req.params;
      const { pub_id } = req.query;
      const rows = await Publication.getArticlesByCategory(pc_id, pub_id);
      res.status(200).json(rows);
    } catch (e) { console.error(e); res.status(500).json({ message: 'Lỗi' }); }
  }

// TÌM KIẾM BÀI PHẦN ẤN PHẨM
  async search(req, res) {
    try {
      const { q='' } = req.query;
      const rows = await Publication.searchArticles(q);
      res.status(200).json(rows);
    } catch (e) { console.error(e); res.status(500).json({ message: 'Lỗi' }); }
  }

// XÓA BÀI/PHẦN ẤN PHẨM
  async deleteArticle(req, res) {
    try {
      const id = req.params.id;

      const art = await Publication.getArticleById(id);
      if (!art) return res.status(404).json({ message: 'Không tìm thấy bài' });

      const rs = await Publication.deleteArticle(id);
      if (rs.affectedRows === 0) return res.status(404).json({ message: 'Không có gì để xoá' });

      // Xoá file đính kèm nếu có
      await removeFileIfExists(art.image);
      await removeFileIfExists(art.audio_file);

      return res.status(200).json({ success: true,message: 'Xóa bài ấn phẩm thành công', deleted_id: Number(id) });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: 'Lỗi' });
    }
  }

    // LẤY BÀI ẤN PHẨM THEO USER TẠO
async getByUserCreate(req, res) {
  try {
    const posts = await Publication.getByUserCreate(req.params.id);
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Đã xảy ra lỗi" });
  }
}

  // GET tất cả bài theo 1 kỳ ấn phẩm (ADMIN)
async getAllByIssueAdmin(req, res) {
  try {
    const posts = await Publication.getAllByIssueAdmin(req.params.id);
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Đã xảy ra lỗi" });
  }
}


//     // --------- CATEGORIES (DANH MỤC ẤN PHẨM) ----------
//     // LẤY TẤT CẢ CHUYÊN MỤC
//   async listCategories(req, res) {
//     try {
//       const { series_id } = req.query;
//       const rows = await Publication.listCategories(series_id || null);
//       res.status(200).json(rows);
//     } catch (e) { console.error(e); res.status(500).json({ message: 'Lỗi' }); }
//   }
// // LẤY 1 DANH MỤC
//   async getCategory(req, res) {
//     try {
//       const row = await Publication.getCategoryById(req.params.id);
//       if (!row) return res.status(404).json({ message: 'Không tìm thấy' });
//       res.status(200).json(row);
//     } catch (e) { console.error(e); res.status(500).json({ message: 'Lỗi' }); }
//   }
// // TẠO DANH MỤC
//   async createCategory(req, res) {
//     try {
//       const { pub_id, name, description } = req.body;
//       if (!pub_id || !name) return res.status(400).json({ message: 'Thiếu pub_id hoặc name' });
//       const rs = await Publication.createCategory({
//         pub_id,
//         name,
//         // slug,
//         description,
//         created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
//       });
//      res.status(200).json({ success: true, message: 'Tạo Danh mục thành công', pc_id: rs.insertId });
//     } catch (e) { console.error(e); res.status(500).json({ message: 'Lỗi' }); }
//   }

// // CẬP NHẬT DANH MỤC
//   async updateCategory(req, res) {
//     try {
//       const { pub_id, name, description } = req.body;
//       const id = req.params.id;
//       if (!pub_id || !name) return res.status(400).json({ message: 'Thiếu pub_id hoặc name' });

//       await Publication.updateCategory(id, {
//         pub_id,
//         name,
//         // slug,
//         description,
//       });

//       res.status(200).json({ success: true, message: 'Cập nhật Danh mục thành công', });
//     } catch (e) {
//       console.error(e);
//       if (e && e.code === 'ER_DUP_ENTRY')
//         return res.status(409).json({ message: 'Slug đã tồn tại trong series này' });
//       res.status(500).json({ message: 'Lỗi' });
//     }
//   }

//   // XÓA DANH MỤC
//   async deleteCategory(req, res) {
//     try {
//       const id = req.params.id;
//       const { cascade = '0' } = req.query;

//       // còn bài viết thì tuỳ chọn xoá kèm
//       const { total } = await Publication.countArticlesByCategory(id);
//       if (Number(total) > 0 && cascade !== '1') {
//         return res.status(409).json({
//           message: 'Chuyên mục còn bài viết, không thể xoá. Gọi lại với ?cascade=1 để xoá kèm các bài.',
//           articles: Number(total)
//         });
//       }

//       if (Number(total) > 0) {
//         await Publication.deleteArticlesByCategory(id);
//       }

//       const rs = await Publication.deleteCategory(id);
//       if (rs.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy' });

//       res.status(200).json({ success: true, message: 'Xóa Danh mục thành công',  deleted_articles: Number(total) });
//     } catch (e) { console.error(e); res.status(500).json({ message: 'Lỗi' }); }
//   }

  // --------- CATEGORIES (DANH MỤC ẤN PHẨM) --------- đã bỏ pub_id

// LẤY TẤT CẢ DANH MỤC
async listCategories(req, res) {
  try {
    const rows = await Publication.listCategories();
    res.status(200).json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Lỗi' });
  }
}

// LẤY 1 DANH MỤC
async getCategory(req, res) {
  try {
    const row = await Publication.getCategoryById(req.params.id);
    if (!row) return res.status(404).json({ message: 'Không tìm thấy' });
    res.status(200).json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Lỗi' });
  }
}

// TẠO DANH MỤC  (KHÔNG CÒN pub_id)
async createCategory(req, res) {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Thiếu name' });

    const created_at = moment().format('YYYY-MM-DD HH:mm:ss');

    const rs = await Publication.createCategory({ name, description, created_at });
    res.status(200).json({ success: true, message: 'Tạo Danh mục thành công', pc_id: rs.insertId });
  } catch (e) {
    console.error(e);
    // nếu có UNIQUE name -> ER_DUP_ENTRY
    if (e && e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Tên danh mục đã tồn tại' });
    }
    res.status(500).json({ message: 'Lỗi' });
  }
}

// CẬP NHẬT DANH MỤC
async updateCategory(req, res) {
  try {
    const id = req.params.id;
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Thiếu name' });

    await Publication.updateCategory(id, { name, description });
    res.status(200).json({ success: true, message: 'Cập nhật Danh mục thành công' });
  } catch (e) {
    console.error(e);
    if (e && e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Tên danh mục đã tồn tại' });
    }
    res.status(500).json({ message: 'Lỗi' });
  }
}

// XOÁ DANH MỤC
// - Mặc định: nếu còn bài -> trả 409
// - Nếu ?force=1 -> xoá hết bài trong danh mục rồi xoá danh mục
async deleteCategory(req, res) {
  try {
    const id = req.params.id;
    const cascade = String(req.query.cascade || '') === '1';

    const { total } = await Publication.countArticlesByCategory(id);
    if (total > 0 && !cascade) {
      return res.status(409).json({
        success: false,
        message: `Danh mục còn ${total} bài. Thêm ?cascade=1 để xoá cùng các bài.`
      });
    }

    if (total > 0 && cascade) {
      await Publication.deleteArticlesByCategory(id);
    }

    await Publication.deleteCategory(id);
    res.status(200).json({ success: true, message: 'Đã xoá danh mục' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Lỗi' });
  }
}



// Tú yêu cầu
 // TẠO BÀI/PHẦN THEO pub_id Ở PATH
  async createArticleByPub(req, res) {
    try {
      const pub_id = Number(req.params.pub_id);
      const {
        userID,           // bắt buộc (để ghi updated_by tự động)
        pc_id,            // có thể null
        title,            // bắt buộc
        summary,          // mô tả ngắn
        content,          // nội dung
        sort_order = 0,   // số thứ tự hiển thị (tăng dần)
        status = 'Nhập tin',  // 'Nháp' | 'Đã duyệt' | …
        audio_url,
        date      // link audio ngoài (nếu có)
      } = req.body;

      if (!pub_id || !userID || !title) {
        return res.status(400).json({ message: 'Thiếu pub_id/userID/title' });
      }

      // file đính kèm
      const image = req.files?.image?.[0]?.filename || null;
      const audio_file = req.files?.audio?.[0]?.filename || null;

      // Nếu không có published_at từ body => lấy ngày giờ hiện tại
    const pubDate = date
      ? moment(date, "DD-MM-YYYY").format("YYYY-MM-DD HH:mm:ss")
      : moment().format("YYYY-MM-DD HH:mm:ss");

      // lấy username để set updated_by
      const username = await Publication.getUsernameByUserId(userID);

      const rs = await Publication.createArticle({
        pub_id,
        userID,
        pc_id: pc_id || null,
        title,
        summary,
        content,
        image,
        audio_file,
        audio_url: audio_url || null,
        sort_order: Number(sort_order) || 0,
        status,
        updated_by: username || null,
        date: pubDate
      });

      return res
        .status(200)
        .json({ success: true, message: status === 'Nháp tin' ? 'Lưu thành công' : 'Chuyển đi thành công', article_id: rs.insertId });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: 'Lỗi' });
    }
  }

   // CẬP NHẬT BÀI/PHẦN THEO pub_id + article_id
  // -------------------------
  async updateArticleByPub(req, res) {
    try {
      const pub_id = Number(req.params.pub_id);
      const article_id = Number(req.params.article_id);

      if (!pub_id || !article_id) {
        return res.status(400).json({ message: 'Thiếu pub_id/article_id' });
      }

      const {
        userID,        // để set updated_by tự động (nếu có)
        pc_id,
        title,
        summary,
        content,
        sort_order,
        status,
        audio_url,
        date
      } = req.body;

      const image = req.files?.image?.[0]?.filename || null;
      const audio_file = req.files?.audio?.[0]?.filename || null;

      // Nếu không có published_at từ body => lấy ngày giờ hiện tại
    const pubDate = date
      ? moment(date, "DD-MM-YYYY").format("YYYY-MM-DD HH:mm:ss")
      : moment().format("YYYY-MM-DD HH:mm:ss");

      let updated_by = null;
      if (userID) {
        updated_by = await Publication.getUsernameByUserId(userID);
      }

      const payload = {
        pc_id: pc_id ?? undefined,                 // undefined = không cập nhật cột
        title: title ?? undefined,
        summary: summary ?? undefined,
        content: content ?? undefined,
        sort_order: (sort_order !== undefined ? Number(sort_order) : undefined),
        status: status ?? undefined,
        audio_url: audio_url ?? undefined,
        image: image ?? undefined,                 // chỉ cập nhật khi có file mới
        audio_file: audio_file ?? undefined,
        updated_by: updated_by ?? undefined,
        date: pubDate 
      };

      const rs = await Publication.updateArticleByPub(article_id, pub_id, payload);

      if (rs.affectedRows === 0) {
        return res.status(404).json({ message: 'Không tìm thấy bài để cập nhật' });
      }

      return res.status(200).json({ success: true, message: 'Cập nhật bài thành công' });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: 'Lỗi server khi cập nhật bài' });
    }
  }

  // -------------------------
  // XOÁ BÀI/PHẦN THEO pub_id + article_id
  // -------------------------
  async deleteArticleByPub(req, res) {
    try {
      const pub_id = Number(req.params.pub_id);
      const article_id = Number(req.params.article_id);

      if (!pub_id || !article_id) {
        return res.status(400).json({ message: 'Thiếu pub_id/article_id' });
      }

      const art = await Publication.getArticleById(article_id);
      if (!art) return res.status(404).json({ message: 'Không tìm thấy bài' });


      const rs = await Publication.deleteArticleByPub(article_id, pub_id);
      if (rs.affectedRows === 0) {
        return res.status(404).json({ message: 'Không tìm thấy bài để xoá' });
      }
           // Xoá file đính kèm nếu có
      await removeFileIfExists(art.image);
      await removeFileIfExists(art.audio_file);


      return res.status(200).json({ success: true, message: 'Xoá bài thành công' });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: 'Lỗi server khi xoá bài' });
    }
  }


  // LẤY CHI TIẾT 1 BÀI THEO PUB + ID (mới)
async getArticleByPubAndId(req, res) {
  try {
    const pub_id = Number(req.params.pub_id);
    const id     = Number(req.params.article_id);

    await Publication.bumpArticleViewsByPub(pub_id, id); // +1 view

    const row = await Publication.getArticleByPubAndId(pub_id, id);
    if (!row) return res.status(404).json({ message: "Không tìm thấy bài" });

    row.image_url      = fileURL(row.image);
    row.audio_file_url = fileURL(row.audio_file);

    return res.status(200).json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Lỗi" });
  }
}

// LẤY BÀI THEO CHUYÊN MỤC + PUB (mới)
async getByCategoryByPub(req, res) {
  try {
    const pc_id  = Number(req.params.pc_id);
    const pub_id = Number(req.params.pub_id);

    const rows = await Publication.getArticlesByCategoryByPub(pc_id, pub_id);

    // (tuỳ chọn) map URL file cho tiện dùng ở FE
    for (const r of rows) {
      r.image_url      = fileURL(r.image, req);
      r.audio_file_url = fileURL(r.audio_file, req);
    }

    return res.status(200).json(rows);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Lỗi" });
  }
}
}



module.exports = new PublicationController();
