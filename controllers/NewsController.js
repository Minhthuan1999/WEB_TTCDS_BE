const { News, Event } = require("../models/newsModel");
const jwt = require('jsonwebtoken')
const moment = require("moment")
const fs = require("fs");


class NewsController {

    async viewAllPosts(req, res) {
        try {
            const posts = await News.getAll();
            res.json(posts);
        } catch (error) {
            console.log(error);
            res.status(500).json("Đã xảy ra lỗi");
        }
    }

    async getAllByAdmin(req, res) {
        try {
            const posts = await News.getAllByAdmin(req.params.id);
            res.json(posts);
        } catch (error) {
            console.log(error);
            res.status(500).json("Đã xảy ra lỗi");
        }
    }


    

    async viewOnePost(req, res) {
        try {
          const post = await News.getById(req.params.id);
      
          if (post) {
            const newDate = new Date(post.date);
            const formattedDate = moment(newDate).format('DD-MM-YYYY');
      
            // ================
            res.json(post);
          } else {
            res.status(404).json({ message: "Không tìm thấy" });
          }
        } catch (error) {
          console.log(error);
          res.status(500).json({ message: "Có lỗi xảy ra" });
        }
      }

    async getMostViewedNews(req, res) {
        try {
            const posts = await News.getTrendingNews();
            res.json(posts);
        } catch (error) {
            console.log(error);
            res.status(500).json("Đã xảy ra lỗi");
        }
    }

    
    async getRecentAnnouncements(req, res) {
        try {
            const posts = await News.getAnnouncements();
            res.json(posts);
        } catch (error) {
            console.log(error);
            res.status(500).json("Đã xảy ra lỗi");
        }
    }

    //Lấy lịch làm việc
    async getPlan(req, res) {
        try {
            const posts = await News.getWorkSchedule();
            res.json(posts);
        } catch (error) {
            console.log(error);
            res.status(500).json("Đã xảy ra lỗi");
        }
    }



    async getByUserCreate(req, res) {
        try {
            const posts = await News.getByUserCreate(req.params.id);
            res.json(posts);
        } catch (error) {
            console.log(error);
            res.status(500).json("Đã xảy ra lỗi");
        }
    }


    async getLatestPost(req, res) {
        try {
            const posts = await News.getLatestNews(req.params.id);
            res.json(posts);
        } catch (error) {
            console.log(error);
            res.status(500).json("Đã xảy ra lỗi");
        }
    }

    async getByCategory(req, res) {
        try {
            const posts = await News.getNewsByCategory(req.params.id);
            res.json(posts);
        } catch (error) {
            console.log(error);
            res.status(500).json("Đã xảy ra lỗi");
        }
    }


    async approveNews (req, res) {
        try {
            await News.approve(req.params.id)
            res.status(200).json({ success: true, message: 'Phê duyệt thành công' })
        } catch (error) {
            console.log(error);
            res.status(500).json("Đã xảy ra lỗi");
        }
    }

    async refuseNews (req, res) {
        try {
            await News.refuse(req.params.id)
            res.status(200).json({ success: true, message: 'Từ chối thành công' })
        } catch (error) {
            console.log(error);
            res.status(500).json("Đã xảy ra lỗi");
        }
    }

    async reSend (req, res) {
        try {
            await News.resend(req.params.id)
            res.status(200).json({ success: true, message: 'Gởi lại thành công' })
        } catch (error) {
            console.log(error);
            res.status(500).json("Đã xảy ra lỗi");
        }
    }

// củ bội anh
    // async EditPost(req, res) {
    //     try {
    //         const {title, content, category, image, date, updated_by, description, status} = req.body
            
    //         const news = await News.getById(req.params.id);

    //         const currentDate = new Date();

            
    //         if ((req.file && news.image !== null)) {
    //             fs.unlink(`uploads/${news.image}`, (err) => {
    //               if (err) console.log(err);
    //             });
    //         }
    
    //         const data = {
    //             title: title,
    //             content: content,
    //             category: category,
    //             image: req.file ? req.file.filename : news.image,
    //             date: date ? moment(date).format("YYYY-MM-DD HH:mm:ss") : news.date, // thêm dòng này
    //             updated_date: moment(currentDate).format("YYYY-MM-DD HH:mm:ss"),
    //             updated_by: updated_by,
    //             description: description,
    //             status: status
    //         };
      
    //         const updatedRows = await News.update(req.params.id, data)

    //         res.json({ 
    //         success: true,
    //         message: 'Cập nhật thành công!', 
    //         status: updatedRows.message})
    
    //     } catch (error) {
    //       console.log(error)
    
    //       res.status(500).json({ success: false, message: 'Đã xảy ra lỗi' })
    //     }
    // }


    async increaseView(req, res) {
        try {            
            const updatedRows = await News.increaseViews(req.params.id)

            res.json({ 
            success: true,
            message: 'Đã cập nhật lượt xem', 
            status: updatedRows.message})
    
        } catch (error) {
          console.log(error)
    
          res.status(500).json({ success: false, message: 'Đã xảy ra lỗi' })
        }
    }
    // mới 
async EditPost(req, res) {
  try {
    const {
      title, content, category, image, date,
      updated_by, description, status,
      post_type,      // <- có thể đổi loại bài
      service_cid     // <- có thể đổi thể loại dịch vụ
    } = req.body;

    const news = await News.getById(req.params.id);
    if (!news) return res.status(404).json({ message: 'Không tìm thấy bài viết' });

    const currentDate = new Date();

    // Xóa ảnh cũ nếu upload ảnh mới
    if (req.file && news.image !== null) {
      fs.unlink(`uploads/${news.image}`, (err) => { if (err) console.log(err); });
    }

    // Xác định loại bài sau update (ưu tiên body, không có thì giữ nguyên)
    const typeAfter =
      post_type ? (String(post_type).toLowerCase() === 'service' ? 'service' : 'news')
                : (news.post_type || 'news');

    const data = {
      title:       (typeof title       !== 'undefined') ? title       : news.title,
      content:     (typeof content     !== 'undefined') ? content     : news.content,

      // news: giữ/ghi category; service: luôn NULL
      category:    (typeAfter === 'news')
                    ? ((typeof category !== 'undefined') ? category : news.category)
                    : null,

      // service: giữ/ghi service_cid; news: luôn NULL
      service_cid: (typeAfter === 'service')
                    ? ((typeof service_cid !== 'undefined') ? service_cid : news.service_cid)
                    : null,

      post_type:   typeAfter,

      image: req.file ? req.file.filename : news.image,

      // Giữ nguyên ngày tạo cũ nếu không truyền lên
      date: (typeof date !== 'undefined' && date)
              ? moment(date).format('YYYY-MM-DD HH:mm:ss')
              : news.date,

      updated_date: moment(currentDate).format('YYYY-MM-DD HH:mm:ss'),
      updated_by:   (typeof updated_by   !== 'undefined') ? updated_by   : news.updated_by,
      description:  (typeof description  !== 'undefined') ? description  : news.description,
      status:       (typeof status       !== 'undefined') ? status       : news.status
    };

    const updatedRows = await News.update(req.params.id, data);

    res.json({
      success: true,
      message: 'Cập nhật thành công!',
      status: updatedRows.message
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Có lỗi xảy ra' });
  }
}
    // củ bội anh
    // async createPost(req, res) {
    //     try {
    //         const { title, content, category, userID, image, description, updated_by, status } = req.body
    //         //Format current date
    //         const currentDate = new Date();

    //         if (title === '' || content === '' || category === '') {
    //             return res.status(400).json({ message: 'Các trường không được để trống'})
    //         }

    //         const data = {
    //             userID: userID,
    //             title: title,
    //             content: content,
    //             category: category,
    //             date: moment(currentDate).format("YYYY-MM-DD HH:mm:ss"),
    //             updated_date: moment(currentDate).format("YYYY-MM-DD HH:mm:ss"),
    //             image: req.file ? req.file.filename : null,
    //             updated_by: updated_by,
    //             description: description,
    //             status: status
    //         };
    //         const results = await News.create(data);


    //         res.status(200).json({
    //             success: true,
    //             message: status === 'Nhập tin' ? 'Lưu thành công' : 'Chuyển đi thành công',
    //             nid: results.insertId
    //         })

    //     } catch (error) {
    //         res.status(500).json({ message: "Có lỗi xảy ra" });
    //     }
    // }
// mới
async createPost(req, res) {
  try {
    const {
      title, content, category, userID,
      description, updated_by, status,
      post_type,        // <- thêm
      service_cid       // <- thêm
    } = req.body;

    const currentDate = new Date();
    const type = (String(post_type || 'news').toLowerCase() === 'service') ? 'service' : 'news';

    // --- Validation tách theo loại bài ---
    if (!title || !content)
      return res.status(400).json({ message: 'Các trường không được để trống' });

    if (type === 'news' && (!category || category === ''))
      return res.status(400).json({ message: 'Thiếu category cho bài tin tức' });

    if (type === 'service' && (!service_cid || service_cid === ''))
      return res.status(400).json({ message: 'Thiếu service_cid cho bài tin dịch vụ' });

    const data = {
      userID: userID,
      title: title,
      content: content,
      // news dùng category, service thì set NULL
      category: (type === 'news') ? category : null,
      // service dùng service_cid, news thì set NULL
      service_cid: (type === 'service') ? service_cid : null,
      post_type: type,

      date: moment(currentDate).format('YYYY-MM-DD HH:mm:ss'),
      updated_date: moment(currentDate).format('YYYY-MM-DD HH:mm:ss'),
      image: req.file ? req.file.filename : null,
      updated_by: updated_by,
      description: description,
      status: status
    };

    const results = await News.create(data);

    res.status(200).json({
      success: true,
      message: status === 'Nháp tin' ? 'Lưu thành công' : 'Chuyển đi thành công',
      nid: results.insertId
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Có lỗi xảy ra' });
  }
}
    async deletePost(req, res) {
        try {
            const news = await News.getById(req.params.id);

            if (news.image !== null) {
                fs.unlink(`uploads/${news.image}`, (err) => {
                if (err) console.log(err);
                });
            }

            await News.delete(req.params.id);

            res.json({ success: true, message: 'Xóa bản tin thành công' });
            
        } catch (error) {
          console.error('Lỗi: ', error);
          res.status(500).json({ message: 'Có lỗi xảy ra' });
        }
    }
    
    async searchPost(req, res) {
        try {
            const searchKey = req.query.keyword
            const results = await News.search(searchKey, req.params.id)

            res.status(200).json(results)
        } catch (error) {
            console.error('Lỗi: ', error);
            res.status(500).json({ message: 'Có lỗi xảy ra' });
        }
    }

    // lấy tin dịch vụ
    // === THÊM VÀO CLASS NewsController ===

async getAllServiceNews(req, res) {
  try {
    const posts = await News.getServiceNews();
    res.json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).json('Đã xảy ra lỗi');
  }
}

async getServiceNewsByCategory(req, res) {
  try {
    const posts = await News.getServiceNewsByCategory(req.params.id);
    res.json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).json('Đã xảy ra lỗi');
  }
}


    //Controller Topic
    async getAllTopic(req, res) {
        try {
            const posts = await News.getAllTopic();
            res.json(posts);
        } catch (error) {
            console.log(error);
            res.status(500).json("Đã xảy ra lỗi");
        }
    }


    async getTopicByParentID(req, res) {
        try {
            const posts = await News.getTopicByParentId(req.params.id);
            res.json(posts);
        } catch (error) {
            console.log(error);
            res.status(500).json("Đã xảy ra lỗi");
        }
    }


    async getDisplayHomeTopic(req, res) {
        try {
            const posts = await News.getDisplayHomeTopic();
            res.json(posts);
        } catch (error) {
            console.log(error);
            res.status(500).json("Đã xảy ra lỗi");
        }
    }


    async deleteTopic(req, res) {
        try {
            await News.deleteTopic(req.params.id);

            res.json({ success: true, message: 'Xóa chủ đề thành công' });
            
        } catch (error) {
          res.status(500).json({ message: 'Không thể xóa chủ đề này' });
        }
    }

    async createNewTopic(req, res) {
        try {
            await News.createTopic(req.body);
            res.status(200).json({
                success: true,
                message: 'Tạo chủ đề thành công'
            })

        } catch (error) {
            res.status(500).json({ message: "Có lỗi xảy ra" });
        }
    }

    async updateNewTopic(req, res) {
        try {

            const updatedRows = await News.updateTopic(req.params.id, req.body)

            res.json({ 
            success: true,
            message: 'Cập nhật thành công!', 
            status: updatedRows.message})
    
        } catch (error) {
          console.log(error)
    
          res.status(500).json({ success: false, message: 'Đã xảy ra lỗi' })
        }
    }


    // hiển thị tất cả tin tức 
//     async viewAllNoPaging(req, res) {
//     try {
//       const posts = await News.getAllNoPaging();
//       res.json(posts);
//     } catch (error) {
//       console.log(error);
//       res.status(500).json({ message: "Đã xảy ra lỗi" });
//     }
//   }

async updateDate(req, res) {
    try {
        const { date } = req.body;
        await News.updateDate(req.params.id, { date: moment(date).format("YYYY-MM-DD HH:mm:ss") });
        res.json({ success: true, message: "Cập nhật ngày thành công" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
    
}

const newsControllerIns = new NewsController()

module.exports = {
    NewsController: newsControllerIns,
}
