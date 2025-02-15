require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const taskRoutes = require('./routes/tasks');
app.use('/tasks', taskRoutes);
const app = express();
const PORT = process.env.PORT || 5003;

// Подключение к MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ MongoDB подключена'))
    .catch(err => console.log('Ошибка подключения:', err));

app.listen(PORT, () => console.log(`🚀 Сервер запущен на http://localhost:${PORT}`));
