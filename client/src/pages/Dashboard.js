import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../styles/Dashboard.css';
import TaskForm from "../components/TaskForm";
import Sidebar from "../components/SideBar";
import TaskList from "../components/TaskList";

function Dashboard() {
    const { user_id } = useParams(); // Получение userId из параметров маршрута
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDescription, setNewProjectDescription] = useState('');
    const [selectedProject, setSelectedProject] = useState(null);
    const [showAddProjectForm, setShowAddProjectForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [editedTaskName, setEditedTaskName] = useState('');
    const [editedTaskDueDate, setEditedTaskDueDate] = useState('');
    const [editedTaskPriority, setEditedTaskPriority] = useState('Low');
    const [editedTaskStatus, setEditedTaskStatus] = useState('ToDo');
    const [showTaskForm, setShowTaskForm] = useState(false); // Состояние для отображения модального окна
    const [oneMembers,setOneMembers] = useState('');
    const [allMembers,setAllMembers]=useState([])

    // Функция для открытия модального окна
    const openTaskForm = () => {
        setShowTaskForm(true);
    };

    // Функция для закрытия модального окна
    const closeTaskForm = () => {
        fetchTasks();
        setShowTaskForm(false);
    };

    useEffect(() => {
        fetchProjects();
        fetchTasks();
        window.addEventListener('scroll', handleScroll); // Добавляем обработчик события прокрутки
        return () => {
            window.removeEventListener('scroll', handleScroll); // Удаляем обработчик при размонтировании компонента
        };
    }, [user_id]);

    // Обработчик события прокрутки
    const handleScroll = () => {
        const header = document.getElementById('header');
        const welcome = document.getElementById('welcome');
        const links = document.getElementById('links');

        if (header && welcome && links) {
            const scrolled = window.scrollY;

            // Применяем стили в зависимости от прокрутки
            header.style.top = scrolled === 0 ? '0' : '-50px';
            welcome.style.top = scrolled === 0 ? '100px' : '50px';
            links.style.top = scrolled === 0 ? '140px' : '90px';
        }
    };

    //ПОЛУЧЕНИЕ СПИСКА ПРОЕКТОВ ОПРЕДЕЛЕННОГО ПОЛЬЗОВАТЕЛЯ
    const fetchProjects = async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/projects', { withCredentials: true });
            setProjects(response.data);
        } catch (error) {
            console.error('Ошибка получения списка проектов:', error);
        }
    };

    const addProject = async () => {
        try {
            const response = await axios.post('http://localhost:4000/api/projects',
                {
                    project_name: newProjectName,
                    description: newProjectDescription
                },
                {withCredentials: true}
            );
            fetchProjects();
            setProjects(prevProjects => [...prevProjects, response.data]);
            setNewProjectName('');
            setNewProjectDescription('');
            setShowAddProjectForm(false);
        } catch (error) {
            console.error('Ошибка при добавлении проекта:', error);
        }
    };

    const addMembers = async () => {
        try {
            const response = await axios.post('http://localhost:4000/api/projects/assign',
                {
                    email: oneMembers,
                    project_id: selectedProject.project_id
                },
                {withCredentials: true}
            );
            if(response.data.length!==0){
                setAllMembers([...allMembers, response.data]);
            }
            setOneMembers('');
            console.log(allMembers);
            } catch (error) {
            console.error('Ошибка при добавлении пользователя:', error);
        }
    };

    // УДАЛЕНИЕ ПРОЕКТА
    const deleteProject = async (projectId) => {
        try {
            await axios.delete(`http://localhost:4000/api/projects`, { data: { project_id: projectId }, withCredentials: true });
            setProjects(prevProjects => prevProjects.filter(project => project.project_id !== projectId));
            if (selectedProject && selectedProject.project_id === projectId) {
                setSelectedProject(null);
            }
        } catch (error) {
            console.error('Ошибка при удалении проекта:', error);
        }
    };

    // Функция для закрытия формы редактирования задачи
    const cancelEditTask = () => {
        setEditingTask(null);
        setEditedTaskName('');
        setEditedTaskDueDate('');
        setEditedTaskPriority('Low');
        setEditedTaskStatus('ToDo');
    };

    // Функция для закрытия формы добавления проекта
    const cancelAddProject = () => {
        setShowAddProjectForm(false);
        setNewProjectName('');
        setNewProjectDescription('');
    };


    // Функция для конвертации даты в формат "день месяц (словом) год"
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('ru-RU', options);
    };

    // ПОЛУЧЕНИЕ СПИСКА ЗАДАЧ
    const fetchTasks = async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/tasks', { withCredentials: true });
            setTasks(response.data);
        } catch (error) {
            console.error('Ошибка получения списка задач:', error);
        }
    };
    const handleProjectChose=(project)=>{
        setSelectedProject(project);
        setAllMembers([...project.members,project.owner]);
    };
    const editTask = (task) => {
        setEditingTask(task);
        setEditedTaskName(task.task_name);
        setEditedTaskDueDate(task.due_date);
        setEditedTaskPriority(task.priority);
        setEditedTaskStatus(task.status);
    };
    const handleTaskDelete = async () => {
        try {
            await axios.delete(`http://localhost:4000/api/tasks`,
                {
                    data: {
                        task_id: editingTask.task_id,
                    },
                    withCredentials: true
                });
            fetchTasks();
            setEditingTask(null);
        } catch (error) {
            console.error('Ошибка удаления задачи:', error);
        }
    };
    // РЕДАКТИРОВАНИЕ ЗАДАЧИ
    const updateTask = async () => {
        try {
            // Проверяем, все ли обязательные данные заполнены
            if (!editedTaskName || !editedTaskDueDate || !editedTaskPriority || !editedTaskStatus) {
                console.error('Пожалуйста, заполните все обязательные поля');
                return;
            }

            await axios.put(`http://localhost:4000/api/tasks`, {
                task_id:editingTask.task_id,
                task_name: editedTaskName,
                due_date: editedTaskDueDate.split('T')[0],
                priority: editedTaskPriority,
                status: editedTaskStatus
            },
                {withCredentials: true});
            fetchTasks(); // Обновляем список задач после успешного обновления
            setEditingTask(null);
        } catch (error) {
            console.error('Ошибка при обновлении задачи:', error);
        }
    };

    return (
        <div className="dashboard-container">
            <Sidebar user_id={user_id} />
            <div className="main-content">
                <div>
                    <h2>Мои проекты</h2>
                    <ul>
                        {projects.map(project => (
                            <li className="list_project" key={project.project_id}>
                                <span className="list_project" onClick={() => handleProjectChose(project)}>{project.project_name}</span>
                            </li>
                        ))}
                    </ul>
                    {showAddProjectForm ? (
                        <div>
                            <input className="project_input"
                                   type="text"
                                   placeholder="Название проекта"
                                   value={newProjectName}
                                   onChange={(e) => setNewProjectName(e.target.value)}
                            />
                            <input className="project_input"
                                   placeholder="Описание проекта"
                                   value={newProjectDescription}
                                   onChange={(e) => setNewProjectDescription(e.target.value)}
                            />
                            <button className="task_button" onClick={addProject}>Добавить проект</button>
                            <button className="button_cancel" onClick={cancelAddProject}>Отмена</button>
                        </div>
                    ) : (
                        <button className="task_button" onClick={() => setShowAddProjectForm(true)}>Добавить проект</button>
                    )}
                    {selectedProject!=null?
                        <div className="project-tasks">
                            {selectedProject && (
                                <div>
                                    <div className="project_full">
                                        <div>
                                            <div>Создатель проекта: </div>
                                            <div className="project_owner_name"> {selectedProject.owner.email}</div>
                                        </div>
                                        <button className="project_button" onClick={() => deleteProject(selectedProject.project_id)}>Удалить проект</button>
                                    </div>
                                    <h2>{selectedProject.project_name}</h2>
                                    <p>{selectedProject.description}</p>
                                    <ul>
                                        {tasks
                                            .filter(task => task.project_id === selectedProject.project_id)
                                            .map(task => (
                                                <li key={task.task_id}>
                                                    {editingTask === task ? (
                                                        <div className="cont_redact">
                                                            <input
                                                                type="text"
                                                                value={editedTaskName}
                                                                onChange={(e) => setEditedTaskName(e.target.value)}
                                                            />
                                                            <input
                                                                type="date"
                                                                value={editedTaskDueDate}
                                                                onChange={(e) => setEditedTaskDueDate(e.target.value)}
                                                            />
                                                            <select value={editedTaskPriority} onChange={(e) => setEditedTaskPriority(e.target.value)}>
                                                                <option value="Low">Low</option>
                                                                <option value="Medium">Medium</option>
                                                                <option value="High">High</option>
                                                            </select>
                                                            <select value={editedTaskStatus} onChange={(e) => setEditedTaskStatus(e.target.value)}>
                                                                <option value="ToDo">ToDo</option>
                                                                <option value="InProgress">InProgress</option>
                                                                <option value="Done">Done</option>
                                                            </select>
                                                            <button onClick={updateTask}>Сохранить</button>
                                                            <button onClick={handleTaskDelete}>Удалить</button>
                                                            <button onClick={cancelEditTask}>Отмена</button>
                                                        </div>
                                                    ) : (
                                                        <div className="container_task">
                                                            <div className="text-task">
                                                                <div><strong>Название:</strong> {task.task_name}</div>
                                                                <div><strong>Приоритет:</strong> {task.priority}</div>
                                                                <div><strong>Статус:</strong> {task.status}</div>
                                                                <div><strong>Исполнитель:</strong> {task.assignee.email}</div>
                                                                <div><strong>Срок выполнения:</strong> {formatDate(task.due_date)}</div>
                                                            </div>
                                                            <button className="button_redact" onClick={() => editTask(task)}>Редактировать</button>
                                                        </div>
                                                    )}
                                                </li>
                                            ))}
                                    </ul>
                                    <div>
                                        <div>
                                            <strong>Список участников проекта:</strong>
                                            <ul>
                                                {allMembers.map(event=>(
                                                    <li>{event.email}</li>
                                                ))}
                                            </ul>
                                            <div className="new_user">
                                                <strong>Добавить участника проекта: </strong>
                                                <input value={oneMembers} onChange={(event) => setOneMembers(event.target.value)} placeholder="Введите эл.почту.." title="Введите почту пользователя"/>
                                                <button onClick={addMembers}>Добавить</button>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="task_button" onClick={openTaskForm}>Добавить задачу</button>
                                    {showTaskForm && <TaskForm onClose={closeTaskForm} projectId={selectedProject.project_id} assignees={[...selectedProject.members,selectedProject.owner]} />}
                                </div>
                            )}
                        </div>
                        :
                        <></>
                    }
                    <h2>Мои задачи</h2>
                    <TaskList tasks={tasks} setSelectedProject={setSelectedProject} />
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
