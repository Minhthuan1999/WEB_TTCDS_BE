const App = require("../models/appModel");
const { Banner, Navbar } = require("../models/outlineModel");
const fs = require("fs");


class OutlineController {


    //Banner API
    async checkOrderIndexDuplicate(req, res, next) {
        try {
            const isDuplicated = await Banner.isOrderIndexDuplicated(req.params.id);
            res.json(isDuplicated);
        } catch (error) {
            console.log(error);
            res.status(500).json("Đã xảy ra lỗi");
        }
    }


    async getOneBanner(req, res) {
        try {
          const banner = await Banner.getOne(req.params.id);
          
          res.json(banner);
        } catch (error) {
          console.log(error);
          res.status(500).json({ message: "Không tìm thấy" });
        }
    }

    async getByPath(req, res) {
        try {
            const results = await Banner.getByPath(req.params.id);
            res.json(results);
        } catch (error) {
            console.error("Lỗi: ", error);
            res.status(500).json({ message: "Có lỗi xảy ra" });
        }
    } 


    async getAll(req, res) {
        try {
            const results = await Banner.getAll();
            res.json(results);
        } catch (error) {
            console.error("Lỗi: ", error);
            res.status(500).json({ message: "Có lỗi xảy ra" });
        }
    } 


    async deleteBanner(req, res, next) {
        try {
            const banner = await Banner.getOne(req.params.id);

            if (banner.image_url !== null) {
                fs.access(`uploads/${banner.image_url}`, fs.constants.F_OK, (err) => {
                    if(!err) {
                        fs.unlink(`uploads/${banner.image_url}`, (err) => {
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

            await Banner.delete(req.params.id);

            res.json({ success: true, message: 'Xóa thành công' });
    
        } catch (error) {
          console.error('Lỗi: ', error);
          res.status(500).json({ message: 'Có lỗi xảy ra' });
        }
    }


    
    async createBanner(req, res) {
    try {
        const {order_index, image_url, is_active, link_url, path } = req.body

        if (!req.body) {
            return res.send('Các trường không được để trống')
        }
        
        const data = {
            order_index: order_index,
            image_url: req.file ? req.file.filename : null,
            is_active: is_active,
            link_url: link_url,
            path: path
        };

        await Banner.create(data)
        res.status(200).json({
            success: true,
            message: 'Tạo mới thành công'
        })

    } catch (error) {
        if (error.message === "Order index is duplicated.") {
            // Xử lý khi order index bị trùng
            return res.status(400).json({ message: "Số chỉ mục đã tồn tại   ." });
        }
        console.error("Lỗi: ", error);
        return res.status(500).json({ message: "Có lỗi xảy ra" });
    }
  }


  async updateBanner(req, res) {
    try {
        const { order_index, link_url, is_active, image_url, path } = req.body;
        const bannerId = req.params.id;
        
        // Lấy banner cần cập nhật
        const bannerToUpdate = await Banner.getOne(bannerId);


        if ((req.file && bannerToUpdate.image_url !== null)) {
            fs.unlink(`uploads/${bannerToUpdate.image_url}`, (err) => {
              if (err) console.log(err);
            });
        }

        // Cập nhật banner cần cập nhật
        const updatedRows = await Banner.update(bannerId, {
            order_index: order_index,
            link_url: link_url,
            is_active: is_active,
            image_url: req.file ? req.file.filename : bannerToUpdate.image_url,
            path: path
        });

        res.json({
            success: true,
            message: "Cập nhật thành công!",
            status: updatedRows.message,
        });
        } catch (error) {
            if (error.message === "Order index is duplicated.") {
                // Xử lý khi order index bị trùng
                return res.status(400).json({ message: "Số chỉ mục đã tồn tại." });
            }
            console.error("Lỗi: ", error);
            return res.status(500).json({ message: "Có lỗi xảy ra" });  
        }
    }   


    //Navbar API

    async createItemNavbar(req, res) {
        try {
            const {name, url, orderID, is_active } = req.body
    
            if (!req.body) {
                return res.send('Các trường không được để trống')
            }
            
            const data = {
                name: name,
                orderID: orderID,
                url: url,
                is_active: is_active,
            };
    
            await Navbar.create(data)
            res.status(200).json({
                success: true,
                message: 'Tạo mới thành công'
            })
    
        } catch (error) {
            console.error("Lỗi: ", error);
            return res.status(500).json({ message: "Có lỗi xảy ra" });
        }
    }

    async getItemsNavbar(req, res) {
        try {
            const results = await Navbar.getAll();
            res.json(results);
        } catch (error) {
            console.error("Lỗi: ", error);
            res.status(500).json({ message: "Có lỗi xảy ra" });
        }
    }
    
    
    async getItemsNavbarById(req, res) {
        try {
            const results = await Navbar.getById(req.params.id);
            res.json(results);
        } catch (error) {
            console.error("Lỗi: ", error);
            res.status(500).json({ message: "Có lỗi xảy ra" });
        }
    } 



    async deleteItemNavbar (req, res) {
        try {
            await Navbar.delete(req.params.id)
            res.json({ success: true, message: 'Xóa thành công' });
        } catch (error) {
            console.log(error)
            res.send('Có lỗi xảy ra')
        }
    }


    async updateItemNavbar(req, res) {
        try {
            const { name, url, orderID, is_active } = req.body;
    
            const updatedRows = await Navbar.update(req.params.id, {
                name: name,
                url: url,
                orderID: orderID,
                is_active: is_active,
            });
    
            res.json({
                success: true,
                message: "Cập nhật thành công!",
                status: updatedRows.message,
            });
            } catch (error) {
                console.error("Lỗi: ", error);
                return res.status(500).json({ message: "Có lỗi xảy ra" });  
            }
        }
  
}

module.exports = new OutlineController();
