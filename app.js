const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();
// Bỏ Sequelize, không require model/index, model/expense nữa

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Mount routers
app.use('/', require('./routes/view'));
app.use('/api/expenses', require('./routes/api/expense'));
app.use('/api/auth', require('./routes/api/auth'));

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});