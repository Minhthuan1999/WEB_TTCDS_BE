// utils/fileHelper.js
const fs = require("fs");
const path = require("path");
const uploads = path.join(__dirname, "uploads");

const fileURL = (name) => (name ? `/uploads/${name}` : null);
const UPLOAD_PUB_DIR = path.join(process.cwd(), "uploads");

// Xoá file an toàn, không lỗi nếu không tồn tại
async function removeFileIfExists(filename) {
  if (!filename) return;

  // chỉ lấy tên file, tránh prefix thư mục
  const clean = path.basename(filename);
  const filePath = path.join(UPLOAD_PUB_DIR, clean);

  try {
    await fs.promises.unlink(filePath);
  } catch (err) {
    if (err.code !== "ENOENT") {
      console.error("Lỗi xoá file:", err);
    }
  }
}

module.exports = { fileURL, UPLOAD_PUB_DIR, uploads,  removeFileIfExists };

