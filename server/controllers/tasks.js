const { pool } = require('../config');

const get = async (req, res) => {
    const user_id  = req.session.user;

    const connection = await pool.getConnection();

    try {
        const [owned_prjs] = await connection.query('SELECT project_id FROM projects WHERE owner_id = ?', [user_id]);
        const [projects_ids] = await connection.query('SELECT project_id FROM project_members WHERE user_id = ?', [user_id]);
        const projects = [...owned_prjs, ...projects_ids].map(project => project.project_id).join(',');
        if (projects.length === 0) {
            return res.status(200).json([]);
        }
        const [results] = await connection.query(`SELECT * FROM tasks WHERE project_id IN (${projects})`);
        for (let task of results) {
            const owner_id = task.owner_id;
            delete task.owner_id;
            const [owner] = await connection.query(`SELECT user_id, email FROM users WHERE user_id = ${owner_id}`);
            task.owner = owner[0];
            let [member_id] = await connection.query('SELECT user_id FROM task_members WHERE task_id = ?', [task.task_id]);
            if (member_id.length !== 0) {
                member_id = member_id[0].user_id;
                const [user] = await connection.query('SELECT user_id, email FROM users WHERE user_id = ?', [member_id]);
                task.assignee = user[0];
            }
            else {
                task.assignee = {};
            }
        }
        connection.release();

        res.status(200).json(results);
    } catch (error) {
        console.error('Ошибка выполнения запроса:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
}

const post = async (req, res) => {
    let { project_id, task_name, due_date, priority, status, user_id } = req.body;
    const owner_id  = req.session.user;

    if (!task_name || !due_date || !priority || !status) {
        return res.status(400).json({ error: 'Необходимо заполнить все поля' });
    }
    if (user_id == 0) {
        user_id = owner_id;
    }

    try {
        const connection = await pool.getConnection();
        const [result] = await connection.query('INSERT INTO tasks (project_id, task_name, due_date, priority, status, owner_id) VALUES (?, ?, ?, ?, ?, ?)', [project_id, task_name, due_date, priority, status, owner_id]);
        await connection.query(`INSERT INTO task_members (task_id, user_id) VALUES (${result.insertId}, ${user_id})`);
        connection.release();
        res.status(201).json({ message: 'Задача успешно добавлена' });
    } catch (error) {
        console.error('Ошибка выполнения запроса:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
}

const put = async (req, res) => {
    const { task_name, due_date, priority, status, task_id } = req.body;
    const user_id = req.session.user;

    try {
        const connection = await pool.getConnection();
        // Проверяем, принадлежит ли задача текущему пользователю
        const [task] = await connection.query('SELECT * FROM tasks WHERE task_id = ? AND owner_id = ?', [task_id, user_id]);
        if (!task) {
            connection.release();
            return res.status(403).json({ error: 'У вас нет прав на редактирование этой задачи' });
        }
        // Обновляем задачу
        await connection.query('UPDATE tasks SET task_name = ?, due_date = ?, priority = ?, status = ? WHERE task_id = ?', [task_name, due_date, priority, status, task_id]);
        connection.release();
        res.status(200).json({ message: 'Задача успешно обновлена' });
    } catch (error) {
        console.error('Ошибка выполнения запроса:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
}

const delete_ = async (req, res) => {
    const { task_id } = req.body;

    try {
        const connection = await pool.getConnection();
        await connection.query('DELETE FROM tasks WHERE task_id = ?', [task_id]);
        connection.release();

        res.status(204).end();
    } catch (error) {
        console.error('Ошибка выполнения запроса:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
}

const getMy = async (req, res) => {
    const user_id  = req.session.user;

    try {
        const connection = await pool.getConnection();
        const [task_ids] = await connection.query('SELECT task_id FROM task_members WHERE user_id = ?', [user_id]);
        const tasks = task_ids.map(task => task.task_id).join(',');
        if (task_ids.length === 0) {
            connection.release();
            return res.status(200).json([]);
        }
        const [results] = await connection.query(`SELECT * FROM tasks WHERE task_id IN (${tasks})`);
        for (let task of results) {
            const project_id = task.project_id;
            delete task.project_id;
            const [project] = await connection.query('SELECT project_id, project_name FROM projects WHERE project_id = ?', [project_id]);
            task.project = project[0];
        }
        connection.release();
        res.status(200).json(results);
    } catch (error) {
        console.error('Ошибка выполнения запроса:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
}

const assign = async (req, res) => {
    const owner_id = req.session.user;
    const { task_id, user_id } = req.body;

    const connection = await pool.getConnection();
    const [task] = await connection.query(`SELECT * FROM tasks WHERE owner_id = ?, task_id = ?`, [owner_id, task_id]);
    if (task.length === 0) {
        return res.status(403).json({ message: `User ${owner_id} is not an owner of task ${task_id}` });
    }
    const [task_member] = await connection.query('SELECT * FROM task_members WHERE task_id = ? AND user_id = ?', [task_id, user_id]);
    if (task_member.length === 0) {
        await connection.query('INSERT INTO task_members (task_id, user_id) VALUES (?, ?)', [task_id, user_id]);
    }
    return res.status(201).json({ message: 'Assignee added to task' });
}

module.exports = {
    get,
    post,
    put,
    delete_,
    getMy,
    assign,
}