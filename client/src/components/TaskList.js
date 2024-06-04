import React from 'react';
import {useEffect, useState} from "react";
import axios from "axios";


function TaskList({setSelectedProject }) {
    const [tasks, setTasks] = useState([]);
    useEffect(() => {
        fetchTasks();
    }, []);

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
    return (
        <div className="stickers">
            <div className="sticker_ToDo">
                <h3>Надо сделать</h3>
                <ul>
                    {tasks.filter(task => task.status === 'ToDo').map(task => (
                        <li className="list_project" key={task.task_id}>
                            <span className="list_project" onClick={() => setSelectedProject(task)}>{task.task_name}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="sticker_inProgress">
                <h3>В процессе</h3>
                <ul>
                    {tasks.filter(task => task.status === 'InProgress').map(task => (
                        <li className="list_project" key={task.task_id}>
                            <span className="list_project" onClick={() => setSelectedProject(task)}>{task.task_name}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="sticker_Done">
                <h3>Готово</h3>
                <ul>
                    {tasks.filter(task => task.status === 'Done').map(task => (
                        <li className="list_project" key={task.task_id}>
                            <span className="list_project" onClick={() => setSelectedProject(task)}>{task.task_name}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default TaskList;
