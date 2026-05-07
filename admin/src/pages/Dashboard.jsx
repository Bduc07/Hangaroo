import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, Calendar, LogOut, Star, Flame, Activity } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({ 
    totalUsers: 0, 
    totalEvents: 0,
    topHost: null,
    popularEvent: null,
    last7Days: { events: 0, users: 0, chart: [] }
  });
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
          totalUsers: response.data.totalUsers || 0,
          totalEvents: response.data.totalEvents || 0,
          topHost: response.data.topHost,
          popularEvent: response.data.popularEvent,
          last7Days: response.data.last7Days || { events: 0, users: 0, chart: [] }
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

  if (loading) return (
    <div className="flex justify-center items-center h-screen w-full">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="p-10 w-full max-w-6xl mx-auto animate-[fadeIn_0.4s_ease-out]">
      <header className="flex justify-between items-center mb-12">
        <h2 className="text-3xl m-0 font-bold tracking-tight">Admin Dashboard</h2>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/admin-users')} 
            className="flex items-center gap-2 bg-transparent text-white border border-emerald-500 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:bg-emerald-500/10 hover:text-emerald-500"
          >
            Users
          </button>
          <button 
            onClick={() => navigate('/admin-events')} 
            className="flex items-center gap-2 bg-transparent text-white border border-amber-500 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:bg-amber-500/10 hover:text-amber-500"
          >
            Events
          </button>
          <button 
            onClick={() => navigate('/reports')} 
            className="flex items-center gap-2 bg-transparent text-white border border-blue-600 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:bg-blue-600/10 hover:text-blue-600"
          >
            Reports
          </button>
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 bg-transparent text-white border border-red-500 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:bg-red-500/10 hover:text-red-500"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>
      
      <h3 className="text-xl font-semibold mb-6 text-gray-200">Platform Overview</h3>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 mb-10">
        <div className="bg-[#22232A] rounded-2xl p-6 flex flex-col gap-4 border border-transparent transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:border-blue-600/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-600/20">
              <Users size={24} color="#3b82f6" />
            </div>
            <div>
              <h4 className="text-sm text-gray-400 m-0 font-medium">Total Users</h4>
              <p className="text-3xl font-bold m-0 text-white leading-none mt-1">{metrics.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#22232A] rounded-2xl p-6 flex flex-col gap-4 border border-transparent transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:border-emerald-500/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-500/20">
              <Calendar size={24} color="#10b981" />
            </div>
            <div>
              <h4 className="text-sm text-gray-400 m-0 font-medium">Total Events</h4>
              <p className="text-3xl font-bold m-0 text-white leading-none mt-1">{metrics.totalEvents}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#22232A] rounded-2xl p-6 flex flex-col justify-between border border-transparent transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:border-purple-500/50 row-span-2 col-span-1 md:col-span-2 lg:col-span-1 lg:row-span-1 h-full min-h-[160px]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl flex shrink-0 items-center justify-center bg-purple-500/20">
              <Activity size={24} color="#a855f7" />
            </div>
            <div>
              <h4 className="text-sm text-gray-400 m-0 font-medium">Last 7 Days (Data Analysis)</h4>
              <p className="text-sm font-medium text-white m-0">+{metrics.last7Days.users} Users, +{metrics.last7Days.events} Events</p>
            </div>
          </div>
          
          {/* Mini Chart */}
          <div className="flex items-end h-20 gap-2 mt-auto pt-2 border-t border-gray-700/50">
            {metrics.last7Days.chart && metrics.last7Days.chart.map((day, idx) => {
              // Calculate rough percentages for bar heights (max height 100%)
              const maxVal = Math.max(...metrics.last7Days.chart.flatMap(d => [d.newUsers, d.newEvents])) || 1;
              const userHeight = (day.newUsers / maxVal) * 100;
              const eventHeight = (day.newEvents / maxVal) * 100;
              
              return (
                <div key={idx} className="flex-1 flex flex-col justify-end items-center gap-1 group relative">
                  <div className="flex gap-[2px] w-full justify-center items-end h-14">
                    <div className="w-[8px] bg-blue-500/70 rounded-sm transition-all group-hover:bg-blue-400" style={{ height: `${Math.max(userHeight, 5)}%` }}></div>
                    <div className="w-[8px] bg-emerald-500/70 rounded-sm transition-all group-hover:bg-emerald-400" style={{ height: `${Math.max(eventHeight, 5)}%` }}></div>
                  </div>
                  <span className="text-[10px] text-gray-500 uppercase font-semibold">{day.date.charAt(0)}</span>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap pointer-events-none border border-gray-700 z-10">
                    <span className="text-blue-400 font-bold">{day.newUsers}</span> U · <span className="text-emerald-400 font-bold">{day.newEvents}</span> E
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-6 text-gray-200">Insights & Highlights</h3>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
        {metrics.topHost ? (
          <div className="bg-gradient-to-br from-[#22232A] to-[#2a2b36] rounded-2xl p-6 flex items-start gap-5 border border-amber-500/30 shadow-lg relative overflow-hidden group hover:border-amber-500/60 transition-colors duration-300">
            <div className="absolute -right-6 -top-6 text-amber-500/5 group-hover:text-amber-500/10 transition-colors duration-500 pointer-events-none">
              <Star size={120} />
            </div>
            <div className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center bg-amber-500/20 z-10">
              <Star size={28} className="text-amber-400" />
            </div>
            <div className="z-10 bg-transparent flex-1">
              <h4 className="text-sm text-amber-400 uppercase tracking-wider mb-2 font-bold">Top Event Host</h4>
              <p className="text-2xl font-bold m-0 text-white">{metrics.topHost.firstName} {metrics.topHost.lastName}</p>
              <p className="text-sm font-medium text-gray-400 mt-1">{metrics.topHost.email}</p>
              <div className="inline-block mt-4 px-3 py-1 bg-amber-500/20 rounded-full border border-amber-500/40">
                <span className="text-amber-400 text-sm font-bold">{metrics.topHost.eventCount} Events Created</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#22232A] rounded-2xl p-6 flex items-center justify-center border border-gray-700">
            <p className="text-gray-400 italic">No host data available yet.</p>
          </div>
        )}

        {metrics.popularEvent ? (
          <div className="bg-gradient-to-br from-[#22232A] to-[#2a2b36] rounded-2xl p-6 flex items-start gap-5 border border-rose-500/30 shadow-lg relative overflow-hidden group hover:border-rose-500/60 transition-colors duration-300">
            <div className="absolute -right-6 -bottom-6 text-rose-500/5 group-hover:text-rose-500/10 transition-colors duration-500 pointer-events-none">
              <Flame size={120} />
            </div>
            <div className="w-14 h-14 flex-shrink-0 rounded-xl flex items-center justify-center bg-rose-500/20 z-10">
              <Flame size={28} className="text-rose-400" />
            </div>
            <div className="z-10 bg-transparent flex-1">
              <h4 className="text-sm text-rose-400 uppercase tracking-wider mb-2 font-bold">Most Popular Event</h4>
              <p className="text-xl font-bold m-0 text-white line-clamp-2">{metrics.popularEvent.title}</p>
              <div className="inline-block mt-4 px-3 py-1 bg-rose-500/20 rounded-full border border-rose-500/40">
                <span className="text-rose-400 text-sm font-bold">{metrics.popularEvent.numParticipants} Attendees</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#22232A] rounded-2xl p-6 flex items-center justify-center border border-gray-700">
            <p className="text-gray-400 italic">No event data available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
