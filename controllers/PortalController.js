const fs = require("fs");
const Portal = require("../models/portalModel");


class PortalController {

    async getOnePortal(req, res) {
        try {
          const port = await Portal.getOne(req.params.id);
          
          res.json(port);
        } catch (error) {
          console.log(error);
          res.status(500).json({ message: "Không tìm thấy" });
        }
    }

    async getAllPorts(req, res) {
        try {
            const ports = await Portal.getAll();
            res.json(ports);
        } catch (error) {
            console.log(error);
            res.status(500).json("Đã xảy ra lỗi");
        }
    }

    async createPortal(req, res) {
        try {
            const { portal_name, img_url, website_url } = req.body
            
            if (portal_name === '' || website_url === '') {
                return res.status(400).json({ message: 'Các trường không được để trống'})
            }

            const data = {
                portal_name: portal_name,
                website_url: website_url,
                image: req.file ? req.file.filename : null,
            };
            await Portal.create(data);
            res.status(200).json({
                success: true,
                message: 'Tạo thành công'
            })

        } catch (error) {
            console.error("Lỗi: ", error);
            res.status(500).json({ message: "Có lỗi xảy ra" });
        }
    }

    async removePortal(req, res) {
        try {
            const portal = await Portal.getOne(req.params.id);

            if (portal.image !== null) {
                fs.access(`uploads/${portal.image}`, fs.constants.F_OK, (err) => {
                    if(!err) {
                        fs.unlink(`uploads/${portal.image}`, (err) => {
                        if (err) {
                            console.log('Không thể xóa tệp', err)
                        }
                        else {
                            console.log('Xóa tệp thành công')
                        }

                    })
                } else {
                    console.log('Tệp không tồn tại')
                }
                });
            }

            await Portal.delete(req.params.id);

            res.json({ success: true, message: 'Xóa thành công' });
    
        } catch (error) {
          console.error('Lỗi: ', error);
          res.status(500).json({ message: 'Có lỗi xảy ra' });
        }
    }



    async updatePortal(req, res) {
        try {
            const {portal_name, website_url, image} = req.body
            
            const data = await Portal.getOne(req.params.id);

            
            if ((req.file && data.image !== null)) {
                fs.unlink(`uploads/${data.image}`, (err) => {
                  if (err) console.log(err);
                });
            }
    
            const dataList = {
                portal_name: portal_name,
                website_url: website_url,
                image: req.file ? req.file.filename : data.image
            };
      
            const updatedRows = await Portal.update(req.params.id, dataList)

            res.json({ 
            success: true,
            message: 'Cập nhật thành công!', 
            status: updatedRows.message})
    
        } catch (error) {
          console.log(error)
    
          res.status(500).json({ success: false, message: 'Đã xảy ra lỗi' })
        }
    }

}

module.exports = new PortalController();
