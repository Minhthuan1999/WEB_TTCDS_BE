// routes/StaffRoute.js
const express = require("express");
const router = express.Router();
const StaffController = require("../controllers/StaffController");
const createMulterMiddleware = require("../middleware/multerConfig");
const upload = createMulterMiddleware("uploads");

router.post("/create", upload.single("image"), StaffController.create);
router.put("/update/:id", upload.single("image"), StaffController.update);
router.delete("/delete/:id", StaffController.delete);
router.get("/getAll", StaffController.getAll);
router.get("/getId/:id", StaffController.getById);

module.exports = router;
