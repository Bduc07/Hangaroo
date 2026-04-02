import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Trash2, ArrowLeft } from 'lucide-react';
import './Reports.css';

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get('http://localhost:3000/api/v1/admin/users', { headers: { Authorization: `Bearer ${token}` }});
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (userId) => {
    if(!window.confirm("Delete user and all their hosted events entirely?")) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`http://localhost:3000/api/v1/admin/users/${userId}`, { headers: { Authorization: `Bearer ${token}` }});
      fetchUsers();
    } catch(err) {
      alert("Failed to delete user");
    }
  };

  return (
    <div className="reports-container">
      <header className="reports-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="back-btn" onClick={() => navigate('/dashboard')}><ArrowLeft size={20} /></button>
          <h2>Manage Users</h2>
        </div>
      </header>
      <div className="reports-list">
        {users.map(u => (
          <div key={u._id} className="report-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p className="report-event-title">{u.firstName} {u.lastName}</p>
              <p className="report-date">{u.email}</p>
            </div>
            <button onClick={() => handleDelete(u._id)} style={{ background: '#ef4444', border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer', color: 'white' }}>
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Users;
