const multer = require('multer');
const upload = multer();
const auth = require('./auth');
const projects = require('./projects');
const tasks = require('./tasks');
const habits = require('./habits');
const reminders = require('./reminders');

function initControllers(app) {
    app.post('/api/login', auth.login);
    app.post('/api/register', auth.register);
    app.post('/api/logout', auth.logout);
    app.get('/api/user', auth.get);
    app.put('/api/user', upload.none(), auth.put);
    app.get('/api/projects', projects.get);
    app.post('/api/projects', projects.post);
    app.delete('/api/projects', projects.delete_);
    app.post('/api/projects/assign', projects.assign);
    app.get('/api/tasks', tasks.get);
    app.post('/api/tasks', tasks.post);
    app.put('/api/tasks',upload.none(), tasks.put);
    app.delete('/api/tasks', tasks.delete_);
    app.get('/api/tasks/my', tasks.getMy);
    app.post('/api/tasks/assign', tasks.assign);
    app.get('/api/habits', habits.get);
    app.post('/api/habits', habits.post);
    app.delete('/api/habits', habits.delete_);
    app.get('/api/reminders', reminders.get);
    app.post('/api/reminders', reminders.post);
}

module.exports = {
    initControllers,
}