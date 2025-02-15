const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ message: 'Нет токена, авторизация запрещена' });
    }

    try {
        const token = authHeader.split(' ')[1]; 
        if (!token) {
            return res.status(401).json({ message: 'Формат токена неверный' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(400).json({ message: 'Неверный токен' });
    }
};


