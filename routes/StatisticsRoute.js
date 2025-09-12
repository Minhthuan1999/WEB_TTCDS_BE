// // routes/StatisticsRoute.js
// const express = require("express");
// const router = express.Router();

// const StatisticsController = require("../controllers/StatisticsController");
// const createMulterMiddleware = require("../middleware/multerConfig");
// const upload = createMulterMiddleware("uploads");

// // nhận đồng thời image + file
// const uploadFields = upload.fields([
//   { name: "image", maxCount: 10 },
//   { name: "file",  maxCount: 10 },
// ]);

// router.post("/create",        uploadFields, StatisticsController.create);
// router.put("/update/:id",     uploadFields, StatisticsController.update);
// router.delete("/delete/:id",                 StatisticsController.delete);
// router.get("/getall",                        StatisticsController.getAll);
// router.get("/getbyid/:id",                    StatisticsController.getById);

// module.exports = router;

const express = require("express");
const router = express.Router();

const StatisticsController = require("../controllers/StatisticsController");
const createMulterMiddleware = require("../middleware/multerConfig");
const upload = createMulterMiddleware("uploads");

// up nhiều ảnh + nhiều file trong 1 lần
const uploadFields = upload.fields([
  { name: "image", maxCount: 20 },   // chọn nhiều ảnh
  { name: "file",  maxCount: 50 },   // chọn nhiều file tài liệu
]);

// router.post("/statistics",        uploadFields, StatisticsController.create);
router.post("/create", uploadFields, StatisticsController.create); // alias
router.put("/update/:id",     uploadFields, StatisticsController.update);
router.delete("/delete/:id",                 StatisticsController.delete);
router.get("/getall",                        StatisticsController.getAll);
router.get("/getbyId/:id",                    StatisticsController.getById);
router.get("/getall/admin",                    StatisticsController.getAllByAdmin);
router.get("/getall/user/:id",                    StatisticsController.getAllByUser);

// Xoá 1 file theo asset id
router.delete("/assets/delete/:id", StatisticsController.deleteById);

// (tuỳ chọn) route lồng nhau:
router.delete("/:statistics_id/assets/delete/:id", StatisticsController.deleteById);

module.exports = router;
