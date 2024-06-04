import React, { useState } from 'react';
import { FaThumbsUp, FaThumbsDown, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import '../styles/HabitDaysList.css';
import axios from "axios";

function HabitDaysList({ habit, dayStatuses, handleSuccessfulDay, handleUnsuccessfulDay, fetchHabits }) {
    const [showOptions, setShowOptions] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);

    // Функция для конвертации даты в формат "день месяц (словом) год"
    const getFormattedDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('ru-RU', options);
    };

    const generateDateList = () => {
        const dates = [];
        const startDate = new Date(habit.start_date);

        for (let i = 0; i < habit.weeks_count; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(currentDate.getDate() + i);
            const formattedDate = getFormattedDate(currentDate);
            dates.push(formattedDate);
        }

        return dates;
    };

    const handleDateClick = (date) => {
        setShowOptions(true);
        setSelectedDate(date);
    };

    const handleHabitDelete = async () => {
        try {
            await axios.delete(`http://localhost:4000/api/habits`, { data: {habit_id: habit.habit_id}, withCredentials: true });
            fetchHabits(); // Обновляем список привычек после удаления
        } catch (error) {
            console.error('Ошибка удаления привычки:', error);
        }
    };

    return (
        <div className="habit-days-list">
            <h3>{habit.habit_name} - Дни</h3>
            <button className="button-delete-tracker" onClick={handleHabitDelete}>
                Удалить
            </button>
            <div className="days-grid">
                {generateDateList().map((date, index) => (
                    <div key={index} className="day-cell">
                        <div className="day-date">{date}</div>
                        <div className="day-status">
                            {dayStatuses[date] === 'success' ? (
                                <FaCheckCircle className="success-icon" />
                            ) : dayStatuses[date] === 'failure' ? (
                                <FaTimesCircle className="failure-icon" />
                            ) : (
                                <span onClick={() => handleDateClick(date)} style={{ cursor: 'pointer' }}>
                                    Отметить
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {showOptions && (
                <div className="options-modal">
                    <button onClick={() => { handleSuccessfulDay(selectedDate); setShowOptions(false); }}>
                        <FaThumbsUp />
                    </button>
                    <button onClick={() => { handleUnsuccessfulDay(selectedDate); setShowOptions(false); }}>
                        <FaThumbsDown />
                    </button>
                    <button onClick={() => setShowOptions(false)}>Отмена</button>
                </div>
            )}
        </div>
    );
}

export default HabitDaysList;
