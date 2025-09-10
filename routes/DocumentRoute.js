// const express = require("express");
// const router = express.Router();
// const DocumentController = require("../controllers/DocumentController");
// const createMulterMiddleware = require("../middleware/multerConfig");
// const upload = createMulterMiddleware("uploads");

// router.get("/documents", DocumentController.getAll);
// router.get("/documents/:id", DocumentController.getById);
// router.get("/search/documents", DocumentController.search);
// router.post("/documents", upload.single("file"), DocumentController.create);
// router.put("/documents/:id", upload.single("file"), DocumentController.update);
// router.delete("/documents/:id", DocumentController.delete);

// module.exports = router;

// phần 2
const express = require("express");
const router = express.Router();
const DocumentController = require("../controllers/DocumentController");
const createMulterMiddleware = require("../middleware/multerConfig");

// tạo middleware upload đến thư mục "uploads"
const upload = createMulterMiddleware("uploads");

router.post("/documents", upload.single("file"), DocumentController.create);
router.get("/documents", DocumentController.getAll);
router.get("/documents/:id", DocumentController.getById);
router.get("/search/documents", DocumentController.search);
router.put("/documents/:id", upload.single("file"), DocumentController.update);
router.delete("/documents/:id", DocumentController.delete);
router.get("/category/:categoryId", DocumentController.getByCategory);


module.exports = router;
