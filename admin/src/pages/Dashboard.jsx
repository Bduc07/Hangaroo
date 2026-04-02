import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, Calendar, LogOut } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({ totalUsers: 0, totalEvents: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          navigate('/login');
          return;
        }
        const response = await axios.get('http://localhost:3000/api/v1/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMetrics({
          totalUsers: response.data.totalUsers,
          totalEvents: response.data.totalEvents
        });
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/login');
        }
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  if (loading) return <div className="dashboard-loading"><span className="spinner"></span></div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>Admin Dashboard</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => navigate('/admin-users')} className="logout-btn" style={{ borderColor: '#10B981', color: '#FFF' }}>
            Users
          </button>
          <button onClick={() => navigate('/admin-events')} className="logout-btn" style={{ borderColor: '#F59E0B', color: '#FFF' }}>
            Events
          </button>
          <button onClick={() => navigate('/reports')} className="logout-btn" style={{ borderColor: '#2563EB', color: '#FFF' }}>
            Reports
          </button>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>
      
      <div className="metrics-grid">
        <div className="metric-card user-card">
          <div className="metric-icon"><Users size={32} color="#FFFFFF" /></div>
          <div className="metric-info">
            <h3>Total Users</h3>
            <p className="metric-value">{metrics.totalUsers}</p>
          </div>
        </div>

        <div className="metric-card event-card">
          <div className="metric-icon"><Calendar size={32} color="#FFFFFF" /></div>
          <div className="metric-info">
            <h3>Total Events</h3>
            <p className="metric-value">{metrics.totalEvents}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
