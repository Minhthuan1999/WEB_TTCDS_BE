const express = require("express");
const router = express.Router();
const TargetController = require("../controllers/TargetController");
const createMulterMiddleware = require("../middleware/multerConfig");

const upload = createMulterMiddleware("uploads");

router.post("/targets", upload.single("image"), TargetController.create);
router.get("/targets", TargetController.getAll);
router.get("/targets/:id", TargetController.getById);
router.put("/targets/:id", upload.single("image"), TargetController.update);
router.delete("/targets/:id", TargetController.delete);

module.exports = router;
