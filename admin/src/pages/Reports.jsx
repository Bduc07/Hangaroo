import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import './Reports.css';

const Reports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          navigate('/login');
          return;
        }
        const response = await axios.get('http://localhost:3000/api/v1/admin/reports', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReports(response.data.reports || []);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/login');
        }
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [navigate]);

  if (loading) return <div className="dashboard-loading"><span className="spinner"></span></div>;

  return (
    <div className="reports-container">
      <header className="reports-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="back-btn" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={20} />
          </button>
          <h2>Event Reports</h2>
        </div>
      </header>

      <div className="reports-list">
        {reports.length === 0 ? (
          <div className="no-reports">
            <AlertTriangle size={48} color="#616161" />
            <p>No reports have been submitted yet.</p>
          </div>
        ) : (
          reports.map((report) => (
            <div key={report._id} className="report-card">
              <div className="report-card-header">
                <span className="report-event-title">{report.eventId?.title || 'Unknown Event'}</span>
                <span className="report-date">{new Date(report.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="report-reason">"{report.reason}"</p>
              <div className="report-card-footer">
                <span className="report-user">Reported by: {report.userId?.email || 'Unknown User'}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Reports;
