// routes/PublicationRoute.js
const express = require('express');
const PublicationController = require('../controllers/PublicationController');
const createMulterMiddleware = require('../middleware/multerConfig');

const router = express.Router();
const upload = createMulterMiddleware('uploads');

// ===== SERIES =====
router.get('/series', PublicationController.listSeries);
router.get('/series/:id', PublicationController.viewSeries);
router.post('/series/create', upload.fields([{ name: 'image', maxCount: 1 }]), PublicationController.createSeries);
router.put('/series/update/:id', upload.fields([{ name: 'image', maxCount: 1 }]), PublicationController.updateSeries);
router.delete('/series/delete/:id', PublicationController.deleteSeries);

// ===== ISSUES =====
router.get('/pub/list', PublicationController.listIssues);
router.get('/pub/viewById/:id', PublicationController.viewIssue);
router.post('/pub/create',
  upload.fields([{ name: 'image', maxCount: 1 }, { name: 'file', maxCount: 1 }]),
  PublicationController.createIssue);
router.put('/pub/update/:id',
  upload.fields([{ name: 'image', maxCount: 1 }, { name: 'file', maxCount: 1 }]),
  PublicationController.updateIssue);


  router.get("/pub/admin/list", PublicationController.getIssuesAdmin); // LẤY TOÀN BỘ ẤN PHẨM (ADMIN)

// Trang “SỐ MỚI NHẤT”
router.get('/pub/latest', PublicationController.latestIssue);

// Các số trước (đầy đủ, có outline cho từng kỳ)
router.get('/pub/previous/full', PublicationController.previousIssuesFull);
// XÓA SỐ ẤN PHẨM
router.delete('/pub/delete/:id', PublicationController.deleteIssue);

// lấy tất cả ấn phẩm của 1 user
router.get('/pub/user/:userID', PublicationController.getIssuesByUser);

// ===== ARTICLES =====
router.get('/pub/:pub_id/articles', PublicationController.getArticlesByIssue); // Lấy danh sách bài/“phần” thuộc 1 kỳ ấn phẩm
router.get('/pub/article/:id', PublicationController.getArticleById); // Lấy chi tiết 1 bài.
router.get('/pub/getByCategory/:pc_id', PublicationController.getByCategory); // Lấy bài theo chuyên mục.
router.get('/pub/search', PublicationController.search); // Tìm kiếm bài trong toàn hệ thống
router.post('/pub/article/create',

  upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio', maxCount: 1 }]),
  PublicationController.createArticle);

router.put('/pub/article/update/:id',
  upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio', maxCount: 1 }]),
  PublicationController.updateArticle);

router.get('/pub/issue/:id/admin', PublicationController.getAllByIssueAdmin);

// LẤY TOÀN BỘ BÀI DO USER TẠO
router.get('/pub/articles/user/:id', PublicationController.getByUserCreate);

router.delete('/pub/article/delete/:id', PublicationController.deleteArticle);
//   // ===== CATEGORIES =====
// router.get('/pub/categories', PublicationController.listCategories);           // ?series_id=...
// router.get('/pub/categories/:id', PublicationController.getCategory);
// router.post('/pub/categories/create', PublicationController.createCategory);
// router.put('/pub/categories/update/:id', PublicationController.updateCategory);
// router.delete('/pub/categories/delete/:id', PublicationController.deleteCategory);

// ===== CATEGORIES ===== đã bỏ pub_id
router.get('/pub/categories', PublicationController.listCategories);
router.get('/pub/categories/:id', PublicationController.getCategory);
router.post('/pub/categories/create', PublicationController.createCategory);
router.put('/pub/categories/update/:id', PublicationController.updateCategory);
router.delete('/pub/categories/delete/:id', PublicationController.deleteCategory);

// Tú yêu cầu bài ấn phẩm
// TẠO BÀI/PHẦN THEO pub_id TRÊN URL (KHÔNG CẦN pub_id TRONG BODY)
router.post(
  '/pub/:pub_id/article/create',
  upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio', maxCount: 1 }]),
  PublicationController.createArticleByPub // <-- tên mới, không đụng createArticle cũ
);

// CẬP NHẬT BÀI/PHẦN THEO pub_id + article_id
router.put(
  '/pub/:pub_id/article/update/:article_id',
  upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio', maxCount: 1 }]),
  PublicationController.updateArticleByPub // <-- tên mới
);

// XOÁ BÀI/PHẦN THEO pub_id + article_id
router.delete(
  '/pub/:pub_id/article/delete/:article_id',
  PublicationController.deleteArticleByPub // <-- tên mới
);

// routers/publicationRouter.js
router.get(
  "/pub/:pub_id/articles/:article_id",
  PublicationController.getArticleByPubAndId
);

// routers/publicationRouter.js
router.get(
  "/pub/:pub_id/getByCategory/:pc_id",
  PublicationController.getByCategoryByPub
);

module.exports = router;
