// controllers/DepartmentController.js
const Department = require("../models/departmentModel");

class DepartmentController {
  async create(req, res) {
    try {
      const { name, description, sort_order = 0 } = req.body;
      if (!name) return res.status(400).json({ error: "Name is required" });

      const data = {
        name,
        description: description || null,
        sort_order: Number(sort_order) || 0,
      };

      const result = await Department.create(data);
      res.status(201).json({ message: "Tạo phòng ban thành công", id: result.insertId });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description, sort_order } = req.body;

      const current = await Department.findById(id);
      if (!current) return res.status(404).json({ error: "Department not found" });

      const data = {
        name: name ?? current.name,
        description: typeof description === "undefined" ? current.description : description,
        sort_order: typeof sort_order === "undefined" ? current.sort_order : Number(sort_order),
      };

      await Department.update(id, data);
      res.json({ message: "Cập nhật phòng ban thành công" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const current = await Department.findById(id);
      if (!current) return res.status(404).json({ error: "Department not found" });

      await Department.delete(id); // staff xóa theo FK CASCADE
      res.json({ message: "Xóa phòng ban thành công" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // ⬇️ getAll không còn nhận ?is_active
  async getAll(req, res) {
    try {
      const list = await Department.findAll();
      res.json(list);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getById(req, res) {
    try {
      const row = await Department.findById(req.params.id);
      if (!row) return res.status(404).json({ error: "Department not found" });
      res.json(row);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // ===== Cơ cấu tổ chức =====
  async getStructure(_req, res) {
    try {
      const rows = await Department.findAllWithStaff();
      const map = {}, out = [];
      for (const r of rows) {
        if (!map[r.did]) {
          map[r.did] = {
            id: r.did,
            name: r.dname,
            description: r.description,
            sort_order: r.sort_order,
            staff: [],
          };
          out.push(map[r.did]);
        }
        if (r.sid) {
          map[r.did].staff.push({
            id: r.sid,
            name: r.sname,
            position: r.position,
            email: r.email,
            phone: r.phone,
            image: r.simg,
            bio: r.bio,
            sort_order: r.sorder,
          });
        }
      }
      res.json(out);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getStructureById(req, res) {
    try {
      const rows = await Department.findByIdWithStaff(req.params.id);
      if (!rows || rows.length === 0) return res.status(404).json({ error: "Department not found" });

      const b = rows[0];
      res.json({
        id: b.did,
        name: b.dname,
        description: b.description,
        sort_order: b.sort_order,
        staff: rows
          .filter(r => r.sid)
          .map(r => ({
            id: r.sid,
            name: r.sname,
            position: r.position,
            email: r.email,
            phone: r.phone,
            image: r.simg,
            bio: r.bio,
            sort_order: r.sorder,
          })),
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new DepartmentController();
