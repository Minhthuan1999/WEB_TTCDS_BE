const { TrainingProgram, Course, Feedback } = require("../models/trainingModel");
const fs = require("fs");
const path = require('path');
const slugify = require('slugify');


class TrainingController {
    async createNewProgram(req, res) {
        try {
            const { name, description, is_hidden } = req.body
            const newProgram = await TrainingProgram.create({
                name,
                description,
                is_hidden,
            });
    
            res.status(200).json({
                success: true,
                message: "Tạo chương trình thành công!",
                data: newProgram
            });
        } catch (error) {
            console.log("Lỗi", error);
            res.status(500).json({ message: "Có lỗi xảy ra" });
        }
    }

    async getAllPrograms(req, res) {
        try {
            const programs = await TrainingProgram.findAll();
            res.status(200).json({
                success: true,
                program: programs
            });
        } catch (error) {
            console.log("Lỗi", error);
            res.status(500).json({ message: "Có lỗi xảy ra" });
        }
    }

    async getProgramByPk(req, res) {
        try {
            const program = await TrainingProgram.findByPk(req.params.id);
            res.status(200).json(program);
        } catch (error) {
            console.log("Lỗi", error);
            res.status(500).json({ message: "Có lỗi xảy ra" });
        }
    }

    async deleteProgram(req, res) {
        try {
            const { id } = req.params;
            const program = await TrainingProgram.findByPk(id);

            if (!program) {
                return res.status(404).json({ message: "Chương trình không tồn tại" });
            }

            await TrainingProgram.destroy(id);
            res.status(200).json({
                success: true,
                message: "Xóa chương trình thành công"
            });
        } catch (error) {
            console.log("Lỗi", error);
            res.status(500).json({ message: "Có lỗi xảy ra" });
        }
    }

    async updateProgram(req, res) {
        try {
            const { id } = req.params;
            const { name, description, is_hidden } = req.body;

            const data = { name, description, is_hidden };
    
            const response = await TrainingProgram.update(id, data);

            if (!response) {
                return res.status(404).json({ success: false, message: 'Data not found' });
            }

            return res.status(200).json({ success: true, message: 'Updated successfully.' });
            
        } catch (error) {
            console.error('Error:', error);
            return res.status(500).json({ success: false, message: 'An error occurred' });
        }
    }


}

class CourseController {

    async getCourseById(req, res) {
        try {
            const course = await Course.getCourseById(req.params.id);
            res.status(200).json(course);
        } catch (error) {
            console.log("Lỗi", error);
            res.status(500).json({ message: "Có lỗi xảy ra" });
        }
    }

    async getBySlug(req, res) {
        try {
            const course = await Course.getCourseBySlug(req.params.slug);
            res.status(200).json(course);
        } catch (error) {
            console.log("Lỗi", error);
            res.status(500).json({ message: "Có lỗi xảy ra" });
        }
    }

    async getAllCourses(req, res) {
        try {
            const course = await Course.getAll();
            res.status(200).json(course);
        } catch (error) {
            console.log("Lỗi", error);
            res.status(500).json({ message: "Có lỗi xảy ra" });
        }
    }

    async getFeaturedCourses(req, res) {
        try {
            const course = await Course.getFeaturedCourses();
            res.status(200).json(course);
        } catch (error) {
            console.log("Lỗi", error);
            res.status(500).json({ message: "Có lỗi xảy ra" });
        }
    }

    async getCoursesByProgramId(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ message: "ID chương trình đào tạo không được để trống" });
            }

            const courses = await Course.getAllByProgramId(id);

            if (courses.length === 0) {
                return res.status(200).json(null);
            }

            res.status(200).json(courses);
        } catch (error) {
            console.error("Lỗi:", error);
            res.status(500).json({ message: "Có lỗi xảy ra", error: error.message });
        }
    }


    async createNewCourse(req, res) {
        try {
            const { program_id, name, slug, start_date, price, quantity, duration, enroll_url, is_featured, location, contact_email, hotline, is_hidden, preferential } = req.body;

            if (!program_id || !name || !start_date || !price) {
                return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc.' });
            }

            const generatedSlug = slug || slugify(name, { lower: true, strict: true });

            const course = {
                program_id: program_id, 
                name: name,
                slug: generatedSlug,
                image: req.files[0]?.filename || null,
                start_date: start_date,
                price: price,
                // quantity: quantity,
                // duration: duration,
                enroll_url: enroll_url,
                is_featured: is_featured, 
                location: location,
                contact_email: contact_email,
                hotline: hotline,
                is_hidden: is_hidden,
                preferential: preferential
            };

            const response = await Course.createNewCourse(course)

            if (!response) {
                return res.status(500).json({ success: false, message: 'Không thể tạo khóa học, vui lòng thử lại.' });
            }

            return res.status(200).json({
                success: true,
                message: 'Course created successfully',
                course_id: response.insertId
            });
            
        } catch (error) {
            console.error('Error creating course:', error);
            return res.status(500).json({ success: false, message: 'An error occurred while creating course.' });
        }
    }

    async getScheduleById(req, res) {
        try {
            const schedule = await Course.findScheduleById(req.params.id);
            res.status(200).json(schedule);
        } catch (error) {
            console.log("Lỗi", error);
            res.status(500).json({ message: "Có lỗi xảy ra" });
        }
    }

    async createCourseSchedule(req, res) {
        try {
            const { title, course_id, summary, content, expert_info, opening_schedule } = req.body;

            if (!title) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng tạo tiêu đề lịch trình!'
                });
            }

            const course_ifo = { title, course_id, summary, content, expert_info, opening_schedule }

            const response = await Course.createCourseSchedule(course_ifo)

            if (!response) {
                return res.status(500).json({ success: false, message: 'Không thể tạo nội dung khóa học, vui lòng thử lại.' });
            }

            return res.status(200).json({
                success: true,
                message: 'Schedule created successfully',
            });
            
        } catch (error) {
            console.error('Đã xảy ra lỗi:', error);
            return res.status(500).json({ success: false, message: 'Đã xảy ra lỗi' });
        }
    }
    
    async updateCourseSchedule(req, res) {
        try {
            const { id } = req.params;
            const { course_id, summary, content, expert_info, opening_schedule } = req.body;

            const schedule = { course_id: course_id || null, summary, content, expert_info, opening_schedule };
    
            try {
                const response = await Course.updateCourseSchedule(id, schedule);
    
                if (!response) {
                    return res.status(404).json({ success: false, message: 'Schedule not found' });
                }
    
                return res.status(200).json({ success: true, message: 'Schedule updated successfully.' });
            } catch (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({
                        success: false,
                        message: 'Course already has a schedule. Cannot update.',
                    });
                }
                throw err;
            }
        } catch (error) {
            console.error('Error:', error);
            return res.status(500).json({ success: false, message: 'An error occurred' });
        }
    }

    async deleteCourseSchedule(req, res) {
        try {
            const { id } = req.params;    
            const schedule = await Course.findScheduleById(id)

            if (!schedule || schedule.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Schedule not found',
                });
            }     

            await Course.deleteCourseSchedule(id);
            return res.status(200).json({
                success: true, 
                message: 'Deleted schedule successfully'
            })
        } catch (error) {
            console.log(error)
            return res.status(500).json({ success: false, error: 'Đã có lỗi xảy ra' })
        }
    }
    
    async updateCourse(req, res) {
        try {
            const { id } = req.params;
            const {program_id, name, slug, start_date, price, quantity, duration, enroll_url, is_featured, location, contact_email, hotline, is_hidden, preferential} = req.body;
    
            if (!id) {
                return res.status(400).json({ success: false, message: "ID khóa học không được để trống." });
            }
    
            const course = await Course.getCourseById(id);

            if (!course) {
                return res.status(404).json({ success: false, message: "Không tìm thấy khóa học." });
            }
    
            const generatedSlug = slug || (name ? slugify(name, { lower: true, strict: true }) : course.slug);

            if (req.file) {
                const oldImagePath = `uploads/${course.image}`;
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath); 
                }
            }
    
            const updatedCourse = {
                program_id: program_id,
                name: name,
                slug: generatedSlug,
                image: req.file ? req.file.filename : course.image,
                start_date: start_date,
                price: price,
                // quantity: quantity,
                // duration: duration,
                enroll_url: enroll_url,
                is_featured: is_featured,
                location: location,
                contact_email: contact_email,
                hotline: hotline,
                is_hidden: is_hidden,
                preferential: preferential
            };
    
            const response = await Course.updateCourse(id, updatedCourse);
    
            if (!response) {
                return res.status(500).json({
                    success: false,
                    message: "Không thể cập nhật khóa học, vui lòng thử lại.",
                });
            }
    
            return res.status(200).json({
                success: true,
                message: "Cập nhật khóa học thành công.",
            });
        } catch (error) {
            console.error("Lỗi khi cập nhật khóa học:", error);
            return res.status(500).json({ success: false, message: "Có lỗi xảy ra trong quá trình cập nhật." });
        }
    }
    
    async deleteCourse(req, res) {
        try {
            const { id } = req.params;
            const course = await Course.getCourseById(id);

            if (!course) {
                return res.status(404).json({ message: "Khóa học không tồn tại" });
            }

            if (course.image !== null) {
                fs.unlink(`uploads/${course.image}`, (err) => {
                if (err) console.log(err);
                });
            }

            await Course.deleteCoursePermanently(id);
            res.status(200).json({
                success: true,
                message: "Xóa khóa học thành công"
            });
        } catch (error) {
            console.log("Lỗi", error);
            res.status(500).json({ message: "Có lỗi xảy ra" });
        }
    }

    async unlinkCourseById(req, res) {
        try {
            const { id } = req.params;
    
            if (!id) {
                return res.status(400).json({ success: false, message: 'ID khóa học không được để trống.' });
            }
    
            const course = await Course.getCourseById(id);
            if (!course) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học.' });
            }
    
            const result = await Course.unlinkCourseFromProgram(id);
    
            if (!result.affectedRows) {
                return res.status(500).json({ success: false, message: 'Không thể xóa khóa học khỏi chương trình đào tạo.' });
            }
    
            return res.status(200).json({ success: true, message: 'Đã xóa khóa học khỏi chương trình đào tạo.' });
        } catch (error) {
            console.error('Lỗi khi xóa khóa học khỏi chương trình:', error);
            return res.status(500).json({ success: false, message: 'Có lỗi xảy ra trong quá trình xử lý.' });
        }
    }
    
    
}


module.exports = {
    TrainingController: new TrainingController(),
    CourseController: new CourseController(),
};