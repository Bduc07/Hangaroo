import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:3000/api/v1/admin/signin', { email, password });
      localStorage.setItem('adminToken', response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="welcome-text">Admin Panel</h1>
        
        {error && <p className="error-text">{error}</p>}
        
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="email"
            placeholder="Admin Email"
            className="input-box"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="password-container">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              className="password-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" className="eye-button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={20} color="#616161" /> : <Eye size={20} color="#616161" />}
            </button>
          </div>

          <p className="forgot-password">Forget Password?</p>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? <span className="spinner"></span> : 'Log In'}
          </button>
          
          <p style={{ textAlign: "center", marginTop: "16px", color: "#FFFFFF", fontSize: "14px" }}>
             Don't have an account? <span style={{ color: "#2563EB", cursor: "pointer", fontWeight: "700" }} onClick={() => navigate('/signup')}>Sign up</span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
