import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from './services/authService';

export default function OTPVerification() {
  const [otp, setOTP] = useState('');
  const navigate = useNavigate();
  const [mobile, setMobile] = useState('');

  // Get mobile number from authService
  useEffect(() => {
    const savedMobile = authService.getMobile();
    if (!savedMobile) {
      navigate('/register'); // Redirect if no mobile stored
    } else {
      setMobile(savedMobile);
    }
  }, [navigate]);

  const handleVerify = async () => {
    if (!otp) return alert('Enter OTP');

    try {
      // Call backend to verify OTP
      await authService.verifyOTP(mobile, otp);
      alert('OTP verified successfully!');
      navigate('/dashboard'); // Navigate to dashboard after success
    } catch (err) {
      // Show backend error message
      alert(err.response?.data?.message || 'Invalid OTP');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #d8b5ff, #ffc6e3, #c084fc)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'white',
        borderRadius: '2rem',
        padding: '2rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: '#6b21a8' }}>Verify OTP</h2>
        <p style={{ color: '#6b21a8' }}>Enter OTP sent to {mobile}</p>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOTP(e.target.value)}
          placeholder="Enter OTP"
          style={{
            width: '100%',
            padding: '0.75rem',
            marginBottom: '1rem',
            borderRadius: '0.75rem',
            border: '2px solid #e9d5ff',
            fontSize: '1rem'
          }}
        />
        <button
          onClick={handleVerify}
          style={{
            width: '100%',
            padding: '1rem',
            background: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '1rem',
            fontSize: '1rem',
            fontWeight: '600'
          }}
        >
          Verify
        </button>
      </div>
    </div>
  );
}
