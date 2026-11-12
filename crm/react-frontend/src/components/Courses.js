import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Courses() {
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    name: '', description: '', duration_hours: 0, price: 0,
    schedule: '', teacher_id: '', is_active: 1
  });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const response = await axios.get('/api/courses');
      setCourses(response.data);
    } catch (err) {
      console.error('Kurslarni yuklash xatosi:', err);
    }
  };

  const handleSave = async () => {
    try {
      if (editingCourse) {
        await axios.put(`/api/courses/${editingCourse}`, formData);
      } else {
        await axios.post('/api/courses', formData);
      }
      setShowModal(false);
      resetForm();
      loadCourses();
    } catch (err) {
      alert(err.response?.data?.error || 'Xatolik yuz berdi');
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course.id);
    setFormData({
      name: course.name,
      description: course.description || '',
      duration_hours: course.duration_hours || 0,
      price: course.price || 0,
      schedule: course.schedule || '',
      teacher_id: course.teacher_id || '',
      is_active: course.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Kursni o\'chirmoqchimisiz?')) {
      try {
        await axios.delete(`/api/courses/${id}`);
        loadCourses();
      } catch (err) {
        alert('Xatolik yuz berdi');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', description: '', duration_hours: 0, price: 0,
      schedule: '', teacher_id: '', is_active: 1
    });
    setEditingCourse(null);
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";
  };

  return (
    <div>
      <div className="table-container">
        <div className="table-header">
          <h3><i className="bi bi-book"></i> Kurslar ro'yxati</h3>
          <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
            <i className="bi bi-plus-lg"></i> Yangi kurs
          </button>
        </div>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Kurs nomi</th>
                <th>Tavsif</th>
                <th>Davomiyligi</th>
                <th>Narxi</th>
                <th>Jadval</th>
                <th>O'qituvchi</th>
                <th>Holat</th>
                <th>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course.id}>
                  <td>{course.id}</td>
                  <td><strong>{course.name}</strong></td>
                  <td>{course.description || '-'}</td>
                  <td>{course.duration_hours} soat</td>
                  <td>{formatMoney(course.price)}</td>
                  <td>{course.schedule || '-'}</td>
                  <td>{course.teacher_name || '-'}</td>
                  <td>
                    <span className={`badge ${course.is_active ? 'badge-active' : 'badge-dropped'}`}>
                      {course.is_active ? 'Faol' : 'Nofaol'}
                    </span>
                  </td>
                  <td>
                    <button className="btn-sm btn-primary" onClick={() => handleEdit(course)} style={{ marginRight: '5px' }}>
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button className="btn-sm btn-danger" onClick={() => handleDelete(course.id)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr><td colSpan="9" style={{ textAlign: 'center', color: '#999' }}>Kurslar topilmadi</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editingCourse ? 'Kursni tahrirlash' : 'Yangi kurs qo\'shish'}</h3>
            <div className="form-group">
              <label>Kurs nomi *</label>
              <input type="text" value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Tavsif</label>
              <textarea value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})} rows="3" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label>Davomiyligi (soat)</label>
                <input type="number" value={formData.duration_hours}
                  onChange={e => setFormData({...formData, duration_hours: parseInt(e.target.value) || 0})} />
              </div>
              <div className="form-group">
                <label>Narxi (so'm)</label>
                <input type="number" value={formData.price}
                  onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} />
              </div>
            </div>
            <div className="form-group">
              <label>Jadval</label>
              <input type="text" value={formData.schedule}
                placeholder="Masalan: Dushanba, Chorshanba 18:00-20:00"
                onChange={e => setFormData({...formData, schedule: e.target.value})} />
            </div>
            <div className="form-group">
              <label>O'qituvchi ID</label>
              <input type="number" value={formData.teacher_id}
                onChange={e => setFormData({...formData, teacher_id: e.target.value})} />
            </div>
            <div className="form-group">
              <label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.is_active}
                    onChange={e => setFormData({...formData, is_active: e.target.checked ? 1 : 0})} />
                  Faol kurs
                </label>
              </label>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Bekor qilish</button>
              <button className="btn-primary" onClick={handleSave}>Saqlash</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Courses;
