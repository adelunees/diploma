const { pool } = require('../config');

const get = async (req, res) => {
    const user_id = req.session.user;
    try {
        const connection = await pool.getConnection();
        const [results] = await connection.query('SELECT * FROM habits WHERE user_id = ?', [user_id]);
        connection.release();
        res.status(200).json(results);
    } catch (error) {
        console.error('Ошибка выполнения запроса:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
}

const post = async (req, res) => {
    const { habit_name, days_count, start_day } = req.body;
    const user_id  = req.session.user;

    // Проверка наличия всех обязательных полей
    if (!habit_name || !user_id || !days_count || !start_day) {
        return res.status(400).json({ error: 'Необходимо заполнить все поля' });
    }

    if (days_count<1){
        return res.status(400).json({ error: 'Введите корректное число дней' });
    }

    try {
        // Выполнение запроса к базе данных для добавления новой привычки
        const connection = await pool.getConnection();
        const result = await connection.query('INSERT INTO habits (habit_name, user_id, weeks_count, start_date) VALUES (?, ?, ?, ?)', [habit_name, user_id, days_count, start_day]);
        connection.release();
        res.status(201).json({ message: 'Привычка успешно добавлена' });
    } catch (error) {
        console.error('Ошибка выполнения запроса:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
}

const delete_ = async (req, res) => {
    const { habit_id } = req.body;

    try {
        const connection = await pool.getConnection();
        await connection.query('DELETE FROM habits WHERE habit_id = ?', [habit_id]);
        connection.release();
        res.status(204).end();
    } catch (error) {
        console.error('Ошибка выполнения запроса:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
}

module.exports = {
    get,
    post,
    delete_,
}