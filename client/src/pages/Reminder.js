import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Sidebar from '../components/SideBar';
import '../styles/Reminder.css';

function Reminder() {
    const { user_id } = useParams();
    const [reminderDate, setReminderDate] = useState('');
    const [reminderText, setReminderText] = useState('');
    const [reminders, setReminders] = useState([]);
    const [notification, setNotification] = useState('');

    useEffect(() => {
        fetchReminders();
    }, [user_id]);

    const fetchReminders = async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/reminders', { withCredentials: true });
            console.log("Received reminders:", response.data);
            setReminders(response.data);
        } catch (error) {
            console.error('Ошибка получения напоминаний:', error);
        }
    };

    const createReminder = async () => {
        try {
            await axios.post('http://localhost:4000/api/reminders', {
                date: reminderDate,
                text: reminderText
            }, { withCredentials: true });
            setNotification('Напоминание успешно добавлено!');
            fetchReminders();
        } catch (error) {
            console.error('Ошибка при добавлении напоминания:', error);
            setNotification('Ошибка при добавлении напоминания. Пожалуйста, попробуйте еще раз.');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        await createReminder();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('ru-RU', options);
    };

    const filterRemindersForToday = (reminders) => {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD формат
        return reminders.filter(reminder => reminder.reminder_date === today);
    };

    return (
        <div className="dashboard-container">
            <Sidebar user_id={user_id} />
            <div className="main-content reminder-container">
                <h2>Поставьте себе напоминания!</h2>
                <form onSubmit={handleSubmit} className="reminder-form">
                    <label className="form-label">
                        Дата напоминания:
                        <input
                            type="date"
                            value={reminderDate}
                            onChange={(event) => setReminderDate(event.target.value)}
                            className="form-input"
                        />
                    </label>
                    <br />
                    <label className="form-label">
                        Текст напоминания:
                        <textarea
                            value={reminderText}
                            onChange={(event) => setReminderText(event.target.value)}
                            className="form-input"
                        />
                    </label>
                    <br />
                    <button type="submit" className="form-button">Добавить напоминание</button>
                </form>
                <div className="reminder-list">
                    <h3>Ваши напоминания на сегодня:</h3>
                    <ul>
                        {reminders && reminders.map((reminder) => (
                            <li className="list_reminder" key={reminder.id}>
                                {reminder.reminder_text}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Reminder;
