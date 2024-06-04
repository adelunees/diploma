import React, { useState, useEffect } from 'react';
import axios from "axios";
import '../styles/TaskForm.css';
import {useParams} from "react-router-dom";

function TaskForm({ onClose, projectId ,assignees}) {
    const {user_id} = useParams();
    const [tasks, setTasks] = useState([]);
    const [taskName, setTaskName] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [priority, setPriority] = useState('Low');
    const [status, setStatus] = useState('ToDo');
    const [error, setError] = useState('');
    const [assignee,setAssignee]=useState('')

    useEffect(() => {
        setTaskName('');
        setDueDate('');
        setPriority('Low');
        setStatus('ToDo');
        setError('');
        setAssignee(assignees[0].user_id);
        fetchTasks();

    }, [projectId, user_id]);

    // ПОЛУЧЕНИЕ СПИСКА ЗАДАЧ
    const fetchTasks = async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/tasks', {withCredentials: true});
            setTasks(response.data);
        } catch (error) {
            console.error('Ошибка получения списка задач:', error);
        }
    };

    const addTask = async () => {
        try {
            if (!projectId) {
                console.error('project_id is NULL');
                return;
            }
            const response = await axios.post('http://localhost:4000/api/tasks', {
                project_id: projectId,
                task_name: taskName,
                due_date: dueDate,
                priority: priority,
                status: status,
                user_id:assignee
            },
                {withCredentials: true});

            console.log('Задача успешно добавлена:', response.data);
            onClose();
            fetchTasks();
        } catch (error) {
            console.error('Ошибка при добавлении задачи:', error);
            setError('Ошибка при добавлении задачи');
        }
    };

    const handleSubmit = (e) => {
        console.log(assignee);
        e.preventDefault(); // Предотвращаем стандартное поведение отправки формы
        addTask(); // Вызываем функцию добавления задачи
    };

    return (
        <div className="task-form-overlay">
            <div className="task-form">

                <div className="container_main_text">
                    <h2>Добавить задачу</h2>
                    <button className="close-button" onClick={onClose}>X</button>
                </div>

                <form onSubmit={handleSubmit}> {/* Устанавливаем обработчик на отправку формы */}

                    {error && <p className="error-message">{error}</p>}
                    <div className="form-group">
                        <label>
                            Название задачи:
                            <input type="text" value={taskName} onChange={(e) => setTaskName(e.target.value)} />
                        </label>
                    </div>
                    <div className="form-group">
                        <label>
                            Дата завершения:
                            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                        </label>
                    </div>
                    <div className="form-group">
                        <label>
                            Приоритет:
                            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </label>
                    </div>
                    <div className="form-group">
                        <label>
                            Статус:
                            <select value={status} onChange={(e) => setStatus(e.target.value)}>
                                <option value="ToDo">ToDo</option>
                                <option value="InProgress">InProgress</option>
                                <option value="Done">Done</option>
                            </select>
                        </label>
                    </div>
                    <div className="form-group">
                        <label>

                                Исполнитель:
                            <select value={assignee} onChange={(e)=>setAssignee(e.target.value)}>

                                {assignees.map(item => (
                                    <option key={item.user_id} value={item.user_id}>{item.email}</option>
                                ))}
                            </select>

                        </label>
                    </div>
                    <div className="form-group">
                        <button className="task_button" type="submit">Добавить</button> {/* Используем type="submit" */}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default TaskForm;
