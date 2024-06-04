import React, { useState } from 'react';
import axios from 'axios';
import fetchHabits from '../pages/Tracker';

function AddHabitModal({ handleCloseModal }) {
    const [habitName, setHabitName] = useState('');
    const [daysCount, setDaysCount] = useState('');
    const [startDay, setStartDay] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');

    const handleAddHabit = async () => {
        if (!habitName || !daysCount) {
            setError('Пожалуйста, заполните все поля');
            return;
        }

        try {
            const response = await axios.post('http://localhost:4000/api/habits', {
                habit_name: habitName,
                days_count: daysCount,
                start_day: startDay // Установка сегодняшней даты как начальной
            },
            {withCredentials: true});
            setSuccessMessage('Привычка успешно добавлена');

            setTimeout(() => {
                fetchHabits();
                handleCloseModal();
            }, 1500);
        } catch (error) {
            console.error('Ошибка при добавлении привычки:', error);
            setError('Ошибка при добавлении привычки');
        }
    };

    return (
        <div className="modal open">
            <div className="modal-content">
                <span className="close" onClick={handleCloseModal}>&times;</span>
                <h2>Добавить привычку</h2>
                {successMessage && <p className="success">{successMessage}</p>}
                {error && <p className="error">{error}</p>}
                <label>Название привычки: </label>
                <input
                    type="text"
                    value={habitName}
                    onChange={(e) => setHabitName(e.target.value)}
                />
                <label>Количество дней: </label>
                <input
                    type="number"
                    value={daysCount}
                    onChange={(e) => setDaysCount(e.target.value)}
                />
                <label>Дата начала: </label>
                <input
                    type="date"
                    value={startDay}
                    onChange={(e) => setStartDay(e.target.value)}
                />
                <button className="button-delete-tracker" onClick={handleAddHabit}>Добавить</button>
            </div>
        </div>
    );
}

export default AddHabitModal;
