const Attachment = require("../models/attachModel");
const fs = require("fs");
const path = require('path');
const { News } = require("../models/newsModel");


class AttachmentController {
    async uploadFile(req, res) {
        try {
            const fileList = req.files;
            const nid = req.body.nid; // id => news
      
            if (fileList && fileList.length > 0) {
                const uploadPromises = fileList.map(async (file) => {
                    const fileExtension = path.extname(file.filename).slice(1);
                    const data = {
                        file_path: file.destination,
                        file_type: fileExtension,
                        file_size: file.size,
                        filename: file.filename,
                        originalname: Buffer.from(file.originalname, "latin1").toString("utf8"),
                        nid: nid,
                    };
                    await Attachment.upload(data);
                });
            
                await Promise.all(uploadPromises);
            }
            
            return res.json({ success: true, message: 'Upload thành công' });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: 'Đã có lỗi xảy ra' });
        }
    }

    async delete(req, res) {
        try {
            const results = await Attachment.getById(req.params.id);
    
            if (results.length > 0) {
                await Promise.all(
                    results.map(async (item) => {
                        // Sử dụng Promise để đảm bảo xử lý đồng bộ và kiểm tra lỗi
                        return new Promise((resolve, reject) => {
                            fs.unlink(`uploads/${item.filename}`, (err) => {
                                if (err) {
                                    console.log(err);
                                    reject(err);
                                } else {
                                    resolve();
                                }
                            });
                        });
                    })
                );
            }
    
            await Attachment.delete(req.params.id);
    
            res.json({ success: true, message: 'Xóa bản tin thành công' });
    
        } catch (error) {
            console.error('Lỗi: ', error);
            res.status(500).json({ message: 'Có lỗi xảy ra' });
        }
    }

    
    
    async update(req, res) {
        try {
        const fileList = req.files;
        const results = await Attachment.getById(req.params.id);

        // Xóa các file cũ
        if (results.length > 0) {
            await Promise.all(
                
                results.map(async (item) => {
                    const path = `${item.file_path}/${item.filename}`;
                    try {
                        if(fs.existsSync(path)) {
                            // Sử dụng Promise để đảm bảo xử lý đồng bộ và kiểm tra lỗi
                            return new Promise((resolve, reject) => {
                                fs.unlink(`${item.file_path}/${item.filename}`, (err) => {
                                    if (err) {
                                        console.log(err);
                                        reject(err);
                                    } else {
                                        resolve();
                                    }
                                });
                            });
                        }
                    } catch (error) {
                        console.log(`File not found: ${path}`)
                    }
                })
            );
            await Attachment.delete(req.params.id);
        }
    
        // Upload các file mới
        if (fileList && fileList.length > 0) {
            const uploadPromises = fileList.map(async (file) => {
            try {
                const fileExtension = path.extname(file.filename).slice(1);
                const data = {
                file_path: file.destination,
                file_type: fileExtension,
                file_size: file.size,
                filename: file.filename,
                originalname: Buffer.from(file.originalname, 'latin1').toString('utf8'),
                nid: req.params.id,
                };
                await Attachment.upload(data);
            } catch (err) {
                console.error(`Error uploading file ${file.filename}: ${err.message}`);
            }
            });
    
            await Promise.all(uploadPromises);
        }
    
        return res.json({ success: true, message: 'Upload thành công' });
        } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Đã xảy ra lỗi', error: error.message });
        }
    }


    

      
}

module.exports = new AttachmentController();
