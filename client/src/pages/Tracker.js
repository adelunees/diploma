import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddHabitModal from '../components/AddHabitModal';
import EditHabitForm from "../components/EditHabitForm";
import HabitDaysList from "../components/HabitDaysList";
import Sidebar from "../components/SideBar";
import { useParams } from "react-router-dom";
import '../styles/Tracker.css'

function Tracker() {
    const { user_id } = useParams();
    const [showAddHabitModal, setShowAddHabitModal] = useState(false);
    const [showEditHabitForm, setShowEditHabitForm] = useState(false);
    const [habits, setHabits] = useState([]);
    const [selectedHabit, setSelectedHabit] = useState(null);
    const [dayStatuses, setDayStatuses] = useState({});

    const fetchHabits = async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/habits', { withCredentials: true });
            setHabits(response.data);
        } catch (error) {
            console.error('Ошибка получения списка привычек:', error);
        }
    };

    useEffect(() => {
        fetchHabits();
    }, []);

    const handleAddHabit = () => {
        setShowAddHabitModal(true);
    };

    const handleEditHabit = (habit) => {
        setSelectedHabit(habit);
        setShowEditHabitForm(true);
    };

    const handleCloseEditForm = () => {
        setSelectedHabit(null);
        fetchHabits();
        setShowEditHabitForm(false);
    };

    const handleSuccessfulDay = (date) => {
        setDayStatuses(prevStatuses => ({ ...prevStatuses, [date]: 'success' }));
    };

    const handleUnsuccessfulDay = (date) => {
        setDayStatuses(prevStatuses => ({ ...prevStatuses, [date]: 'failure' }));
    };

    return (
        <div className="dashboard-container">
            <Sidebar user_id={user_id} />
            <div className="main-content">
                <h2>Трекер привычек</h2>
                <ul>
                    {habits && habits.map((habit) => (
                        <li className="list-habit" key={habit.habit_id} onClick={() => setSelectedHabit(habit)}>
                            <span>{habit.habit_name}</span>
                            <span> (Количество дней: {habit.weeks_count})</span>
                        </li>
                    ))}
                </ul>
                <button className="button-add-tracker" onClick={handleAddHabit}>Добавить привычку</button>
                {selectedHabit && (
                    <HabitDaysList
                        habit={selectedHabit}
                        dayStatuses={dayStatuses}
                        handleSuccessfulDay={handleSuccessfulDay}
                        handleUnsuccessfulDay={handleUnsuccessfulDay}
                        fetchHabits={fetchHabits} // Передаем функцию обновления списка привычек
                    />
                )}
            </div>
            {showAddHabitModal && <AddHabitModal handleCloseModal={() => setShowAddHabitModal(false)} />}
            {showEditHabitForm && <EditHabitForm habit={selectedHabit} handleCloseEditForm={handleCloseEditForm} />}
        </div>
    );
}

export default Tracker;
