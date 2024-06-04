import React, { useState, useEffect, } from 'react';
import {useParams} from "react-router-dom";
import axios from 'axios';
import Sidebar from "../components/SideBar";

function ProfileSettings() {
    const {user_id} = useParams();
    const [password, setPassword] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [message, setMessage] = useState('');
    const [username, setUsername] = useState('');

    useEffect(() => {
        fetchUser();
    }, []);

    //ПОЛУЧЕНИЕ ИМЕНИ ПОЛЬЗОВАТЕЛЯ
    const fetchUser = async () => {

        try {
            const response = await axios.get(`http://localhost:4000/api/user`, {withCredentials: true});
            setUsername(response.data.username);
        } catch (error) {
            console.error('Ошибка получения имени пользователя:', error);
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('password', password);
            formData.append('username', newUsername);
            formData.append('email', newEmail);
            const response = await axios.put('http://localhost:4000/api/user', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            },
                {withCredentials: true});
            if (response.data.success) {
                setMessage('Данные профиля успешно обновлены');
            }
        } catch (error) {
            console.error('Ошибка при обновлении профиля:', error);
            setMessage('Ошибка при обновлении профиля');
        }
    };

    return (
        <div className="dashboard-container">
            <Sidebar user_id={user_id} />
            <div className="main-content-settings">
                <h2>Настройки профиля</h2>
                <div className="form_tek">
                    <form onSubmit={handleSubmit}>
                        <label className="name_tek">
                            Текущее имя пользователя: {username}
                        </label>
                        <ul className="newForm">
                            Новое имя пользователя:
                            <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
                        </ul>
                        <ul className="newForm">
                            Новый пароль:
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </ul>
                        <ul className="newForm">
                            Повторите пароль:
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </ul>
                        <ul className="newForm">
                            Новая почта:
                            <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                        </ul>
                        <button className="task_button" type="submit" onClick={handleSubmit}>
                            Сохранить
                        </button>
                    </form>
                </div>
                <p>{message}</p>
            </div>
        </div>
    );
}

export default ProfileSettings;
