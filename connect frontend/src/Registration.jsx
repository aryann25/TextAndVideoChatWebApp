import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from './services/authService';

export default function Registration() {
  const [formData, setFormData] = useState({
    firstName: '', middleName: '', lastName: '', birthDate: '', mobile: ''
  });
  const navigate = useNavigate();

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    const { firstName, lastName, birthDate, mobile } = formData;
    if (!firstName || !lastName || !birthDate || !mobile) return alert('Please fill all mandatory fields');

    try {
      await authService.register(formData);
      authService.saveMobile(mobile); // save mobile for OTPVerification
      alert('Registration successful! OTP sent to your mobile.');
      navigate('/verify-otp');
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #d8b5ff, #ffc6e3, #c084fc)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '500px', background: 'white', borderRadius: '2rem', padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Register</h2>
        {['firstName', 'middleName', 'lastName', 'birthDate', 'mobile'].map(field => (
          <div key={field} style={{ marginBottom: '1rem' }}>
            <label>{field === 'birthDate' ? 'Birth Date' : field.replace(/([A-Z])/g, ' $1')}{field !== 'middleName' && '*'}</label>
            <input
              type={field === 'birthDate' ? 'date' : (field === 'mobile' ? 'tel' : 'text')}
              name={field}
              value={formData[field]}
              onChange={handleChange}
              placeholder={field === 'middleName' ? 'Optional' : `Enter ${field}`}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '2px solid #e9d5ff' }}
            />
          </div>
        ))}
        <button onClick={handleSubmit} style={{ width: '100%', padding: '1rem', background: '#4f46e5', color: 'white', borderRadius: '1rem', border: 'none' }}>Register</button>
      </div>
    </div>
  );
}
