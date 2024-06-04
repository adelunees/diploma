import React, { useState } from 'react';
import axios from 'axios';

function EditHabitForm({ habit, handleCloseEditForm }) {
    const [habitName, setHabitName] = useState(habit.habit_name);
    const [daysCount, setDaysCount] = useState(habit.days_count);
    const [error, setError] = useState('');

    const handleSave = async () => {
        if (!habitName || daysCount < 1) { // Добавлена проверка на daysCount < 1
            setError('Пожалуйста, заполните все поля и укажите корректное количество дней');
            return;
        }

        try {
            const response = await axios.put(`http://localhost:4000/api/habits`, {
                habit_id: habit.habit_id,
                habit_name: habitName,
                weeks_count: daysCount,
            },
                {withCredentials: true});

            handleCloseEditForm();
        } catch (error) {
            console.error('Ошибка при редактировании привычки:', error);
        }
    };

    return (
        <div className="modal open">
            <div className="modal-content">
                <span className="close" onClick={handleCloseEditForm}>&times;</span>
                <h2>Редактировать привычку</h2>
                <label>Название привычки:</label>
                <input
                    type="text"
                    value={habitName}
                    onChange={(e) => setHabitName(e.target.value)}
                />
                <label>Количество дней:</label>
                <input
                    type="number"
                    value={daysCount}
                    onChange={(e) => setDaysCount(parseInt(e.target.value))}
                />
                {error && <p className="error">{error}</p>}
                <button onClick={handleSave}>Сохранить</button>
            </div>
        </div>
    );
}

export default EditHabitForm;
