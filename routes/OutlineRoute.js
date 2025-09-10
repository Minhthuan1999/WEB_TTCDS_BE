const express = require("express");

const router = express.Router();

const createMulterMiddleware = require('../middleware/multerConfig');

const upload = createMulterMiddleware('uploads'); 


const OutlineController = require('../controllers/OutlineController');

const AuthController = require('../controllers/AuthController');

const auth = require('../middleware/auth')


//API - Banner
router.get('/banner/get', OutlineController.getAll);

router.get('/banner/get/:id', OutlineController.getOneBanner);

router.get('/banner/get/path/:id', OutlineController.getByPath);

router.delete('/banner/delete/:id', OutlineController.deleteBanner);

router.put('/banner/update/:id', upload.single('image'), OutlineController.updateBanner);


router.get('/banner/check/:id', OutlineController.checkOrderIndexDuplicate);


router.post('/banner/create', upload.single('image'), OutlineController.createBanner);


//Navbar

router.post('/navbar/create', OutlineController.createItemNavbar);

router.get('/navbar/get', OutlineController.getItemsNavbar);

router.delete('/navbar/delete/:id', OutlineController.deleteItemNavbar);

router.put('/navbar/update/:id', OutlineController.updateItemNavbar);

router.get('/navbar/get/:id', OutlineController.getItemsNavbarById);


module.exports = router