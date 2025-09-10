const Category = require("../models/statisticsCategoryModel");

class StatisticsCategoryController {
  async create(req, res) {
    try {
      const { name, description } = req.body;
      if (!name) return res.status(400).json({ error: "Name is required" });
      const rs = await Category.create({ name, description });
      res.status(201).json({ message: "Tạo thể loại Thống kê thành công", id: rs.insertId });
    } catch (err) {
      console.error(err); res.status(500).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      const existing = await Category.findById(id);
      if (!existing) return res.status(404).json({ error: "Không tìm thấy thể loại" });

      const patch = {};
      if (typeof name !== "undefined") patch.name = name;
      if (typeof description !== "undefined") patch.description = description;

      await Category.update(id, patch);
      res.status(200).json({ message: "Cập nhật thể loại Thống kê thành công" });
    } catch (err) {
      console.error(err); res.status(500).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const existing = await Category.findById(id);
      if (!existing) return res.status(404).json({ error: "Không tìm thấy thể loại" });

      await Category.delete(id);
      res.status(200).json({ message: "Xóa thể loại Thống kê thành công" });
    } catch (err) {
      console.error(err); res.status(500).json({ error: err.message });
    }
  }

  async getAll(req, res) {
    try {
      const rows = await Category.findAll();
      res.status(200).json(rows);
    } catch (err) {
      console.error(err); res.status(500).json({ error: err.message });
    }
  }

  async getById(req, res) {
    try {
      const row = await Category.findById(req.params.id);
      if (!row) return res.status(404).json({ error: "Không tìm thấy thể loại" });
      res.status(200).json(row);
    } catch (err) {
      console.error(err); res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new StatisticsCategoryController();
