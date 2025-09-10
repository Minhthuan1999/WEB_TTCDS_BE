const CategoryModel = require("../models/CategoriesModel");

class CategoryController {
  async create(req, res) {
    try {
      const { name, description } = req.body;
      const result = await CategoryModel.create({ name, description });
      res.status(201).json({ success: true, message: "Tạo thể loại thành công", data: result });
    } catch (err) {
      res.status(500).json({ success: false, message: "Lỗi khi tạo thể loại" });
    }
  }

  async getAll(req, res) {
    try {
      const categories = await CategoryModel.findAll();
      res.status(200).json({ success: true, data: categories });
    } catch (err) {
      res.status(500).json({ success: false, message: "Lỗi khi lấy danh sách" });
    }
  }

  async getById(req, res) {
    try {
      const category = await CategoryModel.findById(req.params.id);
      res.status(200).json({ success: true, data: category });
    } catch (err) {
      res.status(500).json({ success: false, message: "Không tìm thấy thể loại" });
    }
  }

  async update(req, res) {
    try {
      const result = await CategoryModel.update(req.params.id, req.body);
      res.status(200).json({ success: true, message: "Cập nhật thể loại thành công", data: result });
    } catch (err) {
      res.status(500).json({ success: false, message: "Lỗi cập nhật" });
    }
  }

  async delete(req, res) {
    try {
      const result = await CategoryModel.delete(req.params.id);
      res.status(200).json({ success: true, message: "Xóa thể loại thành công", data: result });
    } catch (err) {
      res.status(500).json({ success: false, message: "Lỗi xóa" });
    }
  }
}

module.exports = new CategoryController();
