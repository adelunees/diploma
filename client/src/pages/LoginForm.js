import React, { useState } from 'react';
import axios from "axios";
import { useNavigate, useParams } from 'react-router-dom';
import "../styles/LoginForm.css";
import logo from "../img/icon2.jpg"; // Импортируем логотип

function LoginForm() {
    const navigate = useNavigate();
    const { user_id } = useParams();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [showLoginForm, setShowLoginForm] = useState(true);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (showLoginForm) {
            try {
                const response = await axios.post('http://localhost:4000/api/login', {
                    email,
                    password
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true,
                });
                console.log('Успешный вход:', response.data);
                navigate(`/dashboard`);
            } catch (error) {
                console.error('Ошибка входа:', error.response.data);
                setError('Неверный email или пароль.');
                setEmail('');
                setPassword('');
            }
        } else {
            if (password !== confirmPassword) {
                setError('Пароль и подтверждение пароля не совпадают.');
                return;
            }

            try {
                const response = await axios.post('http://localhost:4000/api/register', {
                    username,
                    email,
                    password
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                console.log('Пользователь успешно зарегистрирован:', response.data.message);
                setShowLoginForm(true);
            } catch (error) {
                console.error('Ошибка регистрации:', error.response.data.error);
                setError('Ошибка при регистрации.');
                setUsername('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
            }
        }
    };

    const handleToggleForm = () => {
        setShowLoginForm(!showLoginForm);
        setError('');
    };

    const formTitle = showLoginForm ? 'Войти' : 'Зарегистрироваться';
    const buttonText = showLoginForm ? 'Регистрация' : 'Вход';

    return (
        <div className="container">
            <div className="sticker">
                <div className="app-title">
                    EASY TASK
                    <img src={logo} alt="logo" />
                </div>
                <h3>Добро пожаловать!</h3>
                <p>Присоединяйтесь к планированию проектов и задач</p>
            </div>
            <div className="form-container">
                <form onSubmit={handleSubmit} className="form">
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    <h2>{formTitle}</h2>
                    {!showLoginForm && (
                        <div>
                            <label>Имя пользователя:</label>
                            <input
                                type="text"
                                placeholder="Введите имя пользователя.."
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="input"
                            />
                        </div>
                    )}
                    <label>Email:</label>
                    <input
                        type="email"
                        placeholder="Введите email.."
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="input"
                    />
                    <label>Пароль:</label>
                    <input
                        type="password"
                        placeholder="Введите пароль.."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="input"
                    />
                    {!showLoginForm && (
                        <div>
                            <label>Подтвердите пароль:</label>
                            <input
                                type="password"
                                placeholder="Подтвердите пароль.."
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="input"
                            />
                        </div>
                    )}
                    <button type="submit" className="button">{formTitle}</button>
                    <button type="button" className="button" onClick={handleToggleForm}>{buttonText}</button>
                </form>
            </div>
        </div>
    );
}

export default LoginForm;
