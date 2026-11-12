import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Payments() {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState({
    student_id: '', course_id: '', amount: '',
    payment_date: '', method: 'naqd', status: 'paid', notes: ''
  });

  useEffect(() => {
    loadPayments();
    loadStudents();
    loadCourses();
  }, [filterStatus]);

  const loadPayments = async () => {
    try {
      const params = filterStatus ? { status: filterStatus } : {};
      const response = await axios.get('/api/payments', { params });
      setPayments(response.data);
    } catch (err) {
      console.error('To\'lovlarni yuklash xatosi:', err);
    }
  };

  const loadStudents = async () => {
    try {
      const response = await axios.get('/api/students');
      setStudents(response.data);
    } catch (err) {
      console.error('Talabalarni yuklash xatosi:', err);
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

  const handleSave = async () => {
    try {
      if (editingPayment) {
        await axios.put(`/api/payments/${editingPayment}`, formData);
      } else {
        await axios.post('/api/payments', formData);
      }
      setShowModal(false);
      resetForm();
      loadPayments();
    } catch (err) {
      alert(err.response?.data?.error || 'Xatolik yuz berdi');
    }
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment.id);
    setFormData({
      student_id: payment.student_id,
      course_id: payment.course_id || '',
      amount: payment.amount,
      payment_date: payment.payment_date || '',
      method: payment.method || 'naqd',
      status: payment.status || 'paid',
      notes: payment.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('To\'lovni o\'chirmoqchimisiz?')) {
      try {
        await axios.delete(`/api/payments/${id}`);
        loadPayments();
      } catch (err) {
        alert('Xatolik yuz berdi');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      student_id: '', course_id: '', amount: '',
      payment_date: '', method: 'naqd', status: 'paid', notes: ''
    });
    setEditingPayment(null);
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";
  };

  const getStatusBadge = (status) => {
    const map = { paid: 'badge-paid', pending: 'badge-pending' };
    const labels = { paid: 'To\'langan', pending: 'Kutilmoqda' };
    return <span className={`badge ${map[status] || ''}`}>{labels[status] || status}</span>;
  };

  const getMethodLabel = (method) => {
    const labels = { naqd: 'Naqd', karta: 'Karta', online: 'Online' };
    return labels[method] || method;
  };

  // Jami hisoblash
  const totalPaid = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div>
      {/* Statistika */}
      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card">
          <div className="stat-icon green">
            <i className="bi bi-check-circle"></i>
          </div>
          <div className="stat-info">
            <h4>To'langan</h4>
            <div className="stat-value">{formatMoney(totalPaid)}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">
            <i className="bi bi-clock"></i>
          </div>
          <div className="stat-info">
            <h4>Kutilmoqda</h4>
            <div className="stat-value">{formatMoney(totalPending)}</div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h3><i className="bi bi-cash-stack"></i> To'lovlar ro'yxati</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd' }}
            >
              <option value="">Barchasi</option>
              <option value="paid">To'langan</option>
              <option value="pending">Kutilmoqda</option>
            </select>
            <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
              <i className="bi bi-plus-lg"></i> Yangi to'lov
            </button>
          </div>
        </div>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Talaba</th>
                <th>Kurs</th>
                <th>Summa</th>
                <th>Sana</th>
                <th>Usul</th>
                <th>Holat</th>
                <th>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <tr key={payment.id}>
                  <td>{payment.id}</td>
                  <td>{payment.student_name}</td>
                  <td>{payment.course_name || '-'}</td>
                  <td><strong>{formatMoney(payment.amount)}</strong></td>
                  <td>{payment.payment_date || '-'}</td>
                  <td>{getMethodLabel(payment.method)}</td>
                  <td>{getStatusBadge(payment.status)}</td>
                  <td>
                    <button className="btn-sm btn-primary" onClick={() => handleEdit(payment)} style={{ marginRight: '5px' }}>
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button className="btn-sm btn-danger" onClick={() => handleDelete(payment.id)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan="8" style={{ textAlign: 'center', color: '#999' }}>To'lovlar topilmadi</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editingPayment ? 'To\'lovni tahrirlash' : 'Yangi to\'lov qo\'shish'}</h3>
            <div className="form-group">
              <label>Talaba *</label>
              <select value={formData.student_id}
                onChange={e => setFormData({...formData, student_id: e.target.value})} required>
                <option value="">Tanlang...</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Kurs</label>
              <select value={formData.course_id}
                onChange={e => setFormData({...formData, course_id: e.target.value})}>
                <option value="">Tanlang...</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label>Summa (so'm) *</label>
                <input type="number" value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Sana</label>
                <input type="date" value={formData.payment_date}
                  onChange={e => setFormData({...formData, payment_date: e.target.value})} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label>To'lov usuli</label>
                <select value={formData.method}
                  onChange={e => setFormData({...formData, method: e.target.value})}>
                  <option value="naqd">Naqd</option>
                  <option value="karta">Karta</option>
                  <option value="online">Online</option>
                </select>
              </div>
              <div className="form-group">
                <label>Holat</label>
                <select value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="paid">To'langan</option>
                  <option value="pending">Kutilmoqda</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Izoh</label>
              <textarea value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})} rows="2" />
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

export default Payments;
