const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql2 = require('mysql2/promise');
const sessions = require('client-sessions');
require('dotenv').config();

function initApp() {
    const app = express();
    app.use(bodyParser.json());
    app.use(express.urlencoded( {extended: true }));
    app.use(cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    }));
    app.use(sessions({
        cookieName: 'session',
        secret: process.env.SESSION_SECRET,
        duration: 24 * 60 * 60 * 1000,
        activeDuration: 1000 * 60 * 5,
        cookie: {
            httpOnly: true,
            secure: false
        }
    }));
    return app;
}

const pwd_secret = process.env.PWD_SECRET;

const pool = mysql2.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

module.exports = {
    initApp,
    pool,
    pwd_secret,
};
