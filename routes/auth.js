const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Форма регистрации
router.get("/login", (req, res) => {
    res.render("login");
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.send("Пользователь не найден");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.send("Неверный пароль");
        }

        const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.send(`Токен: ${token}`);
    } catch (error) {
        res.status(500).send("Ошибка сервера");
    }
});

router.get("/register", (req, res) => {
    res.render("register");
});

// Обработка регистрации
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.send("Пользователь с таким email уже существует.");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: role || "user",
        });

        await newUser.save();

        res.redirect("/login");
    } catch (error) {
        res.status(500).send("Ошибка сервера");
    }
});

module.exports = router;
