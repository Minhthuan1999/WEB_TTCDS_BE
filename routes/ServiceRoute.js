// const express = require("express");

// const router = express.Router();
// const createMulterMiddleware = require('../middleware/multerConfig'); 

// const upload = createMulterMiddleware('uploads');


// const ServiceController = require('../controllers/ServiceController');

// const AuthController = require('../controllers/AuthController');

// const auth = require('../middleware/auth')


// //API - Service

// router.get('/getAllService', ServiceController.showService);

// router.get('/get/:id', ServiceController.findOneService);

// router.post('/addService', upload.single('image'), ServiceController.addService);

// router.delete('/deleteService/:id', ServiceController.deleteService)

// router.put('/upload/:id', upload.single('image'), ServiceController.updateService)




// module.exports = router

// routes/ServiceRoute.js
const express = require('express');
const router = express.Router();

const ServiceController = require('../controllers/ServiceController');
const createMulterMiddleware = require('../middleware/multerConfig');

// lưu vào thư mục "uploads", field name = "image" (y như Header)
const upload = createMulterMiddleware('uploads');

// CRUD
router.post('/addService', upload.single('image'), ServiceController.create);
router.put('/updateService/:id', upload.single('image'), ServiceController.update);
router.delete('/deleteService/:id', ServiceController.delete);

// GET
router.get('/getAll', ServiceController.getAll);
router.get('/getById/:id', ServiceController.getById);

module.exports = router;