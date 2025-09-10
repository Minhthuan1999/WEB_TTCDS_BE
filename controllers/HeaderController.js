

// controllers/HeaderController.js
const fs = require("fs");
const path = require("path");
const Header = require("../models/headerModel");

// chuyển 'is_active' về 0/1
function toBoolInt(v, def = 1) {
  if (typeof v === "undefined" || v === null || v === "") return def;
  const s = String(v).toLowerCase();
  return s === "1" || s === "true" ? 1 : 0;
}

class HeaderController {
  async create(req, res) {
    try {
      const file = req.file && req.file.filename;
      const { name, is_active } = req.body;

      if (!name) return res.status(400).json({ error: "Name is required" });
      if (!file) return res.status(400).json({ error: "Image is required" });

      const newHeader = {
        name,
        image: file,
        is_active: toBoolInt(is_active, 1),
      };

      const result = await Header.create(newHeader);
      res.status(201).json({ message: "Created successfully", id: result.insertId });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const file = req.file && req.file.filename;

      const existing = await Header.findById(id);
      if (!existing) return res.status(404).json({ error: "Header not found" });

      // Nếu upload ảnh mới => xóa ảnh cũ
      if (file && existing.image) {
        const oldPath = path.join(__dirname, "../uploads", existing.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      const { name, is_active } = req.body;
      const updatedData = {};
      if (typeof name !== "undefined") updatedData.name = name;
      if (typeof is_active !== "undefined") updatedData.is_active = toBoolInt(is_active);
      updatedData.image = file || existing.image;

      await Header.update(id, updatedData);
      res.json({ message: "Updated successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await Header.delete(id);

      if (result.imagePath) {
        const imagePath = path.join(__dirname, "../uploads", result.imagePath);
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      }

      res.json({ message: "Deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getAll(req, res) {
    try {
      // ?is_active=1|0|true|false (tùy chọn)
      const { is_active } = req.query;
      const filter = typeof is_active === "undefined" ? undefined : toBoolInt(is_active);
      const results = await Header.findAll(filter);
      res.json(results);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const item = await Header.findById(id);
      if (!item) return res.status(404).json({ error: "Header not found" });
      res.json(item);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new HeaderController();
