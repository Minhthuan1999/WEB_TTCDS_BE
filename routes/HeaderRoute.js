


const express = require("express");
const router = express.Router();
const HeaderController = require("../controllers/HeaderController");
const createMulterMiddleware = require("../middleware/multerConfig");
const upload = createMulterMiddleware("uploads");

router.post("/headers",  upload.single("image"), HeaderController.create);
router.put("/headers/:id", upload.single("image"), HeaderController.update);
router.delete("/headers/:id", HeaderController.delete);
router.get("/headers", HeaderController.getAll);
router.get("/headers/:id", HeaderController.getById);

module.exports = router;
