import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from './services/authService';

export default function Login() {
  const [mobile, setMobile] = useState('');
  const navigate = useNavigate();

  const handleOTP = async () => {
    if (!mobile) return alert('Enter mobile number');

    try {
      await authService.requestOTP(mobile); // Call backend to send OTP
      authService.saveMobile(mobile);       // Save mobile for OTP verification
      alert('OTP sent successfully to your mobile!');
      navigate('/verify-otp', { state: { mobile } });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #d8b5ff, #ffc6e3, #c084fc)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <h1 style={{
        color: '#6b21a8',
        fontSize: '4rem',
        fontWeight: 'bold',
        marginBottom: '4rem',
        textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
      }}>Connect</h1>

      <div style={{ position: 'relative', marginBottom: '4rem' }}>
        <div style={{
          backgroundColor: '#fffbeb',
          borderRadius: '50%',
          padding: '2.5rem 4rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          textAlign: 'center'
        }}>
          <span style={{ color: '#fdba74', fontSize: '2rem', fontWeight: '300' }}>hi</span>
        </div>
        <div style={{
          position: 'absolute',
          bottom: '-1rem',
          left: '3rem',
          width: '2rem',
          height: '2rem',
          backgroundColor: '#fffbeb',
          borderRadius: '50%',
          boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-2rem',
          left: '1.5rem',
          width: '1.25rem',
          height: '1.25rem',
          backgroundColor: '#fffbeb',
          borderRadius: '50%',
          boxShadow: '0 3px 10px rgba(0,0,0,0.08)'
        }}></div>
      </div>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '2rem',
        padding: '1.5rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="tel"
            placeholder="Enter Mobile Number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              fontSize: '1.5rem',
              padding: '1rem',
              borderRadius: '1rem',
              outline: 'none'
            }}
          />
          <button onClick={handleOTP} style={{
            backgroundColor: '#4f46e5',
            color: 'white',
            fontSize: '1.2rem',
            fontWeight: '600',
            padding: '1rem 2rem',
            borderRadius: '1rem',
            border: 'none'
          }}>
            OTP
          </button>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem', color: 'white' }}>
        <p style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Don't have account?</p>
        <Link to="/register" style={{ color: '#4f46e5', fontSize: '1.5rem', fontWeight: '600', textDecoration: 'none' }}>Register</Link>
      </div>
    </div>
  );
}
