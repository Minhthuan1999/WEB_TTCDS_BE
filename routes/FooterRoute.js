const express = require("express");
const router = express.Router();
const FooterController = require("../controllers/FooterController");
const createMulterMiddleware = require("../middleware/multerConfig");

const upload = createMulterMiddleware("uploads");

// Tạo mới: nhận 2 file bgImage & logo + các field còn lại
router.post(
  "/create",
  upload.fields([
    { name: "bgImage", maxCount: 1 },
    { name: "logo", maxCount: 1 }
  ]),
  FooterController.create
);

// Lấy tất cả
router.get("/getall", FooterController.getAll);

// Lấy 1
router.get("/getbyId/:id", FooterController.getById);

// Cập nhật: có thể gửi 0/1 file, có thể thay toàn bộ danh sách con
router.put(
  "/update/:id",
  upload.fields([
    { name: "bgImage", maxCount: 1 },
    { name: "logo", maxCount: 1 }
  ]),
  FooterController.update
);

// Xoá
router.delete("/delete/:id", FooterController.delete);

module.exports = router;
