const express = require("express");

const router = express.Router();

const MediaController  = require('../controllers/MediaController');

const createMulterMiddleware = require('../middleware/multerConfig'); 

const upload = createMulterMiddleware('uploads');


const auth = require('../middleware/auth')


//API - Media

router.get('/get', MediaController.getAll);

router.get('/getById/:id', MediaController.getAlbumById);

router.post('/create', MediaController.createNew);

router.post('/upload', upload.any('photo', 4), MediaController.uploadImage);

router.get('/getPhotoByAlbum/:id', MediaController.getPhotoListById);

router.put('/rename/:id', MediaController.renameAlbum);

router.delete('/delete/:id', MediaController.deleteAlbum);

router.post('/delete', MediaController.deleteSelectedPhotos);

router.put('/update/:id', MediaController.setCoverAlbum);

// Video
router.get('/videos', MediaController.getVideos)

router.get('/videos/priority', MediaController.getVideoByPriority)

router.get('/videos/:id', MediaController.getVideoById)

router.post('/videos', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), MediaController.uploadVideo)

router.delete('/videos/:id', MediaController.deleteVideo);

router.put('/videos/:id', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), MediaController.updateVideo);



module.exports = router