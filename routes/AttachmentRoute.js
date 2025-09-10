const express = require("express");

const router = express.Router();

const createMulterMiddleware = require('../middleware/multerConfig'); 

const upload = createMulterMiddleware('uploads');


const AttachmentController = require('../controllers/AttachmentController');

const AuthController = require('../controllers/AuthController');

const auth = require('../middleware/auth')


//API - Attachment

router.post('/upload', upload.any('attached', 4), AttachmentController.uploadFile);

router.delete('/delete/:id', AttachmentController.delete);

router.put('/update/:id', upload.any('attached', 4), AttachmentController.update);


module.exports = router