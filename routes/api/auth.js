const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const prisma = require('../../database/prismaClient');
const SECRET = process.env.SECRET || 'expense_secret_key';

// Đăng nhập
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(401).json({ error: 'Sai tài khoản hoặc mật khẩu' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Sai tài khoản hoặc mật khẩu' });
    const token = jwt.sign({ username: user.username, role: user.role }, SECRET, { expiresIn: '2h' });
    res.json({ token });
  } catch (err) {
    console.error('Lỗi đăng nhập:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Đăng ký tài khoản mới
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  
  // Validation
  if (!username || !password) {
    return res.status(400).json({ error: 'Username và password là bắt buộc' });
  }
  
  if (username.length < 4) {
    return res.status(400).json({ error: 'Username phải có ít nhất 4 ký tự' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password phải có ít nhất 6 ký tự' });
  }
  
  try {
    // Kiểm tra username đã tồn tại chưa
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: 'Username đã tồn tại' });
    }
    
    // Mã hóa password trước khi lưu
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Tạo user mới với role 'user'
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: 'user'
      }
    });
    
    // Tạo token cho người dùng mới đăng ký
    const token = jwt.sign({ username: user.username, role: user.role }, SECRET, { expiresIn: '2h' });
    
    res.status(201).json({ 
      message: 'Đăng ký thành công', 
      token 
    });
  } catch (err) {
    console.error('Lỗi đăng ký:', err);
    res.status(500).json({ error: 'Lỗi server khi đăng ký' });
  }
});

module.exports = router;
