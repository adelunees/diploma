import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginForm from './pages/LoginForm';
import Dashboard from './pages/Dashboard';
import Tracker from './pages/Tracker';
import Reminder from './pages/Reminder';
import ProfileSettings from "./pages/ProfileSettings";
import MyTasks from "./pages/MyTasks";

function App() {
    return (
        <Router>
            <Routes>
                <Route exact path="/" element={<LoginForm />} />
                <Route exact path="/dashboard" element={<Dashboard />} />
                <Route exact path="/mytasks" element={<MyTasks />} />
                <Route exact path="/reminder" element={<Reminder />} />
                <Route exact path="/tracker" element={<Tracker />} />
                <Route exact path="/person" element={<ProfileSettings />} />
            </Routes>
        </Router>
    );
}

export default App;

