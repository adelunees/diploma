const { pool } = require('../config');

const get = async (req, res) => {
    const user_id  = req.session.user;
    try {
        const connection = await pool.getConnection();
        const [owned_prjs] = await connection.query('SELECT * FROM projects WHERE owner_id = ?', [user_id]);
        const [projects_arr] = await connection.query('SELECT project_id FROM project_members WHERE user_id = ?', [user_id]);
        let projects = [];
        if (projects_arr.length !== 0) {
            const project_ids = projects_arr.map(project => project.project_id).join(',');
            [projects] = await connection.query(`SELECT * FROM projects WHERE project_id IN (${project_ids})`);
        }
        const results = [...owned_prjs, ...projects];
        for (let project of results) {
            const project_id = project.project_id;
            const owner_id = project.owner_id;
            delete project.owner_id;
            const [owner] = await connection.query(`SELECT user_id, email FROM users WHERE user_id = ${owner_id}`);
            const [member_ids] = await connection.query('SELECT user_id FROM project_members WHERE project_id = ?', [project_id]);
            if (member_ids.length !== 0) {
                const user_ids = member_ids.map(member => member.user_id).join(',');
                const [users] = await connection.query(`SELECT user_id, email FROM users WHERE user_id IN (${user_ids})`);
                project.members = users;
            }
            else {
                project.members = [];
            }
            project.owner = owner[0];
        }
        connection.release();
        res.status(200).json(results);
    } catch (error) {
        console.error('Ошибка выполнения запроса:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
}

const post = async (req, res) => {
    const { project_name, description } = req.body;
    const owner_id = req.session.user;

    if (!project_name || !description || !owner_id) {
        return res.status(400).json({ error: 'Необходимо заполнить все поля' });
    }

    try {
        const connection = await pool.getConnection();
        const result = await connection.query(
            'INSERT INTO projects (project_name, description, owner_id) ' +
            'VALUES (?, ?, ?)', [project_name, description, owner_id]
        );
        connection.release();

        res.status(201).json({ message: 'Проект успешно создан' });
    } catch (error) {
        console.error('Ошибка выполнения запроса:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
}

const delete_ = async (req, res) => {
    const { project_id } = req.body;
    try {
        const connection = await pool.getConnection();
        await connection.query('DELETE FROM projects WHERE project_id = ?', [project_id]);
        connection.release();

        res.status(204).end();
    } catch (error) {
        console.error('Ошибка выполнения запроса:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
}

const assign = async (req, res) => {
    const owner_id = req.session.user;
    const { project_id, email } = req.body;

    const connection = await pool.getConnection();
    const [project] = await connection.query(`SELECT * FROM projects WHERE owner_id = ? and project_id = ?`, [owner_id, project_id]);
    if (project.length === 0) {
        return res.status(403).json({ message: `User ${owner_id} is not an owner of project ${project_id}` });
    }
    const [user] = await connection.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (user.length === 0) {
        return res.status(404).json({ message: `User with email ${email} not found` });
    }
    const user_id = user[0].user_id;
    const [project_member] = await connection.query('SELECT * FROM project_members WHERE project_id = ? AND user_id = ?', [project_id, user_id]);
    let result = {};
    if (project_member.length === 0) {
        await connection.query('INSERT INTO project_members (project_id, user_id) VALUES (?, ?)', [project_id, user_id]);
        result = {email: email, user_id: user_id};
    }
    return res.status(201).json(result);
}

module.exports = {
    get,
    post,
    delete_,
    assign,
}