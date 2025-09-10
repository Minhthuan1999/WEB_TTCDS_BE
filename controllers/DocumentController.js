// const Document = require("../models/documentModel");

// class DocumentController {
//   async create(req, res) {
//     try {
//       const { name, number, month, year } = req.body;
//       const file = req.file?.filename;

//       const newDoc = {
//         name,
//         number,
//         month,
//         year,
//         file_path: file,
//         created_at: new Date(),
//       };

//       const result = await Document.create(newDoc);
//       res.status(201).json({ success: true, message: "Thêm văn bản thành công", data: result });
//     } catch (err) {
//       console.log(err);
//       res.status(500).json({ success: false, message: "Lỗi khi tạo văn bản" });
//     }
//   }

//   async getAll(req, res) {
//     try {
//       const documents = await Document.findAll();
//       res.status(200).json({ success: true, data: documents });
//     } catch (err) {
//       res.status(500).json({ success: false, message: "Lỗi khi lấy danh sách" });
//     }
//   }

//   async getById(req, res) {
//     try {
//       const document = await Document.findById(req.params.id);
//       res.status(200).json({ success: true, data: document });
//     } catch (err) {
//       res.status(500).json({ success: false, message: "Không tìm thấy văn bản" });
//     }
//   }

//   async search(req, res) {
//   try {
//     const { name, number, month, year } = req.query;

//     const results = await Document.searchAdvanced({ name, number, month, year });

//     res.status(200).json({ success: true, data: results });
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Lỗi tìm kiếm nâng cao" });
//   }
// }

// //   async search(req, res) {
// //     try {
// //       const keyword = req.query.q || "";
// //       const results = await Document.search(keyword);
// //       res.status(200).json({ success: true, data: results });
// //     } catch (err) {
// //       res.status(500).json({ success: false, message: "Lỗi tìm kiếm" });
// //     }
// //   }

//   async update(req, res) {
//     try {
//       const { name, number, month, year } = req.body;
//       const file = req.file?.filename;

//       const updateData = { name, number, month, year };
//       if (file) updateData.file_path = file;

//       const result = await Document.update(req.params.id, updateData);
//       res.status(200).json({ success: true, message: "Cập nhật thành công", data: result });
//     } catch (err) {
//       res.status(500).json({ success: false, message: "Lỗi cập nhật" });
//     }
//   }

//   async delete(req, res) {
//     try {
//       const result = await Document.delete(req.params.id);
//       res.status(200).json({ success: true, message: "Xóa thành công", data: result });
//     } catch (err) {
//       res.status(500).json({ success: false, message: "Lỗi xóa" });
//     }
//   }
// }

// module.exports = new DocumentController();


// phần 2
// const DocumentModel = require("../models/documentModel");

// function convertDateInput(input) {
//   if (!input) return null;
//   const [dd, mm, yyyy] = input.split("/");
//   return `${yyyy}-${mm}-${dd}`;
// }

// class DocumentController {
//   async create(req, res) {
//     try {
//       const { name, number, date } = req.body;
//       const file = req.file?.filename;

//       const newDoc = {
//         name,
//         number,
//         date: convertDateInput(date), // Convert from dd/mm/yyyy to yyyy-mm-dd
//         file_path: file,
//         created_at: new Date()
//       };

//       const result = await DocumentModel.create(newDoc);
//       res.status(201).json({ success: true, message: "Tạo văn bản thành công", data: result });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ success: false, message: "Lỗi server khi tạo văn bản" });
//     }
//   }

//   async getAll(req, res) {
//     try {
//       const documents = await DocumentModel.findAll();
//       res.status(200).json({ success: true, data: documents });
//     } catch (err) {
//       res.status(500).json({ success: false, message: "Lỗi khi lấy danh sách" });
//     }
//   }

//   async getById(req, res) {
//     try {
//       const id = req.params.id;
//       const document = await DocumentModel.findById(id);
//       res.status(200).json({ success: true, data: document });
//     } catch (err) {
//       res.status(500).json({ success: false, message: "Không tìm thấy văn bản" });
//     }
//   }

//   async update(req, res) {
//     try {
//       const id = req.params.id;
//       const { name, number, date } = req.body;
//       const file = req.file?.filename;

//       const updateData = {
//         name,
//         number,
//         date: convertDateInput(date)
//       };
//       if (file) updateData.file_path = file;

//       const result = await DocumentModel.update(id, updateData);
//       res.status(200).json({ success: true, message: "Cập nhật thành công", data: result });
//     } catch (err) {
//       res.status(500).json({ success: false, message: "Lỗi cập nhật" });
//     }
//   }

//   async delete(req, res) {
//     try {
//       const id = req.params.id;
//       const result = await DocumentModel.delete(id);
//       res.status(200).json({ success: true, message: "Xóa thành công", data: result });
//     } catch (err) {
//       res.status(500).json({ success: false, message: "Lỗi xóa" });
//     }
//   }

//   async search(req, res) {
//     try {
//       const { name, number, date } = req.query;
//       const results = await DocumentModel.searchAdvanced({
//         name,
//         number,
//         date: convertDateInput(date)
//       });
//       res.status(200).json({ success: true, data: results });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ success: false, message: "Lỗi tìm kiếm nâng cao" });
//     }
//   }
// }

// module.exports = new DocumentController();

// phần 3

const path = require("path");
const fs = require("fs");
const Document = require("../models/documentModel");

function convertDateInput(input) {
  if (!input) return null;
  const [dd, mm, yyyy] = input.split("/");
  return `${yyyy}-${mm}-${dd}`;
}
class DocumentController {
 async create(req, res) {
    try {
      const {
        symbol,
        issued_date,
        effective_date,
        category_id,
        agency,
        signer,
        abstract
      } = req.body;

      const file = req.file?.filename;

      const newDoc = {
        symbol,
        issued_date: convertDateInput(issued_date),
        effective_date: convertDateInput(effective_date),
        category_id,
        agency,
        signer,
        abstract,
        file_path: file,
        created_at: new Date(),
      };

      const result = await Document.create(newDoc);

      res.status(201).json({
        success: true,
        message: "Tạo văn bản thành công",
        data: result,
      });
    } catch (err) {
      console.error("Lỗi khi thêm văn bản:", err);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi tạo văn bản",
      });
    }
  }

  async getAll(req, res) {
    try {
      const result = await Document.findAll();
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getById(req, res) {
    try {
      const result = await Document.findById(req.params.id);
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async search(req, res) {
    try {
      const result = await Document.searchAdvanced(req.query);
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async update(req, res) {
    try {
      const id = req.params.id;

      const {
        symbol,
        issued_date,
        effective_date,
        category_id,
        agency,
        signer,
        abstract,
      } = req.body;

      const file = req.file?.filename;

      const updateDoc = {
        symbol,
        issued_date: convertDateInput(issued_date),
        effective_date: convertDateInput(effective_date),
        category_id,
        agency,
        signer,
        abstract,
        file_path: file,
      };

      // Xoá thuộc tính không có giá trị để tránh update null không mong muốn
      Object.keys(updateDoc).forEach((key) => {
        if (updateDoc[key] === undefined) {
          delete updateDoc[key];
        }
      });

      const result = await Document.update(id, updateDoc);

      res.status(200).json({
        success: true,
        message: "Cập nhật văn bản thành công",
        data: result,
      });
    } catch (err) {
      console.error("Lỗi khi cập nhật văn bản:", err);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi cập nhật văn bản",
      });
    }
  }

  async delete(req, res) {
    try {
      const result = await Document.delete(req.params.id);
      res.json({ success: true, message: "Xóa thành công", data: result });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

   async getByCategory(req, res) {
    try {
      const categoryId = req.params.categoryId;

      const sql = `
        SELECT d.*, c.name AS category_name
        FROM documents d
        LEFT JOIN document_categories c ON d.category_id = c.id
        WHERE d.category_id = ?
        ORDER BY d.issued_date DESC
      `;

      const results = await Document.rawQuery(sql, [categoryId]);

      res.status(200).json({ success: true, data: results });
    } catch (err) {
      console.error("Lỗi khi lấy documents theo category:", err);
      res.status(500).json({ success: false, message: "Lỗi server" });
    }
  }
}

module.exports = new DocumentController();
