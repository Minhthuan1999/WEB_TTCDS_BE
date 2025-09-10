const { filter } = require('../models/contactModel');
const Contact = require('../models/contactModel')

class ContactController {

    async getAllContacts (req, res) {
        try {
            const contacts = await Contact.getAll();
            res.json(contacts);
        } catch (error) {
            console.log(error);
            res.status(500).json("Đã xảy ra lỗi");
        }
    }

    async writeContact(req, res) {
        try {
            const { fullname, email, address, phone, message } = req.body
    
            // Kiểm tra các trường bắt buộc
            if (fullname === "" || phone === "" || message === "") {
                return res.status(400).json({ success: false, message: 'Các trường không được để trống' })
            }
    
            // Tạo đối tượng Contact mới
            const newContact = {
                fullname: fullname,
                phone: phone,
                message: message,
            }
    
            // Thêm email và address vào đối tượng nếu chúng tồn tại
            if (email) {
                newContact.email = email
            }
            if (address) {
                newContact.address = address
            }
    
            // Tạo Contact mới trong cơ sở dữ liệu
            await Contact.create(newContact)
    
            // Trả về kết quả thành công
            res.status(200).json({ success: true, message: 'Gởi đi thành công' })
    
        } catch (error) {
            // Xử lý lỗi nếu có
            console.error(error)
            res.status(500).json({ success: false, message: 'Có lỗi xảy ra' })
        }
    }

    async approveContact (req, res) {
        try {
            await Contact.check(req.params.id)
            res.status(200).json({ success: true, message: 'Phê duyệt thành công' })
        } catch (error) {
            console.log(error);
            res.status(500).json("Đã xảy ra lỗi");
        }
    }

    async filterContact (req, res) {
        try {
            const {col ,value } = req.body
            const results = await Contact.filter(col, value);

            res.status(200).json({
                success: true,
                results
            });
            
        } catch (error) {
            console.log(error)
            res.send('Đã xảy ra lỗi')
        }
    }

    async deleteContact (req, res) {
        try {
            await Contact.delete(req.params.id)
            res.json({ success: true, message: 'Xóa thành công' });
        } catch (error) {
            console.log(error)
            res.send('Có lỗi xảy ra')
        }
    }

}



module.exports = new ContactController()