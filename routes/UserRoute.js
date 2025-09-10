const express = require("express");

const router = express.Router();

const createMulterMiddleware = require('../middleware/multerConfig');

const upload = createMulterMiddleware('uploads'); 


const UserController = require('../controllers/UserController');

const AuthController = require('../controllers/AuthController');

const auth = require('../middleware/auth')
const checkToken = require('../middleware/checkTokenExpiration')


//API - User

router.get('/userList', UserController.getAllUsers);

router.get('/getUserById/:id', UserController.getUserById);

router.post('/registration', UserController.createUser);

router.put('/updateUser/:id', upload.single('image'), UserController.updateUser)

router.put('/updateProfile/:id', upload.single('image'), UserController.updateProfile)

router.delete('/deleteUser/:id', UserController.deleteUser)

router.put('/changePassword/:id', UserController.changePassword)

//API - Role
router.get('/getRoles', UserController.getRoleList);


//Authentication

router.post('/login', AuthController.login)

router.post('/logout', AuthController.logout)



module.exports = router