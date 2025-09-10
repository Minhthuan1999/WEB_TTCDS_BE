const express = require("express");

const router = express.Router();

const createMulterMiddleware = require('../middleware/multerConfig');

const upload = createMulterMiddleware('uploads'); 


const PortalController = require('../controllers/PortalController');

const AuthController = require('../controllers/AuthController');

const auth = require('../middleware/auth')


//API - Portal

router.post('/create', upload.single('image'), PortalController.createPortal);

router.delete('/delete/:id', PortalController.removePortal);

router.get('/getOne/:id', PortalController.getOnePortal);

router.get('/getAll', PortalController.getAllPorts);

router.put('/update/:id', upload.single('image'), PortalController.updatePortal);




module.exports = router