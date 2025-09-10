const express = require("express");

const router = express.Router();

const { TrainingController, CourseController }  = require('../controllers/TrainingController');

const createMulterMiddleware = require('../middleware/multerConfig'); 

const upload = createMulterMiddleware('uploads');



//API - TrainingController

router.get('/program', TrainingController.getAllPrograms);

router.get('/program/:id', TrainingController.getProgramByPk);

router.post('/program', TrainingController.createNewProgram);

router.delete('/program/:id', TrainingController.deleteProgram);

router.put('/program/:id', TrainingController.updateProgram);

//API - CourseController

router.get('/courses', CourseController.getAllCourses)

router.get('/courses/featured', CourseController.getFeaturedCourses)

router.post('/courses', upload.any('image'), CourseController.createNewCourse)

router.get('/courses/:id', CourseController.getCourseById)

router.get('/courses/slug/:slug', CourseController.getBySlug)

router.put('/courses/:id', upload.single('image'), CourseController.updateCourse)

router.delete('/courses/:id', CourseController.deleteCourse)


// APIs linking courses and programs

router.put('/courses/program/:id', CourseController.unlinkCourseById)

router.get('/courses/program/:id', CourseController.getCoursesByProgramId)

// APIs linking courses and schedule

router.get('/courses/schedule/:id', CourseController.getScheduleById)

router.post('/courses/schedule', CourseController.createCourseSchedule)

router.put('/courses/schedule/:id', CourseController.updateCourseSchedule)

router.delete('/courses/schedule/:id', CourseController.deleteCourseSchedule)


module.exports = router