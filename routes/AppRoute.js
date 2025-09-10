const express = require("express");

const router = express.Router();

const AppController  = require('../controllers/AppController');

const auth = require('../middleware/auth')


//API - News

router.get('/getStatistic', AppController.getStatistic);

router.get('/visits', AppController.getTotalVisitor);

router.put('/visits/update', AppController.updateVisits);

router.put('/pageviews/update', AppController.updatePageViews);



module.exports = router