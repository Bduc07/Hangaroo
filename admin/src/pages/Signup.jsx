import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import './Login.css';

const Signup = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) {
      setError('Please fill out all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await axios.post('http://localhost:3000/api/v1/admin/signup', { firstName, lastName, email, password });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box" style={{ maxWidth: '450px' }}>
        <h1 className="welcome-text">Admin Signup</h1>
        
        {error && <p className="error-text">{error}</p>}
        
        <form onSubmit={handleSignup} className="login-form">
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
             <input
               type="text"
               placeholder="First Name"
               className="input-box"
               value={firstName}
               onChange={(e) => setFirstName(e.target.value)}
               style={{ marginBottom: 0, flex: 1 }}
             />
             <input
               type="text"
               placeholder="Last Name"
               className="input-box"
               value={lastName}
               onChange={(e) => setLastName(e.target.value)}
               style={{ marginBottom: 0, flex: 1 }}
             />
          </div>

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

          <button type="submit" className="login-button" disabled={loading} style={{ marginTop: '16px' }}>
            {loading ? <span className="spinner"></span> : 'Sign Up'}
          </button>

          <p style={{ textAlign: "center", marginTop: "16px", color: "#FFFFFF", fontSize: "14px" }}>
             Already have an account? <span style={{ color: "#2563EB", cursor: "pointer", fontWeight: "700" }} onClick={() => navigate('/login')}>Log In</span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
