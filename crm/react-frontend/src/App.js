import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Dashboard from './components/Dashboard';
import Students from './components/Students';
import Courses from './components/Courses';
import Payments from './components/Payments';
import Lessons from './components/Lessons';
import Login from './components/Login';
import './styles/App.css';

const API = '';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Login tekshirish
  useEffect(() => {
    const savedUser = localStorage.getItem('crm_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('crm_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('crm_user');
    setCurrentPage('login');
  };

  // Login sahifasi
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const menuItems = [
    { id: 'dashboard', icon: 'bi-speedometer2', label: "Bosh sahifa" },
    { id: 'students', icon: 'bi-people', label: "Talabalar" },
    { id: 'courses', icon: 'bi-book', label: "Kurslar" },
    { id: 'payments', icon: 'bi-cash-stack', label: "To'lovlar" },
    { id: 'lessons', icon: 'bi-calendar-check', label: "Darslar" },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'students': return <Students />;
      case 'courses': return <Courses />;
      case 'payments': return <Payments />;
      case 'lessons': return <Lessons />;
      default: return <Dashboard />;
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";
  };

  return (
    <div className="app">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h3><i className="bi bi-mortarboard-fill"></i> O'quv markaz</h3>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => setCurrentPage(item.id)}
            >
              <i className={`bi ${item.icon}`}></i>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <i className="bi bi-person-circle"></i>
            {sidebarOpen && <span>{user.full_name || user.username}</span>}
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right"></i>
            {sidebarOpen && <span>Chiqish</span>}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="main-content">
        <header className="top-header">
          <button className="toggle-sidebar" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <i className="bi bi-list"></i>
          </button>
          <h2>{menuItems.find(m => m.id === currentPage)?.label}</h2>
        </header>
        <main className="content">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
export { API, formatMoney };
