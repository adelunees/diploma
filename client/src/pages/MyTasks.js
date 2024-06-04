import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Sidebar from '../components/SideBar';  // Импортируем компонент Sidebar
import TaskList from "../components/TaskList"; // Импортируем новый компонент
import '../styles/MyTask.css';

const MyTasks = () => {
    const { user_id } = useParams();
    const [tasks, setTasks] = useState([]);
    const [statusFilter, setStatusFilter] = useState(''); // Фильтр по статусу
    const [priorityFilter, setPriorityFilter] = useState(''); // Фильтр по приоритету
    const [dueDateFilter, setDueDateFilter] = useState(''); // Фильтр по дате
    const [selectedTask, setSelectedTask] = useState(null); // Состояние для выбранной задачи
    const [isModalOpen, setIsModalOpen] = useState(false); // Состояние для открытия/закрытия модального окна
    const [editedTaskName, setEditedTaskName] = useState('');
    const [editedTaskDueDate, setEditedTaskDueDate] = useState('');
    const [editedTaskPriority, setEditedTaskPriority] = useState('Low');
    const [editedTaskStatus, setEditedTaskStatus] = useState('ToDo');

    const [sortOrder, setSortOrder] = useState('asc');

    useEffect(() => {
        fetchTasks();
    }, [user_id]);

    const fetchTasks = async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/tasks/my', {
                withCredentials: true
            });
            setTasks(response.data);
        } catch (error) {
            console.error('Ошибка получения списка задач:', error);
        }
    };

    // Функция для даты в формат "день месяц (словом) год"
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('ru-RU', options);
    };

    const handleStatusFilterChange = (e) => {
        setStatusFilter(e.target.value);
    };

    const handlePriorityFilterChange = (e) => {
        setPriorityFilter(e.target.value);
    };

    const handleDueDateFilterChange = (e) => {
        setDueDateFilter(e.target.value);
    };

    // Функция для сортировки задач по дате
    const sortByDate = () => {
        const sortedTasks = [...tasks].sort((a, b) => {
            const dateA = new Date(a.due_date);
            const dateB = new Date(b.due_date);
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
        setTasks(sortedTasks);
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); // Изменяем порядок сортировки
    };

    const filteredTasks = tasks.filter(task => {
        return (
            (statusFilter === '' || task.status === statusFilter) &&
            (priorityFilter === '' || task.priority === priorityFilter) &&
            (dueDateFilter === '' || task.due_date.split('T')[0] === dueDateFilter)
        );
    });

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setEditedTaskName(task.task_name);
        setEditedTaskDueDate(task.due_date);
        setEditedTaskPriority(task.priority);
        setEditedTaskStatus(task.status);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedTask(null);
    };

    const handleTaskUpdate = async () => {
        try {
            await axios.put(`http://localhost:4000/api/tasks`, {
                task_id:selectedTask.task_id,
                task_name: editedTaskName,
                due_date: editedTaskDueDate.split('T')[0],
                priority: editedTaskPriority,
                status: editedTaskStatus
            }, {
                withCredentials: true
            });
            fetchTasks();
            handleModalClose();
        } catch (error) {
            console.error('Ошибка обновления задачи:', error);
        }
    };

    const handleTaskDelete = async () => {
        try {
            await axios.delete(`http://localhost:4000/api/tasks`,
                {
                    data: {
                        task_id: selectedTask.task_id,
                    },
                    withCredentials: true
                });
            fetchTasks();
            handleModalClose();
        } catch (error) {
            console.error('Ошибка удаления задачи:', error);
        }
    };

    return (
        <div className="dashboard-container">
            <Sidebar user_id={user_id} />
            <div className="main_content_myTask">
                <div className="myTasks_table">
                    <h2>Все задачи</h2>
                    <div className="filters">
                        <label>
                            Статус:
                            <select value={statusFilter} onChange={handleStatusFilterChange}>
                                <option value="">Все</option>
                                <option value="Done">Выполнено</option>
                                <option value="InProgress">В процессе</option>
                                <option value="ToDo">Надо сделать</option>
                            </select>
                        </label>
                        <label>
                            Приоритет:
                            <select value={priorityFilter} onChange={handlePriorityFilterChange}>
                                <option value="">Любой</option>
                                <option value="High">Высокий</option>
                                <option value="Medium">Средний</option>
                                <option value="Low">Низкий</option>
                            </select>
                        </label>
                        <button className="button_sort" onClick={sortByDate}>Сортировать по дате</button>
                        <button className="button_add_task" onClick={sortByDate}> + cоздать задачу</button>
                    </div>
                    <table className="task_table">
                        <thead>
                        <tr>
                            <th>Название задачи</th>
                            <th>Приоритет</th>
                            <th>Статус</th>
                            <th>Срок выполнения</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredTasks.map(task => (
                            <tr key={task.task_id} onClick={() => handleTaskClick(task)}>
                                <td>{task.task_name}</td>
                                <td>{task.priority}</td>
                                <td>{task.status}</td>
                                <td>{formatDate(task.due_date)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    <h2>Задачи по статусам</h2>
                    <div className="statuses">
                        <div className="stickers_mytasks">
                            <TaskList tasks={tasks} />
                        </div>
                    </div>
                    <h2>Задачи по дате</h2>
                    <div>
                        <input
                            type="date"
                            value={dueDateFilter}
                            onChange={handleDueDateFilterChange}
                            className="form-input"
                        />
                    </div>
                </div>
            </div>

            {isModalOpen && selectedTask && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Редактирование задачи</h2>
                        <label>
                            Название задачи:
                            <input
                                type="text"
                                name="task_name"
                                value={editedTaskName}
                                onChange={(e) => setEditedTaskName(e.target.value)}
                            />
                        </label>
                        <label>
                            Приоритет:
                            <select
                                name="priority"
                                value={editedTaskPriority}
                                onChange={(e) => setEditedTaskPriority(e.target.value)}
                            >
                                <option value="Low">Низкий</option>
                                <option value="Medium">Средний</option>
                                <option value="High">Высокий</option>
                            </select>
                        </label>
                        <label>
                            Статус:
                            <select
                                name="status"
                                value={editedTaskStatus}
                                onChange={(e) => setEditedTaskStatus(e.target.value)}
                            >
                                <option value="ToDo">Надо сделать</option>
                                <option value="InProgress">В процессе</option>
                                <option value="Done">Выполнено</option>
                            </select>
                        </label>
                        <label>
                            Срок выполнения:
                            <input
                                type="date"
                                name="due_date"
                                value={editedTaskDueDate.split('T')[0]}
                                onChange={(e) => setEditedTaskDueDate(e.target.value)}
                            />
                        </label>
                        <div className="modal-actions">
                            <button className="button_redact_task" onClick={handleTaskUpdate}>Сохранить</button>
                            <button className="button_redact_task" onClick={handleTaskDelete}>Удалить</button>
                            <button className="button_redact_task" onClick={handleModalClose}>Отмена</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyTasks;
