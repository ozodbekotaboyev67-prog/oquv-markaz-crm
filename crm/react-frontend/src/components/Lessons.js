import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Lessons() {
  const [lessons, setLessons] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [attendanceList, setAttendanceList] = useState([]);
  const [formData, setFormData] = useState({
    course_id: '', teacher_id: '', lesson_date: '',
    start_time: '', end_time: '', is_completed: 0
  });

  useEffect(() => {
    loadLessons();
    loadCourses();
  }, []);

  const loadLessons = async () => {
    try {
      const response = await axios.get('/api/lessons');
      setLessons(response.data);
    } catch (err) {
      console.error('Darslarni yuklash xatosi:', err);
    }
  };

  const loadCourses = async () => {
    try {
      const response = await axios.get('/api/courses');
      setCourses(response.data);
    } catch (err) {
      console.error('Kurslarni yuklash xatosi:', err);
    }
  };

  const loadStudents = async () => {
    try {
      const response = await axios.get('/api/students?status=active');
      setStudents(response.data);
    } catch (err) {
      console.error('Talabalarni yuklash xatosi:', err);
    }
  };

  const handleSave = async () => {
    try {
      if (editingLesson) {
        await axios.put(`/api/lessons/${editingLesson}`, formData);
      } else {
        await axios.post('/api/lessons', formData);
      }
      setShowModal(false);
      resetForm();
      loadLessons();
    } catch (err) {
      alert(err.response?.data?.error || 'Xatolik yuz berdi');
    }
  };

  const handleEdit = (lesson) => {
    setEditingLesson(lesson.id);
    setFormData({
      course_id: lesson.course_id,
      teacher_id: lesson.teacher_id || '',
      lesson_date: lesson.lesson_date,
      start_time: lesson.start_time || '',
      end_time: lesson.end_time || '',
      is_completed: lesson.is_completed
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Darsni o\'chirmoqchimisiz?')) {
      try {
        await axios.delete(`/api/lessons/${id}`);
        loadLessons();
      } catch (err) {
        alert('Xatolik yuz berdi');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      course_id: '', teacher_id: '', lesson_date: '',
      start_time: '', end_time: '', is_completed: 0
    });
    setEditingLesson(null);
  };

  // Qatnashuvchilik
  const openAttendance = async (lesson) => {
    setSelectedLesson(lesson);
    await loadStudents();

    // Mavjud qatnashuvchilikni yuklash
    try {
      const response = await axios.get(`/api/lessons/${lesson.id}/attendance`);
      const existing = response.data;

      const list = students.map(student => {
        const found = existing.find(a => a.student_id === student.id);
        return {
          student_id: student.id,
          student_name: `${student.first_name} ${student.last_name}`,
          status: found ? found.status : 'present'
        };
      });
      setAttendanceList(list);
    } catch (err) {
      const list = students.map(student => ({
        student_id: student.id,
        student_name: `${student.first_name} ${student.last_name}`,
        status: 'present'
      }));
      setAttendanceList(list);
    }
    setShowAttendance(true);
  };

  const saveAttendance = async () => {
    try {
      await axios.post(`/api/lessons/${selectedLesson.id}/attendance/bulk`, {
        attendance_list: attendanceList
      });
      setShowAttendance(false);
    } catch (err) {
      alert('Xatolik yuz berdi');
    }
  };

  const getAttendanceBadge = (status) => {
    const map = {
      present: 'badge-present',
      absent: 'badge-absent',
      late: 'badge-late'
    };
    const labels = { present: 'Bor', absent: 'Yo\'q', late: 'Kech' };
    return <span className={`badge ${map[status] || ''}`}>{labels[status] || status}</span>;
  };

  return (
    <div>
      <div className="table-container">
        <div className="table-header">
          <h3><i className="bi bi-calendar-check"></i> Darslar ro'yxati</h3>
          <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
            <i className="bi bi-plus-lg"></i> Yangi dars
          </button>
        </div>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Kurs</th>
                <th>Sana</th>
                <th>Boshlanish</th>
                <th>Tugash</th>
                <th>O'qituvchi</th>
                <th>Holat</th>
                <th>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {lessons.map(lesson => (
                <tr key={lesson.id}>
                  <td>{lesson.id}</td>
                  <td><strong>{lesson.course_name}</strong></td>
                  <td>{lesson.lesson_date}</td>
                  <td>{lesson.start_time || '-'}</td>
                  <td>{lesson.end_time || '-'}</td>
                  <td>{lesson.teacher_name || '-'}</td>
                  <td>
                    <span className={`badge ${lesson.is_completed ? 'badge-active' : 'badge-pending'}`}>
                      {lesson.is_completed ? 'Tugagan' : 'Kutilmoqda'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-sm btn-primary"
                      onClick={() => openAttendance(lesson)}
                      style={{ marginRight: '5px' }}
                      title="Qatnashuvchilik"
                    >
                      <i className="bi bi-people"></i>
                    </button>
                    <button
                      className="btn-sm btn-primary"
                      onClick={() => handleEdit(lesson)}
                      style={{ marginRight: '5px' }}
                      title="Tahrirlash"
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      className="btn-sm btn-danger"
                      onClick={() => handleDelete(lesson.id)}
                      title="O'chirish"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {lessons.length === 0 && (
                <tr><td colSpan="8" style={{ textAlign: 'center', color: '#999' }}>Darslar topilmadi</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dars modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editingLesson ? 'Darsni tahrirlash' : 'Yangi dars qo\'shish'}</h3>
            <div className="form-group">
              <label>Kurs *</label>
              <select value={formData.course_id}
                onChange={e => setFormData({...formData, course_id: e.target.value})} required>
                <option value="">Tanlang...</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>O'qituvchi ID</label>
              <input type="number" value={formData.teacher_id}
                onChange={e => setFormData({...formData, teacher_id: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Sana *</label>
              <input type="date" value={formData.lesson_date}
                onChange={e => setFormData({...formData, lesson_date: e.target.value})} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label>Boshlanish vaqti</label>
                <input type="time" value={formData.start_time}
                  onChange={e => setFormData({...formData, start_time: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Tugash vaqti</label>
                <input type="time" value={formData.end_time}
                  onChange={e => setFormData({...formData, end_time: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.is_completed}
                  onChange={e => setFormData({...formData, is_completed: e.target.checked ? 1 : 0})} />
                Dars tugagan
              </label>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Bekor qilish</button>
              <button className="btn-primary" onClick={handleSave}>Saqlash</button>
            </div>
          </div>
        </div>
      )}

      {/* Qatnashuvchilik modal */}
      {showAttendance && selectedLesson && (
        <div className="modal-overlay" onClick={() => setShowAttendance(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <h3>
              <i className="bi bi-people"></i> Qatnashuvchilik — {selectedLesson.lesson_date}
            </h3>
            <p style={{ color: '#666', marginBottom: '15px' }}>
              Kurs: <strong>{selectedLesson.course_name}</strong>
            </p>

            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Talaba</th>
                    <th style={{ textAlign: 'center' }}>Holat</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceList.map((item, idx) => (
                    <tr key={item.student_id}>
                      <td>{item.student_name}</td>
                      <td style={{ textAlign: 'center' }}>
                        <select
                          value={item.status}
                          onChange={e => {
                            const updated = [...attendanceList];
                            updated[idx].status = e.target.value;
                            setAttendanceList(updated);
                          }}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: '1px solid #ddd',
                            fontSize: '0.85rem'
                          }}
                        >
                          <option value="present">Bor</option>
                          <option value="absent">Yo'q</option>
                          <option value="late">Kech</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {attendanceList.length === 0 && (
                    <tr><td colSpan="2" style={{ textAlign: 'center', color: '#999' }}>Talabalar yo'q</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowAttendance(false)}>Bekor qilish</button>
              <button className="btn-primary" onClick={saveAttendance}>
                <i className="bi bi-check-lg"></i> Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Lessons;
