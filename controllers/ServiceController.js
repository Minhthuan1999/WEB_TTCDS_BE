// const Service = require("../models/serviceModel");
// const fs = require("fs");

// class ServiceController {
//     async showService(req, res) {
//         try {
//           const services = await Service.getAll();
//           res.json(services);
//         } catch (error) {
//           console.log(error);
//           res.status(500).json("Đã xảy ra lỗi");
//         }
//     }

//     async findOneService(req, res) {
//       try {
//         const data = await Service.getById(req.params.id);
//         // ================
//         res.json(data);
//       } catch (error) {
//         console.log(error);
//         res.status(500).json({ message: "Không tìm thấy" });
//       }
//     }

//     async addService(req, res) {
//       try {
//         const data = {
//           service_name: req.body.service_name,
//           description: req.body.description,
//           img_url: req.file ? req.file.filename : null,
//         };

//         await Service.create(data);

//         res.status(200).json({
//           success: true,
//           message: "Tạo dịch vụ thành công!",
//         });
//       } catch (error) {
//         console.error("Lỗi: ", error);
//         res.status(500).json({ message: "Không thể tạo dịch vụ mới" });
//       }
//     }

//     async deleteService(req, res) {
//       try {
//         const service = await Service.getById(req.params.id);

//         if (service.img_url !== null) {
//             fs.unlink(`uploads/${service.img_url}`, (err) => {
//               if (err) console.log(err);
//             });
//         }
//         Service.delete(req.params.id);

//         res.json({ success: true, message: "Xóa thành công" });
//       } catch (error) {
//         console.error("Lỗi: ", error);
//         res.status(500).json({ message: "Có lỗi xảy ra" });
//       }
//     }

//     async updateService(req, res) {
//       try {
//         const service = await Service.getById(req.params.id);
        
//         const data = {
//           service_name: req.body.service_name,
//           description: req.body.description,
//           img_url: req.file ? req.file.filename : service.img_url,
//         };

//         if ((req.file && service.img_url !== null)) {
//           fs.unlink(`uploads/${service.img_url}`, (err) => {
//             if (err) console.log(err);
//           });
//         }

//         const updatedRows = await Service.update(req.params.id, data);

//         res.json({
//           success: true,
//           message: "Cập nhật thành công!",
//           status: updatedRows.message,
//         });
//       } catch (error) {
//         if(error.errno === 1406) {
//           return res.status(403).json({
//             success: false,
//             message: 'Tiêu đề hoặc mô tả quá dài !!'
//           })
//         }
//         res.status(500).json({ success: false, message: "Đã xảy ra lỗi" });
//       }
//     }
// }

// module.exports = new ServiceController();


// controllers/ServiceController.js
// controllers/ServiceController.js
const fs = require('fs');
const path = require('path');
const Service = require('../models/serviceModel');

function toBoolInt(v, def = 1) {
  if (typeof v === 'undefined' || v === null || v === '') return def;
  const s = String(v).toLowerCase();
  return s === 'true' || s === '1' || s === 'yes' ? 1 : 0;
}
function toSlug(str) {
  return String(str || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads'); // giống HeaderController

class ServiceController {
  async create(req, res) {
    try {
      const file = req.file && req.file.filename;
      const { sname, slug, description, parentID, is_active, nav_id } = req.body;

      if (!sname) return res.status(400).json({ error: 'sname is required' });

      const newRow = {
        sname,
        slug: slug && slug.trim() ? slug.trim() : toSlug(sname),
        image: file || null,
        parentID: parentID || null,
        description: description || null,
        is_active: toBoolInt(is_active, 1),
        nav_id: nav_id || null
      };

      const result = await Service.create(newRow);
      res.status(201).json({ message: 'Created successfully', id: result.insertId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params; // sid
      const file = req.file && req.file.filename;

      const existing = await Service.findById(id);
      if (!existing) return res.status(404).json({ error: 'Service category not found' });

      // nếu có ảnh mới -> xóa ảnh cũ
      if (file && existing.image) {
        const oldPath = path.join(UPLOAD_DIR, existing.image);
        if (fs.existsSync(oldPath)) {
          try { fs.unlinkSync(oldPath); } catch (_) {}
        }
      }

      const data = {
        sname: typeof req.body.sname !== 'undefined' ? req.body.sname : existing.sname,
        slug:
          (req.body.slug && req.body.slug.trim()) ||
          (typeof req.body.sname !== 'undefined' ? toSlug(req.body.sname) : existing.slug),
        description: typeof req.body.description !== 'undefined' ? req.body.description : existing.description,
        parentID: typeof req.body.parentID !== 'undefined' ? req.body.parentID : existing.parentID,
        is_active: typeof req.body.is_active !== 'undefined' ? toBoolInt(req.body.is_active, existing.is_active) : existing.is_active,
        nav_id: typeof req.body.nav_id !== 'undefined' ? req.body.nav_id : existing.nav_id,
        image: file || existing.image
      };

      const result = await Service.update(id, data);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
      res.json({ message: 'Updated successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const { result, imagePath } = await Service.delete(id);

      if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });

      if (imagePath) {
        const p = path.join(UPLOAD_DIR, imagePath);
        if (fs.existsSync(p)) {
          try { fs.unlinkSync(p); } catch (_) {}
        }
      }
      res.json({ message: 'Deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }

  async getAll(req, res) {
    try {
      const isActive = typeof req.query.is_active !== 'undefined' ? toBoolInt(req.query.is_active) : undefined;
      const navId = typeof req.query.nav_id !== 'undefined' ? Number(req.query.nav_id) : undefined;
      const rows = await Service.findAll(isActive, navId);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }

  async getById(req, res) {
    try {
      const row = await Service.findById(req.params.id);
      if (!row) return res.status(404).json({ error: 'Not found' });
      res.json(row);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new ServiceController();
