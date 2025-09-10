const path = require("path");
const fs = require("fs");
const Target = require("../models/targetModel");

class TargetController {
  async create(req, res) {
    try {
      const { title, content, summary} = req.body;
      const file = req.file?.filename;

      const newTarget = {
        title,
        content,
        summary,
        image: file,
      };

      const result = await Target.create(newTarget);
      res.status(201).json({ message: "Thêm thành công", id: result.insertId });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getAll(req, res) {
    try {
      const targets = await Target.findAll();
      res.json(targets);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getById(req, res) {
    try {
      const target = await Target.findById(req.params.id);
      if (!target) return res.status(404).json({ message: "Target not found" });
      res.json(target);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const { title, content, summary } = req.body;
      const file = req.file?.filename;

      const updateData = {
        title,
        content,
        summary
      };
      if (file) updateData.image = file;

      await Target.update(req.params.id, updateData);
      res.json({ message: "Đã cập nhật thành công" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      await Target.delete(req.params.id);
      res.json({ message: "Xóa thành công" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new TargetController();
