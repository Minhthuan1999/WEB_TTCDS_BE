const express = require("express");
const router = express.Router();
const DepartmentController = require("../controllers/DepartmentController");

router.post ("/create",      DepartmentController.create);
router.put  ("/update/:id",  DepartmentController.update);
router.delete("/delete/:id", DepartmentController.delete);
router.get  ("/getAll",      DepartmentController.getAll);
router.get  ("/getId/:id",   DepartmentController.getById);

// Cơ cấu tổ chức
router.get("/structure/getAll",    DepartmentController.getStructure);
router.get("/structure/getId/:id", DepartmentController.getStructureById);

module.exports = router;
