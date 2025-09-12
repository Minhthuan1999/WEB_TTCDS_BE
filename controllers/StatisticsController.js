// controllers/StatisticsController.js
// const Statistics = require("../models/statisticsModel");
// const Category = require("../models/statisticsCategoryModel");
// const { removeFileIfExists } = require("../middleware/fileHelper");

// class StatisticsController {
//   // CREATE
//   async create(req, res) {
//     try {
//       const image = req.files?.image?.[0]?.filename || null;
//       const file  = req.files?.file?.[0]?.filename  || null;

//       const { name, description, content, category_id } = req.body;
//       if (!name) return res.status(400).json({ error: "Name is required" });

//              // kiểm tra category_id (nếu có)
//       let categoryId = null;
//       if (category_id) {
//         const cat = await Category.findById(category_id);
//         if (!cat) return res.status(400).json({ error: "category_id không tồn tại" });
//         categoryId = Number(category_id);
//       }

//       const data = { category_id, name, description, content, image, file };
//       const rs = await Statistics.create(data);

//       res.status(201).json({ message: "Tạo thống kê thành công", id: rs.insertId });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: err.message });
//     }
//   }

//   // UPDATE
//   async update(req, res) {
//     try {
//       const { id } = req.params;
//       const existing = await Statistics.findById(id);
//       if (!existing) return res.status(404).json({ error: "Không tìm thấy thống kê nào" });

//       const newImage = req.files?.image?.[0]?.filename;
//       const newFile  = req.files?.file?.[0]?.filename;

//       const { name, description, content, category_id } = req.body;
//       const patch = {};
//       if (typeof name !== "undefined") patch.name = name;
//       if (typeof description !== "undefined") patch.description = description;
//       if (typeof content !== "undefined") patch.content = content;
//       if (newImage) patch.image = newImage;
//       if (newFile)  patch.file  = newFile;

//       await Statistics.update(id, patch);

//           // set / clear category_id
//       if (typeof category_id !== "undefined") {
//         if (category_id === "" || category_id === null) {
//           patch.category_id = null;
//         } else {
//           const cat = await Category.findById(category_id);
//           if (!cat) return res.status(400).json({ error: "category_id không tồn tại" });
//           patch.category_id = Number(category_id);
//         }
//       }

//       // Xoá file cũ nếu có upload mới
//       if (newImage && existing.image) await removeFileIfExists(existing.image);
//       if (newFile  && existing.file)  await removeFileIfExists(existing.file);

//       res.status(200).json({ message: "Cập nhật thành công" });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: err.message });
//     }
//   }

//   // DELETE
//   async delete(req, res) {
//     try {
//       const { id } = req.params;
//       const existing = await Statistics.findById(id);
//       if (!existing) return res.status(404).json({ error: "Không tìm thấy thống kê nào" });

//       const rs = await Statistics.delete(id);
//       if (rs.affectedRows === 0) return res.status(404).json({ error: "Không xoá được" });

//       await removeFileIfExists(existing.image);
//       await removeFileIfExists(existing.file);

//       res.status(200).json({ message: "Xóa thành công" });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: err.message });
//     }
//   }

//   // LIST
//   async getAll(req, res) {
//     try {
//       const rows = await Statistics.findAll();
//       res.status(200).json(rows);
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: err.message });
//     }
//   }

//   // DETAIL
//   async getById(req, res) {
//     try {
//       const row = await Statistics.findById(req.params.id);
//       if (!row) return res.status(404).json({ error: "Không tìm thấy thống kê nào" });
//       res.status(200).json(row);
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: err.message });
//     }
//   }
// }

// module.exports = new StatisticsController();

const Statistics = require("../models/statisticsModel");
const StatisticsCategory = require("../models/statisticsCategoryModel");
const StatisticsAsset = require("../models/statisticsAssetModel");
const { removeFileIfExists } = require("../middleware/fileHelper");
const moment = require('moment');
const fs = require('fs'); 

// gom assets theo statistics_id
function groupAssets(rows) {
  const map = new Map();
  for (const r of rows) {
    if (!map.has(r.statistics_id)) map.set(r.statistics_id, []);
    map.get(r.statistics_id).push(r);
  }
  return map;
}

class StatisticsController {
  // CREATE: nhận nhiều files
  async create(req, res) {
    try {
      const images = (req.files?.image || []).map(f => f);
      const files  = (req.files?.file  || []).map(f => f);

      const { name, description, content, category_id, date, status = 'nhập tin', userID } = req.body;
      if (!name) return res.status(400).json({ error: "Name is required" });

               // Nếu không có published_at từ body => lấy ngày giờ hiện tại
          const posting_date = date
            ? moment(date, "DD-MM-YYYY").format("YYYY-MM-DD HH:mm:ss")
            : moment().format("YYYY-MM-DD HH:mm:ss");

      // validate category nếu có
      let categoryId = null;
      if (category_id !== undefined && category_id !== "" && category_id !== null) {
        const catId = parseInt(category_id, 10);
        if (Number.isNaN(catId)) return res.status(400).json({ error: "category_id không hợp lệ" });
        const cat = await StatisticsCategory.findById(catId);
        if (!cat) return res.status(400).json({ error: "category_id không tồn tại" });
        categoryId = catId;
      }

      // lưu bản ghi chính (lấy file/ảnh đầu tiên làm đại diện nếu có)
      const data = {
        name, description, content,
        image: images[0]?.filename || null,
        file:  files[0]?.filename  || null,
        category_id: categoryId,
        date: posting_date,
        status, userID
      };
      const rs = await Statistics.create(data);
      const statId = rs.insertId;

      // lưu tất cả file vào bảng assets
      const assetRecords = [
        ...images.map(f => ({ statistics_id: statId, filename: f.filename, mime_type: f.mimetype, kind: "image", size: f.size })),
        ...files.map(f  => ({ statistics_id: statId, filename: f.filename, mime_type: f.mimetype, kind: "file",  size: f.size })),
      ];
      await StatisticsAsset.bulkCreate(assetRecords);

      const assets = await StatisticsAsset.findByStatistics(statId);
      res.status(201).json({ success: true, message: status === 'Nháp tin' ? 'Lưu thành công' : 'Chuyển đi thành công', id: statId, assets });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }

  // UPDATE: có thể upload thêm nhiều file
  // async update(req, res) {
  //   try {
  //     const { id } = req.params;
  //     const existing = await Statistics.findById(id);
  //     if (!existing) return res.status(404).json({ error: "Không tìm thấy bản ghi" });

  //     const newImages = (req.files?.image || []).map(f => f);
  //     const newFiles  = (req.files?.file  || []).map(f => f);

  //     const { name, description, content, category_id } = req.body;
  //     const patch = {};
  //     if (name !== undefined)        patch.name = name;
  //     if (description !== undefined) patch.description = description;
  //     if (content !== undefined)     patch.content = content;

  //     // nếu có upload ảnh/file mới, cập nhật ảnh/file đại diện (và xóa đại diện cũ để tránh rác)
  //     if (newImages[0]) {
  //       patch.image = newImages[0].filename;
  //       if (existing.image) await removeFileIfExists(existing.image);
  //     }
  //     if (newFiles[0]) {
  //       patch.file = newFiles[0].filename;
  //       if (existing.file) await removeFileIfExists(existing.file);
  //     }

  //     if (category_id !== undefined) {
  //       if (category_id === "" || category_id === null) {
  //         patch.category_id = null;
  //       } else {
  //         const catId = parseInt(category_id, 10);
  //         if (Number.isNaN(catId)) return res.status(400).json({ error: "category_id không hợp lệ" });
  //         const cat = await StatisticsCategory.findById(catId);
  //         if (!cat) return res.status(400).json({ error: "category_id không tồn tại" });
  //         patch.category_id = catId;
  //       }
  //     }

  //     await Statistics.update(id, patch);

  //     // Thêm các file mới vào bảng assets (không xoá assets cũ)
  //     const assetRecords = [
  //       ...newImages.map(f => ({ statistics_id: id, filename: f.filename, mime_type: f.mimetype, kind: "image", size: f.size })),
  //       ...newFiles.map(f  => ({ statistics_id: id, filename: f.filename, mime_type: f.mimetype, kind: "file",  size: f.size })),
  //     ];
  //     await StatisticsAsset.bulkCreate(assetRecords);

  //     const assets = await StatisticsAsset.findByStatistics(id);
  //     res.status(200).json({ message: "Cập nhật thống kê thành công", assets });
  //   } catch (err) {
  //     console.error(err);
  //     res.status(500).json({ error: err.message });
  //   }
  // }

  async update(req, res) {
  try {
    const { id } = req.params;
    const existing = await Statistics.findById(id);
    if (!existing) return res.status(404).json({ error: "Không tìm thấy bản ghi" });

    const newImages = (req.files?.image || []).map(f => f);
    const newFiles  = (req.files?.file  || []).map(f => f);

    const { name, description, content, category_id, replace_assets, delete_asset_ids, date, status, userID } = req.body;

    // --- XÓA MỘT SỐ ASSET CỤ THỂ (nếu truyền) ---
    if (delete_asset_ids) {
      let ids = delete_asset_ids;
      if (typeof ids === "string") {
        try { ids = JSON.parse(ids); } catch (_) { ids = ids.split(","); }
      }
      ids = (ids || []).map(x => parseInt(x, 10)).filter(x => !Number.isNaN(x));
      for (const assetId of ids) {
        const a = await StatisticsAsset.findById(assetId);
        if (a && a.statistics_id == id) {
          await StatisticsAsset.delete(assetId);
          await removeFileIfExists(a.filename);
        }
      }
    }

    const patch = {};
    if (name !== undefined)        patch.name = name;
    if (description !== undefined) patch.description = description;
    if (content !== undefined)     patch.content = content;
    if (status !== undefined)     patch.status = status;
    if (userID !== undefined)     patch.userID = userID;
    if (date) {
          patch.date = moment(date, 'DD-MM-YYYY').format('YYYY-MM-DD HH:mm:ss');
        }

    // --- SET/CLEAR CATEGORY ---
    if (category_id !== undefined) {
      if (category_id === "" || category_id === null) patch.category_id = null;
      else {
        const catId = parseInt(category_id, 10);
        if (Number.isNaN(catId)) return res.status(400).json({ error: "category_id không hợp lệ" });
        const cat = await StatisticsCategory.findById(catId);
        if (!cat) return res.status(400).json({ error: "category_id không tồn tại" });
        patch.category_id = catId;
      }
    }

    // --- CHẾ ĐỘ THAY THẾ TOÀN BỘ ASSETS ---
    const replaceAll = String(replace_assets).toLowerCase() === "1" || String(replace_assets).toLowerCase() === "true";
    if (replaceAll) {
      const oldAssets = await StatisticsAsset.findByStatistics(id);
      for (const a of oldAssets) await removeFileIfExists(a.filename);
      await StatisticsAsset.deleteByStatistics(id);

      // nếu không upload mới thì cũng xóa đại diện
      if (!newImages[0]) patch.image = null;
      if (!newFiles[0])  patch.file  = null;
    }

    // --- CẬP NHẬT ĐẠI DIỆN NẾU CÓ FILE MỚI ---
    if (newImages[0]) {
      patch.image = newImages[0].filename;
      if (!replaceAll && existing.image) await removeFileIfExists(existing.image);
    }
    if (newFiles[0]) {
      patch.file = newFiles[0].filename;
      if (!replaceAll && existing.file) await removeFileIfExists(existing.file);
    }

    await Statistics.update(id, patch);

    // --- THÊM (INSERT) NHỮNG FILE VỪA UPLOAD VÀO BẢNG ASSETS ---
    const assetRecords = [
      ...newImages.map(f => ({ statistics_id: id, filename: f.filename, mime_type: f.mimetype, kind: "image", size: f.size })),
      ...newFiles.map(f  => ({ statistics_id: id, filename: f.filename, mime_type: f.mimetype, kind: "file",  size: f.size })),
    ];
    await StatisticsAsset.bulkCreate(assetRecords);

    const assets = await StatisticsAsset.findByStatistics(id);
    res.status(200).json({ message: "Cập nhật thống kê thành công", assets });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

  // DELETE: xoá bản ghi + toàn bộ file vật lý
  async delete(req, res) {
    try {
      const { id } = req.params;
      const existing = await Statistics.findById(id);
      if (!existing) return res.status(404).json({ error: "Không tìm thấy bản ghi" });

      const assets = await StatisticsAsset.findByStatistics(id);

      // xoá file vật lý (đại diện + mọi asset)
      const unique = new Set([
        existing.image, existing.file,
        ...assets.map(a => a.filename),
      ].filter(Boolean));
      for (const fn of unique) await removeFileIfExists(fn);

      // xoá record; assets sẽ bị xoá theo FK ON DELETE CASCADE
      const rs = await Statistics.delete(id);
      if (rs.affectedRows === 0) return res.status(404).json({ error: "Không xoá được" });

      res.status(200).json({ message: "Xóa thống kê + file liên quan thành công" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }

  // LIST: trả kèm assets cho từng thống kê
  async getAll(req, res) {
    try {
      const rows = await Statistics.findAll(); // đã JOIN category_name trong model của bạn
      const ids = rows.map(r => r.id);
      const assetRows = await StatisticsAsset.findByStatisticsIds(ids);
      const map = groupAssets(assetRows);
      const data = rows.map(r => ({ ...r, assets: map.get(r.id) || [] }));
      res.status(200).json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }

  // DETAIL: trả kèm toàn bộ assets
  async getById(req, res) {
    try {
      const row = await Statistics.findById(req.params.id);
      if (!row) return res.status(404).json({ error: "Không tìm thấy bản ghi" });
      const assets = await StatisticsAsset.findByStatistics(row.id);
      res.status(200).json({ ...row, assets });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }

  // XÓA 1 ASSET THEO ID
async deleteById(req, res) {
  try {
    const { id } = req.params;
    const asset = await StatisticsAsset.findById(id);
    if (!asset) return res.status(404).json({ error: "Asset not found" });

    await StatisticsAsset.delete(id);
    await removeFileIfExists(asset.filename);

    res.status(200).json({ message: "Đã xoá file thành công", deleted_id: Number(id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}


  // GET tất cả thống kê theo (ADMIN)
async getAllByAdmin(req, res) {
 try {
      const rows = await Statistics.getAllByAdmin(); // đã JOIN category_name trong model của bạn
      const ids = rows.map(r => r.id);
      const assetRows = await StatisticsAsset.findByStatisticsIds(ids);
      const map = groupAssets(assetRows);
      const data = rows.map(r => ({ ...r, assets: map.get(r.id) || [] }));
      res.status(200).json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }

   // GET tất cả bài theo User
async getAllByUser(req, res) {
 try {
      const rows = await Statistics.getAllByUser(req.params.id); // đã JOIN category_name trong model của bạn
      const ids = rows.map(r => r.id);
      const assetRows = await StatisticsAsset.findByStatisticsIds(ids);
      const map = groupAssets(assetRows);
      const data = rows.map(r => ({ ...r, assets: map.get(r.id) || [] }));
      res.status(200).json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
}


module.exports = new StatisticsController();
