import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Trash2, ArrowLeft } from 'lucide-react';
import './Reports.css';

const ManageEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get('http://localhost:3000/api/v1/admin/events', { headers: { Authorization: `Bearer ${token}` }});
      setEvents(res.data.events || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (eventId) => {
    if(!window.confirm("Permanently delete this event?")) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`http://localhost:3000/api/v1/admin/events/${eventId}`, { headers: { Authorization: `Bearer ${token}` }});
      fetchEvents();
    } catch(err) {
      alert("Failed to delete event");
    }
  };

  return (
    <div className="reports-container">
      <header className="reports-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="back-btn" onClick={() => navigate('/dashboard')}><ArrowLeft size={20} /></button>
          <h2>Manage Events</h2>
        </div>
      </header>
      <div className="reports-list">
        {events.map(ev => (
          <div key={ev._id} className="report-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p className="report-event-title">{ev.title}</p>
              <p className="report-date">Host: {ev.host?.email || 'N/A'}</p>
            </div>
            <button onClick={() => handleDelete(ev._id)} style={{ background: '#ef4444', border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer', color: 'white' }}>
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ManageEvents;
