const { initApp } = require('./config');
const { initControllers } = require('./controllers/init');

let app = initApp();
initControllers(app);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});