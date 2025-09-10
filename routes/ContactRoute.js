const express = require("express");

const router = express.Router();

const ContactController  = require('../controllers/ContactController');

const AuthController = require('../controllers/AuthController');

const auth = require('../middleware/auth')


//API - News

router.post('/create', ContactController.writeContact);

router.get('/getAll', ContactController.getAllContacts);

router.put('/check/:id', ContactController.approveContact);

router.get('/filter', ContactController.filterContact);

router.delete('/delete/:id', ContactController.deleteContact);


module.exports = router