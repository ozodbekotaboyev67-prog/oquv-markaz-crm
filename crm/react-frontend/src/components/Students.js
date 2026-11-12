import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', phone: '', email: '',
    enrollment_date: '', status: 'active', notes: ''
  });

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const response = await axios.get('/api/students', { params: { search } });
      setStudents(response.data);
    } catch (err) {
      console.error('Talabalarni yuklash xatosi:', err);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleSave = async () => {
    try {
      if (editingStudent) {
        await axios.put(`/api/students/${editingStudent}`, formData);
      } else {
        await axios.post('/api/students', formData);
      }
      setShowModal(false);
      resetForm();
      loadStudents();
    } catch (err) {
      alert(err.response?.data?.error || 'Xatolik yuz berdi');
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student.id);
    setFormData({
      first_name: student.first_name,
      last_name: student.last_name,
      phone: student.phone || '',
      email: student.email || '',
      enrollment_date: student.enrollment_date || '',
      status: student.status,
      notes: student.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Talabani o\'chirmoqchimisiz?')) {
      try {
        await axios.delete(`/api/students/${id}`);
        loadStudents();
      } catch (err) {
        alert('Xatolik yuz berdi');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '', last_name: '', phone: '', email: '',
      enrollment_date: '', status: 'active', notes: ''
    });
    setEditingStudent(null);
  };

  const getStatusBadge = (status) => {
    const map = {
      active: 'badge-active',
      graduated: 'badge-graduated',
      dropped_out: 'badge-dropped'
    };
    const labels = { active: 'Faol', graduated: 'Tamomlagan', dropped_out: 'Chiqib ketgan' };
    return <span className={`badge ${map[status] || ''}`}>{labels[status] || status}</span>;
  };

  return (
    <div>
      <div className="table-container">
        <div className="table-header">
          <h3><i className="bi bi-people"></i> Talabalar ro'yxati</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div className="search-box">
              <i className="bi bi-search"></i>
              <input
                type="text"
                placeholder="Qidirish..."
                value={search}
                onChange={handleSearch}
              />
            </div>
            <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
              <i className="bi bi-plus-lg"></i> Yangi talaba
            </button>
          </div>
        </div>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Ism</th>
                <th>Familiya</th>
                <th>Telefon</th>
                <th>Email</th>
                <th>Qabul sanasi</th>
                <th>Holat</th>
                <th>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id}>
                  <td>{student.id}</td>
                  <td>{student.first_name}</td>
                  <td>{student.last_name}</td>
                  <td>{student.phone || '-'}</td>
                  <td>{student.email || '-'}</td>
                  <td>{student.enrollment_date || '-'}</td>
                  <td>{getStatusBadge(student.status)}</td>
                  <td>
                    <button className="btn-sm btn-primary" onClick={() => handleEdit(student)} style={{ marginRight: '5px' }}>
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button className="btn-sm btn-danger" onClick={() => handleDelete(student.id)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr><td colSpan="8" style={{ textAlign: 'center', color: '#999' }}>Talabalar topilmadi</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editingStudent ? 'Talabani tahrirlash' : 'Yangi talaba qo\'shish'}</h3>
            <div className="form-group">
              <label>Ism *</label>
              <input type="text" value={formData.first_name}
                onChange={e => setFormData({...formData, first_name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Familiya *</label>
              <input type="text" value={formData.last_name}
                onChange={e => setFormData({...formData, last_name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Telefon</label>
              <input type="text" value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Qabul sanasi</label>
              <input type="date" value={formData.enrollment_date}
                onChange={e => setFormData({...formData, enrollment_date: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Holat</label>
              <select value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="active">Faol</option>
                <option value="graduated">Tamomlagan</option>
                <option value="dropped_out">Chiqib ketgan</option>
              </select>
            </div>
            <div className="form-group">
              <label>Izoh</label>
              <textarea value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})} rows="3" />
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

export default Students;
