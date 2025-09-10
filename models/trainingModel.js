const db = require("../database/db");

class TrainingProgram {

    create(data) {
        return new Promise((resolve, reject) => {
          db.query("INSERT INTO programs SET ?", data, (err, result) => {
            if (err) reject(err);
            resolve(result);
          });
        });
    } 

    findAll() {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM programs ORDER BY created_at DESC', (error, results) => {
                if (error) reject(error);
                resolve(results);
            });
        });
    }

    findByPk(id) {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM programs WHERE id = ?', [id], (error, results) => {
                if (error) {
                    reject(error);
                }
                if (results.length === 1) {
                    resolve({ success: true, data: results[0] });
                } else {
                    resolve({ success: true, data: results });
                }
            });
        });
    }

    destroy(id) {
        return new Promise((resolve, reject) => {
            db.query('DELETE FROM programs WHERE id = ?', [id], (error, results) => {
                if(error) reject(error);
                resolve(results)
            })
        })  
    }

    update(id, data) {
        return new Promise((resolve, reject) => {
            db.query('UPDATE programs SET ? WHERE id = ?', [data, id], (error, results) => {
                if(error) reject(error);
                resolve(results)
            })
        })
    }
    
}

class Course {

    getAll() {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM courses ORDER BY created_at DESC', (error, results) => {
                if(error) reject(error)
                resolve(results)
            })
        })
    }

    getAllByProgramId(id) {
        return new Promise((resolve, reject) => {
            db.query(`SELECT 
                courses.*, 
                programs.name AS program_name 
                FROM courses 
                INNER JOIN programs ON courses.program_id = programs.id 
                WHERE courses.program_id = ?`, [id], (error, results) => {
                if(error) reject(error)
                resolve(results)
            })
        })
    }

    getCourseById(id) {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM courses WHERE id = ?', [id], (error, results) => {
                if (error) {
                    reject(error);
                }
                if (results.length === 1) {
                    resolve(results[0]);
                } else {
                    resolve(results);
                }
            })
        })
    }

    getFeaturedCourses() {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT courses.* 
                 FROM courses 
                 INNER JOIN programs ON courses.program_id = programs.id
                 WHERE courses.is_featured = 1 AND programs.is_hidden = 0`,
                (error, results) => {
                    if (error) reject(error);
                    resolve(results);
                }
            );
        });
    }

    getCourseBySlug(slug) {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM courses WHERE slug = ?', [slug], (error, results) => {
                if (results.length === 1) {
                    resolve(results[0]);
                } else {
                    resolve(results);
                }
            })
        })
    }

    createNewCourse(data) {
        return new Promise((resolve, reject) => {
            db.query("INSERT INTO courses SET ?", data, (err, result) => {
              if (err) reject(err);
              resolve(result);
            });
        });
    }

    updateCourse(id, data) {
        return new Promise((resolve, reject) => {
            db.query('UPDATE courses SET ? WHERE id = ?', [data, id], (error, results) => {
                if(error) reject(error);
                resolve(results)
            })
        })
    }

    deleteCoursePermanently(id) {
        return new Promise((resolve, reject) => {
            db.query('DELETE FROM courses WHERE id = ?', [id], (error, results) => {
                if(error) reject(error);
                resolve(results)
            })
        })  
    }

    unlinkCourseFromProgram(id) {
        return new Promise((resolve, reject) => {
            db.query('UPDATE courses SET program_id = NULL WHERE id = ?', [id], (error, results) => {
                if(error) reject(error);
                resolve(results)
            })
        })  
    }

    createCourseSchedule(data) {
        return new Promise((resolve, reject) => {
            db.query("INSERT INTO course_schedule SET ?", data, (err, result) => {
              if (err) reject(err);
              resolve(result);
            });
        });
    }


    updateCourseSchedule(id, data) {
        return new Promise((resolve, reject) => {
            db.query('UPDATE course_schedule SET ? WHERE course_id = ?', [data, id], (error, results) => {
                if(error) reject(error);
                resolve(results)
            })
        })
    }

    deleteCourseSchedule(id) {
        return new Promise((resolve, reject) => {
            db.query('DELETE FROM course_schedule WHERE id = ?', [id], (error, response) => {
                if(error) reject(error);
                resolve(response)
            })
        })
    }


    findScheduleById(id) {
        return new Promise((resolve, reject) => {
            db.query('SELECT title, summary, content, opening_schedule, expert_info FROM course_schedule WHERE course_id = ?', [id], (error, results) => {
                if (error) {
                    reject(error);
                }
                if (results.length === 1) {
                    resolve(results[0]);
                } else {
                    resolve(results);
                }
            })
        })
    }


}

class Feedback {

}
  

module.exports = {
    TrainingProgram: new TrainingProgram(),
    Course: new Course(),
    Feedback: new Feedback(),
  };
    