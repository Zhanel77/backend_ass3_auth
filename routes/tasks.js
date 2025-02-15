const express = require("express");
const { ObjectId } = require("mongoose").Types;
const Task = require("../models/Task");
const authMiddleware = require("../middleware/auth");
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Получить все задачи + поиск, фильтрация, сортировка
router.get("/", authMiddleware, async (req, res) => {
    try {
        const { status, search, sort, success } = req.query;

        let query = {};
        if (req.user.role !== 'admin') {
            query.userId = req.user._id;
        }
        if (status) query.status = status;
        if (search) query.title = new RegExp(search, 'i');

        const tasks = await Task.find(query).sort(sort === 'desc' ? { createdAt: -1 } : { createdAt: 1 });

        // Если запрос из Postman/API, вернуть JSON
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            res.json(tasks);
        } else {
            res.render('index', { tasks, page: 1, limit: 10, success });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

// Создать задачу
router.post(
    "/",
    authMiddleware,
    [
        body("title").notEmpty().withMessage("Название обязательно"),
        body("description").optional().trim().escape()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render("newTask", {
                errors: errors.array(),
                csrfToken: req.csrfToken()
            });
        }

        try {
            const { title, description } = req.body;
            const newTask = new Task({
                title,
                description,
                userId: req.user._id
            });
            await newTask.save();
            res.redirect("/tasks?success=Задача успешно добавлена");
        } catch (error) {
            res.status(500).render("newTask", {
                errors: [{ msg: "Ошибка сервера" }],
                csrfToken: req.csrfToken()
            });
        }
    }
);

// Удалить задачу
router.post("/delete/:id", authMiddleware, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).send("Задача не найдена");
        }

        if (task.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).send("Нет доступа");
        }

        await Task.findByIdAndDelete(req.params.id);
        res.redirect("/tasks?success=Задача удалена");
    } catch (error) {
        res.status(500).send("Ошибка удаления задачи");
    }
});

module.exports = router;
