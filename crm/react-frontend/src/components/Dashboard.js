import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await axios.get('/api/dashboard');
      setStats(response.data);
    } catch (err) {
      console.error('Dashboard xatosi:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";
  };

  if (loading) {
    return <div className="text-center p-5">Yuklanmoqda...</div>;
  }

  return (
    <div>
      {/* Statistika kartochkalari */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <i className="bi bi-people-fill"></i>
          </div>
          <div className="stat-info">
            <h4>Faol talabalar</h4>
            <div className="stat-value">{stats?.active_students || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <i className="bi bi-book-fill"></i>
          </div>
          <div className="stat-info">
            <h4>Faol kurslar</h4>
            <div className="stat-value">{stats?.active_courses || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <i className="bi bi-cash-coin"></i>
          </div>
          <div className="stat-info">
            <h4>Jami daromad</h4>
            <div className="stat-value">{formatMoney(stats?.total_revenue || 0)}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <i className="bi bi-calendar-check"></i>
          </div>
          <div className="stat-info">
            <h4>Kutilayotgan to'lovlar</h4>
            <div className="stat-value">{formatMoney(stats?.pending_payments || 0)}</div>
          </div>
        </div>
      </div>

      {/* Yaqindagi darslar va kurslar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Yaqindagi darslar */}
        <div className="table-container">
          <div className="table-header">
            <h3><i className="bi bi-calendar-event"></i> Yaqindagi darslar</h3>
          </div>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Kurs</th>
                  <th>Sana</th>
                  <th>Vaqt</th>
                </tr>
              </thead>
              <tbody>
                {stats?.upcoming_lessons && stats.upcoming_lessons.length > 0 ? (
                  stats.upcoming_lessons.map(lesson => (
                    <tr key={lesson.id}>
                      <td>{lesson.course_name}</td>
                      <td>{lesson.lesson_date}</td>
                      <td>{lesson.start_time}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="3" style={{ textAlign: 'center', color: '#999' }}>Yaqinda darslar yo'q</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kurslar statistikasi */}
        <div className="table-container">
          <div className="table-header">
            <h3><i className="bi bi-bar-chart"></i> Kurslar bo'yicha</h3>
          </div>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Kurs</th>
                  <th>Talabalar</th>
                </tr>
              </thead>
              <tbody>
                {stats?.course_stats && stats.course_stats.length > 0 ? (
                  stats.course_stats.map((cs, idx) => (
                    <tr key={idx}>
                      <td>{cs.name}</td>
                      <td>{cs.student_count}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="2" style={{ textAlign: 'center', color: '#999' }}>Ma'lumot yo'q</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
