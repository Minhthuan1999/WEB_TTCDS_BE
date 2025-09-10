const { Album, Photo, Video } = require("../models/mediaModel");
const fs = require("fs");
const path = require('path');


class GalleryController {
    async getAll(req, res) {
        try {
            const results = await Album.get();
            res.json(results);
        } catch (error) {
            console.error("Lỗi: ", error);
            res.status(500).json({ message: "Có lỗi xảy ra" });
        }
    } 


    async getAlbumById(req, res) {
        try {
            const album = await Album.getById(req.params.id);
            if (album) {

                const allNullPhotoIds = album.photos.every(
                    (photo) => photo.photo_id === null
                );

                const filteredAlbum = {
                    album_id: album.album_id,
                    album_name: album.album_name,
                    created_at: album.created_at,
                    photos: allNullPhotoIds ? [] : album.photos,
                };

                res.json(filteredAlbum);
            } else {
                res.status(404).json({ message: "Không tìm thấy album" });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Lỗi server" });
        }
    }


    async getPhotoListById(req, res) {
        try {
            const data = await Photo.getById(req.params.id);
            res.json(data);
        } catch (error) {
            console.log(error);
            res.status(500).json("Đã xảy ra lỗi");
        }
    }


    async setCoverAlbum(req, res) {
        try {        
            const coverId = req.body.cover_photo_id;
    
            await Album.setCover(req.params.id, coverId);
            
            return res.json({
              success: true,
              message: "Cập nhật thành công!",
            });
            } catch (error) {
                return res.status(500).json({ success: false, message: "Đã xảy ra lỗi" });
        }
    }

  async createNew(req, res) {
    try {
        const album = { album_name: req.body.album_name };
        await Album.create(album);

        res.status(200).json({
            success: true,
            message: "Tạo album thành công!",
        });
    } catch (error) {
        console.log("Lỗi", error);
        res.status(500).json({ message: "Có lỗi xảy ra" });
    }
  }

  async renameAlbum(req, res) {
    try {        
        const album_name = { album_name: req.body.album_name };

        const updatedRows = await Album.rename(req.params.id, album_name);

        return res.json({
          success: true,
          message: "Cập nhật thành công!",
          status: updatedRows.message,
        });
        } catch (error) {
            return res.status(500).json({ success: false, message: "Đã xảy ra lỗi" });
        }
    }



    async deleteAlbum (req, res) {
        try {
            const results = await Album.getById(req.params.id)

            const isAlbumEmpty = results.photos.every(
                (photo) => photo.photo_id === null
            );


            if (!isAlbumEmpty) {
                await Promise.all(
                    results.photos.map(async (item) => {
                        // Sử dụng Promise để đảm bảo xử lý đồng bộ và kiểm tra lỗi
                        return new Promise((resolve, reject) => {
                            fs.unlink(`${item.photo_url}/${item.filename}`, (err) => {
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
            await Album.delete(req.params.id)

            res.json({ success: true, message: 'Xóa thành công' });
        } catch (error) {
            console.log(error)
            res.send('Có lỗi xảy ra')
        }
    }


    async deleteSelectedPhotos(req, res) {
        try {
            const filenames = req.body.filenames;
    
            if (filenames.length > 0) {
            // Your existing code for unlinking files
                await Promise.all(
                    filenames.map(async (item) => {
                        const filePath = `uploads/${item}`;

                        return new Promise((resolve, reject) => {
                            fs.unlink(filePath, (err) => {
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
            await Photo.delete(filenames);
    
            res.json({ success: true, message: 'Xóa thành công' });
        } catch (error) {
            console.log(error);
            res.send('Có lỗi xảy ra');
        }
    }


    async uploadImage(req, res) {
        try {
            const fileList = req.files;
            const album_id = req.body.id;
        
            if (fileList && fileList.length > 0) {
                const lastUploadedPhotoId = await Promise.all(fileList.map(async (file) => {
                    const data = {
                        photo_url: file.destination,
                        photo_size: file.size,
                        filename: file.filename,
                        photo_name: Buffer.from(file.originalname, "latin1").toString("utf8"),
                        album_id: album_id,
                    };
                    return await Photo.upload(data);
                })).then(photoIds => photoIds.pop()); 
        
                return res.json({ success: true, message: 'Upload thành công', lastUploadedPhotoId });
            }
            
            return res.json({ success: true, message: 'Không có ảnh để upload' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: 'Đã có lỗi xảy ra' });
        }
    }


    //Video function
    async getVideos(req, res) {
        try {
            const results = await Video.get();
            res.json(results);
        } catch (error) {
            console.error("Lỗi: ", error);
            res.status(500).json({ message: "Có lỗi xảy ra" });
        }
    } 

    async getVideoByPriority(req, res) {
        try {
            const results = await Video.getByPriority();
            res.json(results);
        } catch (error) {
            console.error("Lỗi: ", error);
            res.status(500).json({ message: "Có lỗi xảy ra" });
        }
    }


    async getVideoById(req, res) {
        try {
            const result = await Video.getById(req.params.id);
            res.json(result[0]);
        } catch (error) {
            console.error("Lỗi: ", error);
            res.status(500).json({ message: "Có lỗi xảy ra" });
        }
    } 


    // async uploadVideo(req, res) {
    //     try {
    //         const { title, description, userID, duration, priority,url_link } = req.body;
    //         const videoFile = req.files.video?.[0]; 
    //         const thumbnailFile = req.files.thumbnail?.[0]; 
    //         if (!videoFile) {
    //             return res.status(400).json({ success: false, message: 'No video file uploaded.' });
    //         }

    //         const videoData = {
    //             title: title || 'Untitled', 
    //             description: description || null,
    //             filename: videoFile.filename,
    //             url: videoFile.path,
    //             thumbnail: thumbnailFile ? thumbnailFile.path : null,
    //             duration: duration || null,
    //             size: videoFile.size, 
    //             priority: priority || 0,
    //             userID: userID,
    //             url_link: url_link, 
    //         };


    //         const result = await Video.upload(videoData);

    //         return res.status(200).json({
    //             success: true,
    //             message: 'Video uploaded successfully',
    //             videoId: result.insertId,
    //         });
            
    //     } catch (error) {
    //         console.error('Error uploading video:', error);
    //         return res.status(500).json({ success: false, message: 'An error occurred while uploading video.' });
    //     }
    // }

      async uploadVideo(req, res) {
    try {
      const {
        title,
        description,
        userID,
        duration,
        priority,
        url_link,        // <-- nếu có thì coi là chế độ YouTube
      } = req.body;

      const videoFile = req.files?.video?.[0] || null;
      const thumbnailFile = req.files?.thumbnail?.[0] || null;

      // Xác định chế độ: file hay YouTube
      const isYoutube = !!url_link && !videoFile;

      if (!isYoutube && !videoFile) {
        return res
          .status(400)
          .json({ success: false, message: 'Hãy tải file video hoặc nhập link YouTube.' });
      }

      // Chuẩn hóa link YouTube (từ youtu.be, /embed, ... -> watch?v=ID)
      const normalizeYouTubeLink = (link) => {
        try {
          const u = new URL(link);
          let id = null;
          if (u.hostname.includes('youtu.be')) id = u.pathname.slice(1);
          else if (u.searchParams.get('v')) id = u.searchParams.get('v');
          else if (u.pathname.startsWith('/embed/')) id = u.pathname.split('/embed/')[1];
          return id ? `https://www.youtube.com/watch?v=${id}` : link;
        } catch {
          return link;
        }
      };

      const data = {
        title: title || 'Untitled',
        description: description || null,

        // Chế độ FILE
        filename: videoFile ? videoFile.filename : null,
        url: videoFile ? videoFile.path : null,
        size: videoFile ? videoFile.size : null,

        // Thumbnail (tùy chọn, cho cả 2 chế độ)
        thumbnail: thumbnailFile ? thumbnailFile.path : null,

        // Chế độ YOUTUBE
        url: isYoutube ? url_link : videoFile.path,
        url_link: isYoutube
          ? normalizeYouTubeLink(url_link)
          : (videoFile ? videoFile.path : null), // nếu là file, bạn muốn có thể gán = path

        duration: duration || null,
        priority: Number.isFinite(+priority) ? +priority : 0,
        userID,
      };

      const result = await Video.upload(data);

      return res.status(200).json({
        success: true,
        message: 'Video uploaded successfully',
        videoId: result.insertId,
      });
    } catch (error) {
      console.error('Error uploading video:', error);
      return res
        .status(500)
        .json({ success: false, message: 'An error occurred while uploading video.' });
    }
  }

    async deleteVideo(req, res) {
        try {
            const { id } = req.params
            const video = await Video.getById(id);

            if (!video) {
                return res.status(404).json({
                    success: false,
                    message: 'Video not found'
                })
            }

            const filePath = path.join(__dirname, '..', video[0].url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }


            if (video[0].thumbnail) {
                const thumbnailPath = path.join(__dirname, '..', video[0].thumbnail);
                if (fs.existsSync(thumbnailPath)) {
                    fs.unlinkSync(thumbnailPath);
                }
            }
            

            await Video.delete(id)

            return res.status(200).json(
                { 
                    success: true, 
                    message: 'Video deleted successfully' 
                }
            );
            
        } catch (error) {
            console.error('Error deleting video:', error);
            return res.status(500).json({ success: false, message: 'An error occurred while deleting video.' });
        }
    };


    // async updateVideo(req, res) {
    //     const { id } = req.params;
    //     const data = req.body;
    //     const videoFile = req.files.video?.[0]; 
    //     const thumbnailFile = req.files.thumbnail?.[0]; 
    //     try {

    //         const video = await Video.getById(id)

    //         if (!video) {
    //             return {
    //                 success: false,
    //                 message: 'Video not found'
    //             }
    //         }

    //         if (videoFile && video[0].url) {

    //             const oldFilePath = path.join(__dirname, '..', video[0].url);
    //             if (fs.existsSync(oldFilePath)) {
    //                 fs.unlinkSync(oldFilePath);
    //             }
    //         }

    //         if (thumbnailFile && video[0].thumbnail) {
    //             const thumbnailPath = path.join(__dirname, '..', video[0].thumbnail);
    //             if (fs.existsSync(thumbnailPath)) {
    //                 fs.unlinkSync(thumbnailPath);
    //             }
    //         }
            
    //         const form = {
    //             ...data,
    //             ...(videoFile && {
    //                 url: videoFile.path,
    //                 size: videoFile.size,
    //                 filename: videoFile.filename
    //             }),
    //             ...(thumbnailFile && {
    //                 thumbnail: thumbnailFile.path
    //             })
    //         };

    //         const updatedVideo = await Video.update(id, form)
    //         return res.json({
    //             message: 'Video updated successfully',
    //             video: updatedVideo
    //         })
    //     } catch (error) {
    //         res.status(500).json({ message: 'Internal server error', error: error.message })
    //     }
    // }   
    async updateVideo(req, res) {
    try {
      const id = req.params.id;
      const { title, description, userID, duration, priority, url_link } = req.body;
      const videoFile = req.files?.video?.[0] || null;
      const thumbnailFile = req.files?.thumbnail?.[0] || null;

      const norm = (p) => (p || '').replace(/\\/g, '/');
      const normalizeYouTubeLink = (link) => {
        try {
          const u = new URL(link);
          let vid = null;
          if (u.hostname.includes('youtu.be')) vid = u.pathname.slice(1);
          else if (u.searchParams.get('v')) vid = u.searchParams.get('v');
          else if (u.pathname.startsWith('/embed/')) vid = u.pathname.split('/embed/')[1];
          return vid ? `https://www.youtube.com/watch?v=${vid}` : link;
        } catch {
          return link;
        }
      };

      const patch = {};
      if (title !== undefined)       patch.title = title;
      if (description !== undefined) patch.description = description;
      if (userID !== undefined)      patch.userID = userID;
      if (duration !== undefined)    patch.duration = duration || null;
      if (priority !== undefined)    patch.priority = Number.isFinite(+priority) ? +priority : 0;

      if (thumbnailFile) patch.thumbnail = norm(thumbnailFile.path);

      if (videoFile) {
        // Cập nhật theo chế độ FILE
        patch.filename = videoFile.filename;
        patch.url      = norm(videoFile.path);
        patch.url_link = norm(videoFile.path);
        patch.size     = videoFile.size;
      } else if (typeof url_link === 'string' && url_link.trim() !== '') {
        // Cập nhật theo chế độ YouTube
        const yt = normalizeYouTubeLink(url_link.trim());
        patch.url      = yt;          // tránh NOT NULL
        patch.url_link = yt;
        patch.filename = null;        // muốn giữ lại filename cũ thì bỏ 2 dòng này
        patch.size     = null;
      }
      // nếu không gửi file & không gửi url_link => chỉ cập nhật các field khác

      await Video.update(id, patch);

      return res.status(200).json({ success: true, message: 'Video updated successfully' });
    } catch (error) {
      console.error('Error updating video:', error);
      return res.status(500).json({ success: false, message: 'An error occurred while updating video.' });
    }
  }

  }


module.exports = new GalleryController();
