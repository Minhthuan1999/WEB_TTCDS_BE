const Footer = require("../models/footerModel");

// // ép bool 0/1
// const parseBool = (v) => {
//   if (v === true || v === 1 || v === "1" || v === "true") return 1;
//   return 0;
// };
// giống HeaderController của bạn: ép bool về 0/1 với default
function toBoolInt(v, def = 1) {
  if (typeof v === "undefined" || v === null || v === "") return def;
  const s = String(v).toLowerCase();
  return (s === "1" || s === "true") ? 1 : 0;
}
// ép JSON (trường hợp gửi chuỗi JSON trong form-data)
const parseJsonArray = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw; // đã là array (nếu body-parser extended)
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

class FooterController {
  // CREATE
  async create(req, res) {
    try {
      const {
        name,
        address,
        phone,
        email,
        information,
        is_visible
      } = req.body;

      const socials   = parseJsonArray(req.body.socials);
      const services  = parseJsonArray(req.body.services);
      const activities = parseJsonArray(req.body.activities);

      const bgImage = req.files?.bgImage?.[0]?.filename || null;
      const logo    = req.files?.logo?.[0]?.filename || null;

      const newFooter = {
        name,
        address,
        phone,
        email,
        information,
        bg_image: bgImage,
        logo: logo,
        is_visible: toBoolInt(is_visible ?? 1)
      };

      const result = await Footer.create(newFooter);
      const footerId = result.insertId;

      await Promise.all([
        Footer.insertSocials(footerId, socials),
        Footer.insertServices(footerId, services),
        Footer.insertActivities(footerId, activities),
      ]);

      res.status(201).json({ message: "Thêm footer thành công", id: footerId });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // GET ALL (kèm children)
  // ⬇️ đọc query ?visible=0/1
  async getAll(req, res) {
    try {
      const q = req.query.visible;
      const visible = (typeof q === "undefined") ? undefined : toBoolInt(q, 1);
      const data = await Footer.findAllWithChildren(visible);
      res.json(data);
    } catch (e) { res.status(500).json({ error: e.message }); }
  }


  // GET BY ID (kèm children)
  async getById(req, res) {
    try {
      const id = req.params.id;
      const data = await Footer.findOneWithChildren(id);
      if (!data) return res.status(404).json({ message: "Footer không tồn tại" });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // UPDATE (ghi đè danh sách con: xoá cũ → thêm mới)
  async update(req, res) {
    try {
      const id = req.params.id;

      // chỉ set các field có gửi lên
      const updateData = {};
      if (req.body.name !== undefined) updateData.name = req.body.name;
      if (req.body.address !== undefined) updateData.address = req.body.address;
      if (req.body.phone !== undefined) updateData.phone = req.body.phone;
      if (req.body.email !== undefined) updateData.email = req.body.email;
      if (req.body.information !== undefined) updateData.information = req.body.information;
      if (req.body.is_visible !== undefined) updateData.is_visible = toBoolInt(req.body.is_visible);

      // file
      const bgImage = req.files?.bgImage?.[0]?.filename;
      const logo    = req.files?.logo?.[0]?.filename;
      if (bgImage) updateData.bg_image = bgImage;
      if (logo) updateData.logo = logo;

      // cập nhật bảng chính (nếu có dữ liệu)
      if (Object.keys(updateData).length) {
        await Footer.update(id, updateData);
      }

      // nếu có mảng mới => replace
      const socials   = parseJsonArray(req.body.socials);
      const services  = parseJsonArray(req.body.services);
      const activities = parseJsonArray(req.body.activities);

      const jobs = [];
      if (Array.isArray(socials)) {
        jobs.push(Footer.deleteSocials(id).then(() => Footer.insertSocials(id, socials)));
      }
      if (Array.isArray(services)) {
        jobs.push(Footer.deleteServices(id).then(() => Footer.insertServices(id, services)));
      }
      if (Array.isArray(activities)) {
        jobs.push(Footer.deleteActivities(id).then(() => Footer.insertActivities(id, activities)));
      }
      await Promise.all(jobs);

      res.json({ message: "Cập nhật footer thành công" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // DELETE
  async delete(req, res) {
    try {
      const id = req.params.id;
      await Footer.delete(id); // ON DELETE CASCADE sẽ dọn bảng con
      res.json({ message: "Xoá footer thành công" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new FooterController();
