// multerConfig.js
const multer = require('multer');

// Hàm tạo middleware Multer với đường dẫn đích được truyền vào
const createMulterMiddleware = (destination) => {
  const storage = multer.diskStorage({
    destination: destination,
    filename: (req, file, cb) => {
      cb(
        null,
        file.fieldname + '_' + Date.now() + file.originalname.match(/\..*$/)[0]
      );
    },
  });

  return multer({
    storage: storage,
    limits: { fieldSize: 25 * 1024 * 1024 },
  });
};

module.exports = createMulterMiddleware;