import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ user_id }) => {
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const response = await axios.get(`http://localhost:4000/api/user`, { withCredentials: true });
            setUsername(response.data.username);
        } catch (error) {
            navigate(`/`);
            console.error('Ошибка получения имени пользователя:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:4000/api/logout', {}, { withCredentials: true });
            navigate("/");
        } catch (error) {
            console.error('Ошибка при выходе из сеанса:', error);
        }
    };

    return (
        <div className="sidebar">
            <div className="side_div">
                <h1 id="header">
                    Личный кабинет
                </h1>
                <FontAwesomeIcon className="icon-log" icon={faUser} />
            </div>
            <p id="welcome">Привет, {username}!</p>
            <div id="links" className="navigation">
                <NavLink to={`/dashboard`} className="navlink">Мои проекты</NavLink>
                <NavLink to={`/mytasks`} className="navlink">Мои задачи</NavLink>
                <NavLink to={`/reminder`} className="navlink">Напоминания</NavLink>
                <NavLink to={`/tracker`} className="navlink">Трекер привычек</NavLink>
                <NavLink to={`/person`} className="navlink">Настройки</NavLink>
            </div>
            <button className="logout_button" onClick={handleLogout}>Выход</button>
        </div>
    );
};

export default Sidebar;
