const express = require('express');
const Task = require('../models/Task');
const router = express.Router();
const authMiddleware = require('../middleware/auth'); // Проверка JWT

// Получение всех задач с фильтрацией и пагинацией
router.get('/', authMiddleware, async (req, res) => {
    const { status, search, page = 1, limit = 5 } = req.query;
    const filter = { userId: req.user._id };

    if (status) filter.status = status;
    if (search) filter.title = new RegExp(search, 'i');

    const tasks = await Task.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await Task.countDocuments(filter);
    
    res.render('index', { tasks, total, page: Number(page), limit: Number(limit) });
});

// Страница редактирования задачи
router.get('/edit/:id', authMiddleware, async (req, res) => {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).send('Задача не найдена');
    res.render('editTask', { task });
});

// Обновление задачи
router.post('/update/:id', authMiddleware, async (req, res) => {
    await Task.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/');
});

// Удаление задачи
router.post('/delete/:id', authMiddleware, async (req, res) => {
    await Task.findByIdAndDelete(req.params.id);
    res.redirect('/');
});

module.exports = router;
