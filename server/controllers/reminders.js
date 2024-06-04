const { pool } = require('../config');

const get = async (req, res) => {
    const user_id = req.session.user;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Устанавливаем время на начало текущего дня

    try {
        const connection = await pool.getConnection();
        const [results] = await connection.query(
            'SELECT * FROM reminders WHERE user_id = ? AND reminder_date = ?',
            [user_id, today]
        );
        connection.release();
        res.status(200).json(results);
    } catch (error) {
        console.error('Ошибка выполнения запроса:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
}

const post = async (req, res) => {
    const { date, text } = req.body;
    const user_id = req.session.user;

    if (!user_id || !date || !text) {
        return res.status(400).json({ error: 'Необходимо заполнить все поля' });
    }

    try {
        const connection = await pool.getConnection();
        const result = await connection.query('INSERT INTO reminders (user_id, reminder_date, reminder_text ) VALUES (?, ?, ?)', [user_id, date, text]);
        connection.release();
        res.status(201).json({ message: 'Напоминание успешно добавлено' });
    } catch (error) {
        console.error('Ошибка выполнения запроса:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
}

module.exports = {
    get,
    post,
}