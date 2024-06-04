const crypto = require('crypto');
const { pool, pwd_secret } = require('../config');

function hashPassword(password) {
    const hmac = crypto.createHmac('sha256', pwd_secret);
    hmac.update(password);
    return hmac.digest('hex');
}

const login = async (req, res) => {
    let { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Отсутствуют email или пароль' });
    }
    password = hashPassword(password);

    try {
        const connection = await pool.getConnection();
        const [results] = await connection.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
        connection.release();

        if (results.length === 0) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }
        req.session.user = results[0].user_id;
        res.status(200).json({ message: 'Успешный вход', user_id: req.session.user }); // Возврат userId вместе с сообщением
    } catch (error) {
        console.error('Ошибка выполнения запроса:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
}

const register = async (req, res) => {
    let { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Необходимо заполнить все поля' });
    }
    password = hashPassword(password);

    try {
        const connection = await pool.getConnection();
        const result = await connection.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, password]);
        connection.release();
        res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });
    } catch (error) {
        console.error('Ошибка выполнения запроса:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
}

const logout = (req, res) => {
    req.session.destroy();
    res.clearCookie('session');
    res.status(200).json({ message: 'Выход из сеанса выполнен успешно' });
}

const get = async (req, res) => {
    const user_id = req.session.user;

    try {
        const connection = await pool.getConnection();
        const [results] = await connection.query('SELECT * FROM users WHERE user_id = ?', [user_id]);
        connection.release();

        if (results.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        const username = results[0].username;
        res.status(200).json({ username });
    } catch (error) {
        console.error('Ошибка выполнения запроса:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
}

const put = async (req, res) => {
    let { password, username, email } = req.body;
    const user_id = req.session.user;
    password = hashPassword(password);

    try {
        const connection = await pool.getConnection();
        let query = 'UPDATE users SET ';
        const values = [];

        // Добавляем обновления в запрос в зависимости от того, какие поля были изменены
        if (password) {
            query += 'password = ?, ';
            values.push(password);
        }
        if (username) {
            query += 'username = ?, ';
            values.push(username);
        }
        if (email) {
            query += 'email = ?, ';
            values.push(email);
        }
        if (req.file) {
            query += 'photo = ?, ';
            values.push(req.file.path);
        }

        // Убираем лишние запятые в конце запроса
        query = query.slice(0, -2);

        // Добавляем условие по идентификатору пользователя
        query += ' WHERE user_id = ?';
        values.push(user_id);

        // Выполняем запрос с использованием подготовленных данных
        await connection.query(query, values);
        connection.release();

        // Отправляем ответ об успешном обновлении профиля
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Ошибка при обновлении профиля:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
}

module.exports = {
    login,
    register,
    logout,
    get,
    put,
}