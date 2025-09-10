const { json } = require('express');
const jwt = require('jsonwebtoken')

exports.checkTokenExpiration = (req, res, next) => {
    const token = req.cookies.token; // Lấy mã thông báo từ cookie (hoặc từ phần tử khác nếu bạn lưu mã thông báo ở đâu đó)
  
    if (!token) {
      return res.status(401).json({ error: 'Không có mã thông báo' });
    }
  
    try {
      const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
  
      if (decodedToken.exp < Date.now() / 1000) {
        // Mã thông báo đã hết hạn
        return res.status(401).json({ error: 'Mã thông báo đã hết hạn' });
      }
  
      // Mã thông báo hợp lệ, đi tiếp
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Lỗi xác minh mã thông báo' });
    }
  }

  