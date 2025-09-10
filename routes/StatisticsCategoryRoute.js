const express = require("express");
const router = express.Router();

const StatisticsCategoryController = require("../controllers/StatisticsCategoryController");

router.post("/category/create", StatisticsCategoryController.create);
router.put("/category/update/:id", StatisticsCategoryController.update);
router.delete("/category/delete/:id", StatisticsCategoryController.delete);
router.get("/category/getall", StatisticsCategoryController.getAll);
router.get("/category/getbyId/:id", StatisticsCategoryController.getById);

module.exports = router;
