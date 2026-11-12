import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password,
      });

      onLogin(response.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2><i className="bi bi-mortarboard-fill"></i> O'quv markaz</h2>
        <p>CRM tizimiga kirish</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Login</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Login kiriting"
              required
            />
          </div>
          <div className="form-group">
            <label>Parol</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Parol kiriting"
              required
            />
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Kirish...' : 'Kirish'}
          </button>
        </form>

        <div style={{ marginTop: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '8px', fontSize: '0.85rem' }}>
          <strong>Namuna loginlar:</strong><br/>
          Admin: <code>admin</code> / <code>admin123</code><br/>
          O'qituvchi: <code>teacher1</code> / <code>teacher123</code>
        </div>
      </div>
    </div>
  );
}

export default Login;
