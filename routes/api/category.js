const express = require('express');
const router = express.Router();
const { 
  getAllCategories, 
  getCategoryById, 
  addCategory, 
  updateCategory, 
  deleteCategory,
  createDefaultCategories 
} = require('../../services/categoryService');

// Middleware xác thực JWT (dùng lại từ app.js)
const jwt = require('jsonwebtoken');
const SECRET = process.env.SECRET || 'expense_secret_key';

function authMiddleware(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth) return res.status(401).json({ error: 'Chưa đăng nhập' });
  const token = auth.split(' ')[1];
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(401).json({ error: 'Token không hợp lệ' });
    req.user = user;
    next();
  });
}

// Validation middleware
function validateCategory(req, res, next) {
  const { name, color, icon } = req.body;
  const errors = {};
  
  if (!name) {
    errors.name = 'Tên danh mục không được để trống';
  } else if (name.length < 2) {
    errors.name = 'Tên danh mục phải có ít nhất 2 ký tự';
  } else if (name.length > 30) {
    errors.name = 'Tên danh mục không được quá 30 ký tự';
  }
  
  if (color && !/^#([0-9A-F]{3}){1,2}$/i.test(color)) {
    errors.color = 'Mã màu không hợp lệ. Ví dụ: #FF5500';
  }
  
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }
  
  next();
}

// GET /api/categories - Lấy tất cả danh mục
router.get('/', authMiddleware, async (req, res) => {
  try {
    const categories = await getAllCategories(req.user.username);
    res.json(categories);
  } catch (err) {
    console.error('Lỗi khi lấy danh mục:', err);
    res.status(500).json({ error: 'Lỗi lấy dữ liệu từ database', details: err.message });
  }
});

// GET /api/categories/:id - Lấy chi tiết một danh mục
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const category = await getCategoryById(req.params.id, req.user.username);
    res.json(category);
  } catch (err) {
    console.error('Lỗi khi lấy chi tiết danh mục:', err);
    if (err.message.includes('không tồn tại')) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Lỗi lấy dữ liệu từ database', details: err.message });
  }
});

// POST /api/categories - Thêm danh mục mới
router.post('/', [authMiddleware, validateCategory], async (req, res) => {
  const { name, color, icon } = req.body;
  
  try {
    const newCategory = await addCategory({ 
      name, 
      color, 
      icon, 
      username: req.user.username 
    });
    res.status(201).json({ success: true, category: newCategory });
  } catch (err) {
    console.error('Lỗi khi thêm danh mục:', err);
    if (err.message.includes('đã tồn tại')) {
      return res.status(409).json({ error: err.message });
    }
    res.status(500).json({ error: 'Lỗi lưu dữ liệu vào database', details: err.message });
  }
});

// PUT /api/categories/:id - Cập nhật danh mục
router.put('/:id', [authMiddleware, validateCategory], async (req, res) => {
  const { id } = req.params;
  const { name, color, icon } = req.body;
  
  try {
    const updatedCategory = await updateCategory(
      id, 
      { name, color, icon }, 
      req.user.username
    );
    res.json({ success: true, category: updatedCategory });
  } catch (err) {
    console.error('Lỗi khi cập nhật danh mục:', err);
    if (err.message.includes('không tồn tại')) {
      return res.status(404).json({ error: err.message });
    }
    if (err.message.includes('đã tồn tại')) {
      return res.status(409).json({ error: err.message });
    }
    res.status(500).json({ error: 'Lỗi cập nhật danh mục', details: err.message });
  }
});

// DELETE /api/categories/:id - Xóa danh mục
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  
  try {
    await deleteCategory(id, req.user.username);
    res.json({ success: true, message: 'Đã xóa danh mục thành công' });
  } catch (err) {
    console.error('Lỗi khi xóa danh mục:', err);
    if (err.message.includes('không tồn tại')) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Lỗi xóa danh mục', details: err.message });
  }
});

// POST /api/categories/default - Tạo các danh mục mặc định
router.post('/default', authMiddleware, async (req, res) => {
  try {
    const categories = await createDefaultCategories(req.user.username);
    res.status(201).json({ success: true, categories });
  } catch (err) {
    console.error('Lỗi khi tạo danh mục mặc định:', err);
    res.status(500).json({ error: 'Lỗi tạo danh mục mặc định', details: err.message });
  }
});

module.exports = router;
