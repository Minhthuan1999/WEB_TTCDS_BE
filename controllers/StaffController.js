// controllers/StaffController.js
const fs = require("fs");
const path = require("path");
const Staff = require("../models/staffModel");

const UPLOAD_DIR = "uploads";

function convertDateInput(input) {
  if (!input) return null;
  const [dd, mm, yyyy] = input.split("/");
  return `${yyyy}-${mm}-${dd}`;
}

class StaffController {
  async create(req, res) {
    try {
      const file = req.file && req.file.filename;
      const { department_id, name,birth_date, position, email, phone, bio, sort_order = 0 } = req.body;

      if (!department_id) return res.status(400).json({ error: "department_id is required" });
      if (!name) return res.status(400).json({ error: "name is required" });
      if (!file) return res.status(400).json({ error: "image is required" });

      const data = {
        department_id: Number(department_id),
        name,
        birth_date: convertDateInput(birth_date),
        position: position || null,
        email: email || null,
        phone: phone || null,
        bio: bio || null,
        image: file,
        sort_order: Number(sort_order) || 0,
      };

      const result = await Staff.create(data);
      res.status(201).json({ message: "Thêm nhân sự thành công", id: result.insertId });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const file = req.file && req.file.filename;

      const current = await Staff.findById(id);
      if (!current) return res.status(404).json({ error: "Staff not found" });

      const { department_id, name, birth_date, position, email, phone, bio, sort_order } = req.body;

      const data = {
        department_id:
          typeof department_id === "undefined" ? current.department_id : Number(department_id),
        name: name ?? current.name,
        birth_date: typeof birth_date === "undefined" ? current.birth_date : convertDateInput(birth_date),
        position: typeof position === "undefined" ? current.position : position,
        email: typeof email === "undefined" ? current.email : email,
        phone: typeof phone === "undefined" ? current.phone : phone,
        bio: typeof bio === "undefined" ? current.bio : bio,
        image: file ? file : current.image,
        sort_order:
          typeof sort_order === "undefined" ? current.sort_order : Number(sort_order),
      };

      await Staff.update(id, data);

      // Có ảnh mới -> xóa ảnh cũ
      if (file && current.image) {
        const oldPath = path.join(UPLOAD_DIR, current.image);
        fs.existsSync(oldPath) && fs.unlink(oldPath, () => {});
      }

      res.json({ message: "Cập nhật nhân sự thành công" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      const exists = await Staff.findById(id);
      if (!exists) return res.status(404).json({ error: "Staff not found" });

      const { imagePath } = await Staff.delete(id);
      if (imagePath) {
        const full = path.join(UPLOAD_DIR, imagePath);
        fs.existsSync(full) && fs.unlink(full, () => {});
      }

      res.json({ message: "Xóa nhân sự thành công" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getAll(req, res) {
    try {
      const { department_id } = req.query;
      const list = await Staff.findAll({ department_id });
      res.json(list);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getById(req, res) {
    try {
      const row = await Staff.findById(req.params.id);
      if (!row) return res.status(404).json({ error: "Staff not found" });
      res.json(row);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new StaffController();
